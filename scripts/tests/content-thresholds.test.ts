// Threshold tests against the REAL portfolio content (data/portfolio.db + index.html).
// Floors are pinned to the improved-copy audit values — lowering the copy quality
// (regressions) fails these tests. Raise floors deliberately as copy improves.

import assert from "node:assert/strict";
import { before, describe, it } from "node:test";
import { loadAuditInput } from "../lib/audit-source.js";
import { scoreProfileCv, type AtsReport } from "../lib/scoring/ats.js";
import { scoreSiteSeo, type SeoReport } from "../lib/scoring/seo.js";
import { scoreFreelancePageSeo, type FreelanceSeoReport } from "../lib/scoring/seo-freelance.js";
import { freelanceContent } from "../../src/content/freelance.js";
import { PROFILE_ROLE_TARGETS } from "../lib/scoring/market-insights.js";

// --- Pinned floors (update deliberately when copy improves) ---
// Pinned to the 2026-11 v8 audit after the full-stack market-scan dataset
// expansion (+10 keyword rows measured from 21 full-stack postings).
// v7 pass: ai-engineer 60.0/87.0/80.8, fullstack 57.8/79.8/100, product 45.0/72.8/100.
// v6 pass: ai-engineer 59.6/85.8/80.8, fullstack 57.8/79.8/100, product 38.8/61.4/100.
const ATS_FLOORS: Record<string, { score: number; coverage: number; mustHaveCoverage: number }> = {
  "ai-engineer": { score: 55.9, coverage: 82.3, mustHaveCoverage: 80.8 },
  "fullstack-engineer": { score: 49.4, coverage: 69.3, mustHaveCoverage: 100 },
  "product-engineer": { score: 41.2, coverage: 67.2, mustHaveCoverage: 100 },
};
const SEO_FLOOR = 74.7;
// /freelance page: static head (45) + freelance positioning (20) + copy coverage (35).
const FREELANCE_SEO_FLOOR = 99;

// Keywords that MUST be present for each profile after the improvement pass.
const REQUIRED_KEYWORDS: Record<string, string[]> = {
  "ai-engineer": [
    "RAG (Retrieval-Augmented Gen)",
    "LangChain / LangGraph",
    "PostgreSQL (PGVector)",
    "FastAPI / Flask / Express",
    "Git / Version Control",
    "RESTful API / GraphQL",
    "Pinecone / Qdrant / Weaviate",
    "System Design & Architecture",
    "Hugging Face / Transformers",
    "Bash / PowerShell",
    "Docker / Containerization",
    "Microservices Architecture",
    "OpenAI API / Claude / Gemini",
    "LlamaIndex / CrewAI",
    "Kubernetes (K8s)",
    "Redis / Cache",
    "MongoDB / NoSQL",
    "Python",
    "CI/CD (Jenkins/GitLab/Actions)",
  ],
  "fullstack-engineer": [
    "RESTful API / GraphQL",
    "React / Next.js",
    "TypeScript",
    "PostgreSQL (PGVector)",
    "FastAPI / Flask / Express",
    "SQL",
    "Git / Version Control",
    "System Design & Architecture",
    "API Testing (Postman/RestAssured)",
    "Bash / PowerShell",
    "Docker / Containerization",
    "Microservices Architecture",
    "OpenAI API / Claude / Gemini",
    "LlamaIndex / CrewAI",
    "Kubernetes (K8s)",
    "Redis / Cache",
    "MongoDB / NoSQL",
    "CI/CD (Jenkins/GitLab/Actions)",
  ],
  "product-engineer": [
    "Git / Version Control",
    "Python",
    "RESTful API / GraphQL",
    "CI/CD (Jenkins/GitLab/Actions)",
    "Docker / Containerization",
    "SQL",
    "FastAPI / Flask / Express",
    "JavaScript",
    "LangChain / LangGraph",
    "LlamaIndex / CrewAI",
    "Kubernetes (K8s)",
    "Redis / Cache",
    "MongoDB / NoSQL",
  ],
};

let ats: AtsReport[];
let seo: SeoReport;
let freelanceSeo: FreelanceSeoReport;

before(() => {
  const { site, documents, indexHtml, freelanceHtml } = loadAuditInput();
  seo = scoreSiteSeo({ indexHtml, site });
  freelanceSeo = scoreFreelancePageSeo({ freelanceHtml, content: freelanceContent });
  ats = documents.map((doc) => {
    const target = PROFILE_ROLE_TARGETS[doc.slug];
    assert.ok(target, `role target missing for ${doc.slug}`);
    return scoreProfileCv(doc, target);
  });
});

describe("real content thresholds", () => {
  it("scores every profile at or above its pinned ATS floor", () => {
    for (const [slug, floor] of Object.entries(ATS_FLOORS)) {
      const report = ats.find((item) => item.slug === slug);
      assert.ok(report, `CV document for ${slug}`);
      assert.ok(report.score >= floor.score, `${slug} ATS score ${report.score} < ${floor.score}`);
      assert.ok(
        report.coverage >= floor.coverage,
        `${slug} coverage ${report.coverage} < ${floor.coverage}`,
      );
      assert.ok(
        report.mustHaveCoverage >= floor.mustHaveCoverage,
        `${slug} must-have ${report.mustHaveCoverage} < ${floor.mustHaveCoverage}`,
      );
    }
  });

  it("keeps required keywords present for each profile", () => {
    for (const [slug, required] of Object.entries(REQUIRED_KEYWORDS)) {
      const report = ats.find((item) => item.slug === slug);
      assert.ok(report, `CV document for ${slug}`);
      const matched = new Set(report.matched.map((item) => item.keyword));
      for (const keyword of required) {
        assert.ok(matched.has(keyword), `${slug} lost required keyword "${keyword}"`);
      }
    }
  });

  it("scores the site at or above its pinned SEO floor", () => {
    assert.ok(seo.score >= SEO_FLOOR, `SEO score ${seo.score} < ${SEO_FLOOR}`);
  });

  it("scores the /freelance page at or above its pinned SEO floor", () => {
    assert.ok(
      freelanceSeo.score >= FREELANCE_SEO_FLOOR,
      `freelance SEO score ${freelanceSeo.score} < ${FREELANCE_SEO_FLOOR}`,
    );
  });

  it("is deterministic across runs", () => {
    const second = loadAuditInput();
    const seoAgain = scoreSiteSeo({ indexHtml: second.indexHtml, site: second.site });
    const freelanceSeoAgain = scoreFreelancePageSeo({
      freelanceHtml: second.freelanceHtml,
      content: freelanceContent,
    });
    const atsAgain = second.documents.map((doc) =>
      scoreProfileCv(doc, PROFILE_ROLE_TARGETS[doc.slug]!),
    );
    assert.equal(JSON.stringify(seo), JSON.stringify(seoAgain));
    assert.equal(JSON.stringify(freelanceSeo), JSON.stringify(freelanceSeoAgain));
    assert.equal(JSON.stringify(ats), JSON.stringify(atsAgain));
  });
});
