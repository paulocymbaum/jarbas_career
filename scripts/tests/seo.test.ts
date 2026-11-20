import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { scoreSiteSeo, scoreStaticHead } from "../lib/scoring/seo.js";
import { enhancedHeadHtml, makeSite, minimalHeadHtml } from "./fixtures.js";

describe("SEO scoring", () => {
  it("scores the original-style head at exactly 28/45", () => {
    const checks = scoreStaticHead(minimalHeadHtml);
    const total = checks.reduce((sum, check) => sum + check.earned, 0);
    assert.equal(total, 28);

    const byId = new Map(checks.map((check) => [check.id, check]));
    assert.equal(byId.get("title-present")?.earned, 5);
    assert.equal(byId.get("title-length")?.earned, 5);
    assert.equal(byId.get("description-present")?.earned, 5);
    assert.equal(byId.get("description-length")?.earned, 5);
    assert.equal(byId.get("og-og:title")?.earned, 0);
    assert.equal(byId.get("twitter-card")?.earned, 0);
    assert.equal(byId.get("jsonld-person")?.earned, 0);
    assert.equal(byId.get("html-lang")?.earned, 3);
    assert.equal(byId.get("viewport")?.earned, 3);
    assert.equal(byId.get("favicon")?.earned, 2);
  });

  it("scores a fully equipped head at exactly 45/45", () => {
    const checks = scoreStaticHead(enhancedHeadHtml);
    const total = checks.reduce((sum, check) => sum + check.earned, 0);
    assert.equal(total, 45);
  });

  it("rewards keyword coverage of the site copy (hand-computed)", () => {
    // Story text "Python and RAG": (90 + 43.3) / 1827.1 × 15 ≈ 1.09 → 1.1
    const report = scoreSiteSeo({
      indexHtml: minimalHeadHtml,
      site: makeSite({ pitch: "Python and RAG" }),
    });
    assert.equal(report.staticScore, 28);
    assert.equal(report.contentScore, 1.1);
    assert.equal(report.score, 29.1);
  });

  it("scores per-profile copy against each profile's role target", () => {
    const report = scoreSiteSeo({
      indexHtml: minimalHeadHtml,
      site: makeSite({
        pitch: "nothing",
        professionalProfiles: [
          {
            title: "AI Engineer",
            slug: "ai-engineer",
            summary: "RAG pipelines with LangChain on Python and FastAPI",
            description: "PostgreSQL, REST API, CI/CD",
            stack: [],
            skills: [],
            accent: "",
            resumeUrl: "/resumes/ai.pdf",
          },
        ],
      }),
    });
    const profileCheck = report.checks.find((check) => check.id === "profile-ai-engineer");
    assert.ok(profileCheck);
    // Matched AI-column rows: RAG 88, LangChain 78, Python 95, FastAPI 70, PostgreSQL 68,
    // REST 65, CI/CD 52 → 516 / 1984 × 10 = 2.600… → 2.6
    assert.equal(profileCheck.earned, 2.6);
  });

  it("is deterministic across runs", () => {
    const input = {
      indexHtml: enhancedHeadHtml,
      site: makeSite({ pitch: "Python and RAG" }),
    };
    const a = JSON.stringify(scoreSiteSeo(input));
    const b = JSON.stringify(scoreSiteSeo(input));
    assert.equal(a, b);
  });
});
