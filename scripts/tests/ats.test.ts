import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildCvSegments, roleCoverage, scoreProfileCv } from "../lib/scoring/ats.js";
import { matchAliases } from "../lib/scoring/keyword-match.js";
import { midDoc, richHeadlineDoc, sparseDoc } from "./fixtures.js";

describe("ATS scoring", () => {
  it("scores a headline-complete CV at exactly 100", () => {
    const report = scoreProfileCv(richHeadlineDoc, "aiEngineer");
    assert.equal(report.score, 100);
    assert.equal(report.coverage, 100);
    assert.equal(report.mustHaveCoverage, 100);
    assert.equal(report.missing.length, 0);
    assert.ok(report.matched.every((keyword) => keyword.points === 3));
  });

  it("scores a keyword-free CV at exactly 0 for every role", () => {
    for (const role of ["aiEngineer", "automationEngineer", "developerPlusAi", "overallAverage"] as const) {
      const report = scoreProfileCv(sparseDoc, role);
      assert.equal(report.score, 0, role);
      assert.equal(report.coverage, 0, role);
      assert.equal(report.mustHaveCoverage, 0, role);
    }
  });

  it("weights placement headline > summary/skills > body (hand-computed)", () => {
    // 945 / (2006.4 × 3) × 100 = 15.71; coverage 529/2006.4 = 26.37 → 26.4; must-have 409/800 = 51.1
    const report = scoreProfileCv(midDoc, "aiEngineer");
    assert.equal(report.score, 15.7);
    assert.equal(report.coverage, 26.4);
    assert.equal(report.mustHaveCoverage, 51.1);
  });

  it("records placement segments and points per keyword", () => {
    const report = scoreProfileCv(midDoc, "aiEngineer");
    const byKeyword = new Map(report.matched.map((item) => [item.keyword, item]));

    assert.deepEqual(byKeyword.get("Python")?.segments, ["headline"]);
    assert.equal(byKeyword.get("Python")?.points, 3);
    assert.deepEqual(byKeyword.get("RAG (Retrieval-Augmented Gen)")?.segments, ["summary"]);
    assert.equal(byKeyword.get("RAG (Retrieval-Augmented Gen)")?.points, 2);
    assert.deepEqual(byKeyword.get("LangChain / LangGraph")?.segments, ["experience"]);
    assert.equal(byKeyword.get("LangChain / LangGraph")?.points, 1);
    assert.deepEqual(byKeyword.get("Docker / Containerization")?.segments, ["projects"]);
  });

  it("sorts missing keywords by prevalence desc, ties by dataset order", () => {
    const report = scoreProfileCv(midDoc, "aiEngineer");
    const topMissing = report.missing.slice(0, 5).map((item) => item.keyword);
    assert.deepEqual(topMissing, [
      "Git / Version Control", // 90
      "PyTorch", // 82
      "Pinecone / Qdrant / Weaviate", // 75
      "OpenAI API / Claude / Gemini", // 72
      "AWS (SageMaker/Bedrock/Lambda)", // 72 (later in dataset order)
    ]);
  });

  it("is deterministic across runs", () => {
    const a = JSON.stringify(scoreProfileCv(midDoc, "aiEngineer"));
    const b = JSON.stringify(scoreProfileCv(midDoc, "aiEngineer"));
    assert.equal(a, b);
  });

  it("does not match multi-word aliases across joined field boundaries", () => {
    // With a naive space join, a field ending in "REST" followed by one starting
    // with "APIs…" would false-match the "rest apis" alias. The "\n" join keeps
    // the word boundary while blocking cross-field phrase matches.
    const doc = {
      ...sparseDoc,
      experience: [
        {
          role: "Platform REST",
          company: "APIs Platform",
          start: "2020-01",
          end: null,
          highlights: [],
          tech: [],
        },
      ],
    };
    const experience = buildCvSegments(doc).find((segment) => segment.id === "experience");
    assert.ok(experience);
    assert.deepEqual(matchAliases(experience.text, ["rest apis"]), []);
    // single-word aliases still match up to the boundary
    assert.deepEqual(matchAliases(experience.text, ["rest"]), ["rest"]);
    assert.deepEqual(matchAliases(experience.text, ["apis"]), ["apis"]);
  });

  it("computes free-text role coverage", () => {
    // (90 + 43.3) / 1827.1 × 100 = 7.30… → 7.3
    assert.equal(roleCoverage("Python and RAG", "overallAverage"), 7.3);
    assert.equal(roleCoverage("nothing here", "aiEngineer"), 0);
  });
});
