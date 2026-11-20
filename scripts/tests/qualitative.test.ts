import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  QUALITATIVE_CRITERIA,
  qualitativeComposite,
  REVIEWER_PERSONA,
  scaffoldQualitativeEntries,
  scaffoldQualitativeJson,
  TRUTH_LOCK_ID,
  validateQualitativeJson,
  type QualitativeJson,
} from "../jd/lib/qualitative.js";
import { buildGateJson, type GateJson } from "../jd/lib/gate.js";
import { renderGateReportMarkdown, scoreCvAgainstGate } from "../jd/lib/score.js";

const COMPLETE_CV = `# Your Name
Alpha | Beta engineer

## Summary
alpha and beta

## Skills
gamma

## Experience
alpha delivery

## Projects
delta

## Education & Certifications
BSc
`;

function fixtureGate(overrides?: Partial<GateJson["thresholds"]>): GateJson {
  const gate = buildGateJson({
    version: 1,
    source: { type: "file", value: "fixture.txt" },
    role: "Alpha",
    company: "Acme",
    location: null,
    dir: "Alpha - Acme",
    summary: "",
    requirements: [],
    responsibilities: [],
    niceToHave: [],
    keywords: [],
    extraKeywords: [
      { term: "Alpha", weight: 3, aliases: ["alpha"] },
      { term: "Beta", weight: 3, aliases: ["beta"] },
      { term: "Gamma", weight: 2, aliases: ["gamma"] },
      { term: "Delta", weight: 1, aliases: ["delta"] },
    ],
  });
  return { ...gate, thresholds: { ...gate.thresholds, ...overrides } };
}

function qualitativeEntries(scores: Record<string, number>): QualitativeJson["criteria"] {
  return QUALITATIVE_CRITERIA.map((criterion) => ({
    id: criterion.id,
    score: scores[criterion.id] ?? 100,
    evidence: `${criterion.label}: fixture evidence quote`,
  }));
}

describe("Qualitative rubric", () => {
  it("defines unique ids and a hard truth-lock criterion", () => {
    const ids = QUALITATIVE_CRITERIA.map((criterion) => criterion.id);
    assert.equal(new Set(ids).size, ids.length);
    const truthLock = QUALITATIVE_CRITERIA.find((criterion) => criterion.id === TRUTH_LOCK_ID);
    assert.ok(truthLock);
    assert.equal(truthLock.weight, 3);
    assert.ok(
      QUALITATIVE_CRITERIA.every((criterion) => criterion.weight >= 1 && criterion.checks.length > 20),
    );
    // 3 (truth lock) + 2×6 + 1 (parsing safety) — pins the composite denominator.
    const totalWeight = QUALITATIVE_CRITERIA.reduce((sum, criterion) => sum + criterion.weight, 0);
    assert.equal(totalWeight, 16);
  });

  it("casts the reviewer as the hiring side", () => {
    assert.equal(REVIEWER_PERSONA.id, "tech-recruitment-manager");
    assert.equal(REVIEWER_PERSONA.label, "Tech recruitment manager");
    assert.ok(REVIEWER_PERSONA.brief.includes("recruitment manager"));
    assert.ok(REVIEWER_PERSONA.brief.includes("shortlist"));
  });

  it("validates structure, ids, ranges, and evidence", () => {
    const good: QualitativeJson = {
      version: 1,
      criteria: qualitativeEntries({ "truth-lock": 100 }),
      notes: "reviewed after iteration 2",
    };
    assert.deepEqual(validateQualitativeJson(good), []);
    assert.ok(validateQualitativeJson(null).length > 0);
    assert.ok(validateQualitativeJson({}).length > 0);
  });

  it("flags unknown, unscored, out-of-range, and evidence-less entries", () => {
    const unknown = validateQualitativeJson({
      version: 1,
      criteria: [{ id: "made-up", score: 50, evidence: "unknown id here" }],
    });
    assert.ok(unknown.some((problem) => problem.includes("Unknown criterion")));
    assert.ok(unknown.some((problem) => problem.includes("Missing criterion")));

    const unscored: QualitativeJson = {
      version: 1,
      criteria: qualitativeEntries({}).map((entry) =>
        entry.id === "truth-lock" ? { ...entry, score: null } : entry,
      ),
    };
    assert.ok(validateQualitativeJson(unscored).some((problem) => problem.includes("not graded")));

    const outOfRange: QualitativeJson = {
      version: 1,
      criteria: qualitativeEntries({}).map((entry) =>
        entry.id === "jd-language" ? { ...entry, score: 150 } : entry,
      ),
    };
    assert.ok(validateQualitativeJson(outOfRange).some((problem) => problem.includes("0–100")));

    const noEvidence: QualitativeJson = {
      version: 1,
      criteria: qualitativeEntries({}).map((entry) =>
        entry.id === "star-bullets" ? { ...entry, evidence: "ok" } : entry,
      ),
    };
    assert.ok(validateQualitativeJson(noEvidence).some((problem) => problem.includes("evidence")));
  });

  it("computes the weighted composite by hand", () => {
    // (3×100 + 2×80 + 2×60 + 2×100 + 2×70 + 2×90 + 2×40 + 1×100) / 16 = 1280 / 16 = 80
    const composite = qualitativeComposite(
      qualitativeEntries({
        "truth-lock": 100,
        "six-second-scan": 80,
        "screen-out-check": 60,
        "jd-language": 100,
        "star-bullets": 70,
        "seniority-signals": 90,
        "red-flags": 40,
      }),
    );
    assert.equal(composite, 80);
  });

  it("scaffolds preserve graded entries and drop unknown ids", () => {
    const scaffolded = scaffoldQualitativeEntries([
      { id: "truth-lock", score: 100, evidence: "kept" },
      { id: "made-up", score: 90, evidence: "dropped" },
      { id: "jd-language", score: 40, evidence: "kept too" },
    ]);
    assert.deepEqual(
      scaffolded.map((entry) => entry.id),
      QUALITATIVE_CRITERIA.map((criterion) => criterion.id),
    );
    const byId = new Map(scaffolded.map((entry) => [entry.id, entry]));
    assert.equal(byId.get("truth-lock")?.score, 100);
    assert.equal(byId.get("truth-lock")?.evidence, "kept");
    assert.equal(byId.get("jd-language")?.score, 40);
    assert.equal(byId.get("star-bullets")?.score, null);
    assert.ok(!byId.has("made-up"));

    const json = scaffoldQualitativeJson(null);
    assert.equal(json.reviewer, REVIEWER_PERSONA.id);
    assert.deepEqual(
      json.criteria.map((entry) => entry.id),
      QUALITATIVE_CRITERIA.map((criterion) => criterion.id),
    );
  });
});

describe("Qualitative blending in the gate score", () => {
  const graded = (): QualitativeJson => ({
    version: 1,
    reviewer: REVIEWER_PERSONA.id,
    criteria: qualitativeEntries({
      "truth-lock": 100,
      "six-second-scan": 80,
      "screen-out-check": 80,
      "jd-language": 80,
      "star-bullets": 80,
      "seniority-signals": 80,
      "red-flags": 80,
      "ats-format": 80,
    }),
  });

  it("blends the nota by weight (hand-computed)", () => {
    // Quantitative: Alpha 3×3 + Beta 3×3 + Gamma 2×2 + Delta 1×1 = 23 / 27 → 85.2
    // Qualitative: 3×100 + 13×80 = 1340 / 16 = 83.75 → 83.8
    // Overall: 0.7 × 85.2 + 0.3 × 83.8 = 84.78 → 84.8
    const result = scoreCvAgainstGate(COMPLETE_CV, fixtureGate(), graded());
    assert.equal(result.qualitative.status, "complete");
    assert.equal(result.qualitative.composite, 83.8);
    assert.equal(result.qualitative.truthLockScore, 100);
    assert.equal(result.overallScore, 84.8);
    assert.equal(result.verdict, "PASS");
  });

  it("honors a custom qualitativeWeight", () => {
    // 0.5 × 85.2 + 0.5 × 83.8 = 84.5
    const result = scoreCvAgainstGate(COMPLETE_CV, fixtureGate({ qualitativeWeight: 0.5 }), graded());
    assert.equal(result.overallScore, 84.5);
  });

  it("fails the gate when truth lock is below 100", () => {
    const result = scoreCvAgainstGate(
      COMPLETE_CV,
      fixtureGate(),
      { version: 1, criteria: qualitativeEntries({ "truth-lock": 60 }) },
    );
    assert.equal(result.qualitative.truthLockScore, 60);
    assert.equal(result.verdict, "FAIL");
    assert.ok(result.failures.some((failure) => failure.includes("Truth lock scored 60/100")));
  });

  it("fails when the blended nota misses the threshold", () => {
    // overall 84.8 < 90
    const result = scoreCvAgainstGate(
      COMPLETE_CV,
      fixtureGate({ minOverallScore: 90 }),
      graded(),
    );
    assert.equal(result.verdict, "FAIL");
    assert.ok(result.failures.some((failure) => failure.includes("Overall ATS score 84.8/100 < 90")));
  });

  it("marks pending and keeps the verdict quantitative-only", () => {
    const result = scoreCvAgainstGate(COMPLETE_CV, fixtureGate());
    assert.equal(result.overallScore, null);
    assert.equal(result.qualitative.status, "pending");
    assert.equal(result.qualitative.composite, null);
    assert.equal(result.verdict, "PASS");
    assert.ok(result.improvements.some((improvement) => improvement.includes("Qualitative review pending")));
  });

  it("lists validation problems while pending", () => {
    const invalid: QualitativeJson = {
      version: 1,
      criteria: [{ id: "truth-lock", score: 100, evidence: "traced" }],
    };
    const result = scoreCvAgainstGate(COMPLETE_CV, fixtureGate(), invalid);
    assert.equal(result.overallScore, null);
    assert.equal(result.qualitative.status, "pending");
    assert.ok(result.qualitative.problems.some((problem) => problem.includes("Missing criterion")));
    assert.ok(result.improvements.some((improvement) => improvement.startsWith("Fix qualitative.json")));
  });

  it("suggests revising weak criteria below 80", () => {
    const result = scoreCvAgainstGate(
      COMPLETE_CV,
      fixtureGate(),
      { version: 1, criteria: qualitativeEntries({ "star-bullets": 55 }) },
    );
    assert.ok(
      result.improvements.some((improvement) =>
        improvement.includes('Qualitative "STAR/CAR bullets" scored 55/100'),
      ),
    );
  });

  it("renders the qualitative section in the gate report", () => {
    const gate = fixtureGate();
    const complete = renderGateReportMarkdown(gate, scoreCvAgainstGate(COMPLETE_CV, gate, graded()));
    assert.ok(complete.includes("## Qualitative review"));
    assert.ok(complete.includes("Reviewer: tech-recruitment-manager"));
    assert.ok(complete.includes("**Status:** complete"));
    assert.ok(complete.includes("Overall = (1 - 0.3)"));
    assert.ok(complete.includes("| Overall ATS score (quant + qual) | 84.8/100 | ≥ 70 | ✅ |"));

    const pending = renderGateReportMarkdown(gate, scoreCvAgainstGate(COMPLETE_CV, gate));
    assert.ok(pending.includes("**Status:** PENDING"));
    assert.ok(pending.includes("| Overall ATS score (quant + qual) | pending qualitative review | ≥ 70 | ⏳ |"));
  });
});