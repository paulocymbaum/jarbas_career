// Scores tailored cv.md against gate.json — deterministic, mirrors scripts/lib/scoring/ats.ts math.
// The agent-graded qualitative layer (qualitative.json) blends into the overall nota:
//   overall = (1 − qualitativeWeight) × placement score + qualitativeWeight × qualitative composite

import { CV_SECTION_LABELS, parseCvMarkdown, type CvSegmentId } from "./markdown.js";
import { matchAliases } from "../../lib/scoring/keyword-match.js";
import type { GateJson } from "./gate.js";
import { DEFAULT_THRESHOLDS, PLACEMENT_ADVISORY, roundScore } from "./gate.js";
import {
  QUALITATIVE_CRITERIA,
  qualitativeComposite,
  qualitativeCriterion,
  TRUTH_LOCK_ID,
  truthLockScore,
  validateQualitativeJson,
  type QualitativeCriterion,
  type QualitativeJson,
} from "./qualitative.js";

export type KeywordScore = {
  term: string;
  weight: number;
  /** Best placement points earned: 3 headline, 2 summary/skills, 1 body, 0 absent. */
  points: number;
  bestSegment: CvSegmentId | null;
  present: boolean;
};

export type SectionCheck = { id: CvSegmentId; label: string; present: boolean };

export type QualitativeEntryResult = {
  id: string;
  label: string;
  weight: number;
  score: number | null;
  evidence: string;
};

export type QualitativeResult = {
  /** complete = rubric fully graded and valid; pending = absent or invalid. */
  status: "complete" | "pending";
  /** Validation problems while pending (empty when qualitative.json is simply absent). */
  problems: string[];
  /** Weighted rubric average, 0–100 (null while pending). */
  composite: number | null;
  /** Truth-lock score — below 100 fails the gate regardless of the nota (null while pending). */
  truthLockScore: number | null;
  entries: QualitativeEntryResult[];
};

export type GateResult = {
  verdict: "PASS" | "FAIL";
  /** Weighted presence coverage of gate keywords, 0–100 (primary gated metric). */
  presenceScore: number;
  /** Placement-weighted score, 0–100 (advisory: headline ×3, summary/skills ×2, body ×1). */
  score: number;
  /** Blended nota: (1 − w) × placement + w × qualitative composite (null while qualitative is pending). */
  overallScore: number | null;
  qualitative: QualitativeResult;
  mustHaveCoverage: number;
  headlineMatchRatio: number;
  headlineRoleMatch: boolean;
  sections: SectionCheck[];
  wordCount: number;
  withinWordLimit: boolean;
  keywords: KeywordScore[];
  failures: string[];
  improvements: string[];
};

const SEGMENT_PLACEMENT_POINTS: Record<CvSegmentId, number> = {
  headline: 3,
  summary: 2,
  skills: 2,
  experience: 1,
  projects: 1,
  credentials: 1,
};

function placementLabel(id: CvSegmentId): string {
  return CV_SECTION_LABELS[id];
}

/** Renders the human-readable gate report with verdict marker used by `deliver`. */
export function renderGateReportMarkdown(gate: GateJson, result: GateResult): string {
  const lines: string[] = [];
  lines.push(`# ATS Gate Report — ${gate.role} @ ${gate.company}`);
  lines.push("");
  lines.push(`**Verdict:** ${result.verdict}`);
  lines.push("");

  lines.push("## Scores");
  lines.push("");
  lines.push("| Metric | Value | Threshold | Status |");
  lines.push("|--------|-------|-----------|--------|");
  lines.push(
    `| Weighted presence | ${result.presenceScore}% | ≥ ${gate.thresholds.presenceScore}% | ${result.presenceScore >= gate.thresholds.presenceScore ? "✅" : "❌"} |`,
  );
  lines.push(
    `| Must-have coverage | ${result.mustHaveCoverage}% | ≥ ${gate.thresholds.mustHaveCoverage}% | ${result.mustHaveCoverage >= gate.thresholds.mustHaveCoverage ? "✅" : "❌"} |`,
  );
  lines.push(
    `| Headline role match | ${result.headlineMatchRatio}% | ≥ ${Math.round(gate.thresholds.headlineRoleMatchRatio * 100)}% | ${result.headlineRoleMatch ? "✅" : "❌"} |`,
  );
  for (const section of result.sections) {
    lines.push(
      `| Section: ${section.label} | ${section.present ? "present" : "missing"} | required | ${section.present ? "✅" : "❌"} |`,
    );
  }
  lines.push(
    `| Length | ${result.wordCount} words | ≤ ${gate.thresholds.maxWords} | ${result.withinWordLimit ? "✅" : "❌"} |`,
  );
  lines.push(
    `| Placement quality (advisory) | ${result.score}/100 | target ≥ ${PLACEMENT_ADVISORY} | ${result.score >= PLACEMENT_ADVISORY ? "✅" : "⚠️"} |`,
  );
  const minOverall = gate.thresholds.minOverallScore ?? DEFAULT_THRESHOLDS.minOverallScore;
  lines.push(
    `| Overall ATS score (quant + qual) | ${
      result.overallScore !== null ? `${result.overallScore}/100` : "pending qualitative review"
    } | ≥ ${minOverall} | ${
      result.overallScore === null ? "⏳" : result.overallScore >= minOverall ? "✅" : "❌"
    } |`,
  );
  lines.push("");

  lines.push(renderQualitativeSection(gate, result));

  lines.push("## Keyword coverage");
  lines.push("");
  lines.push("| Weight | Keyword | Points | Best placement | Status |");
  lines.push("|--------|---------|--------|----------------|--------|");
  for (const keyword of result.keywords) {
    lines.push(
      `| ${keyword.weight} | ${keyword.term} | ${keyword.points} | ${keyword.bestSegment ? placementLabel(keyword.bestSegment) : "—"} | ${keyword.present ? "✅" : keyword.weight >= 3 ? "❌" : "⚠️"} |`,
    );
  }
  lines.push("");

  if (result.failures.length > 0) {
    lines.push("## Why it fails");
    lines.push("");
    for (const failure of result.failures) lines.push(`- ${failure}`);
    lines.push("");
  }

  lines.push("## Improvement plan");
  lines.push("");
  if (result.improvements.length === 0) {
    lines.push("Gate passed — no further changes needed.");
  } else {
    result.improvements.forEach((improvement, index) => {
      lines.push(`${index + 1}. ${improvement}`);
    });
  }
  lines.push("");

  return lines.join("\n");
}

/** Renders the qualitative review section (agent-graded rubric) of the gate report. */
function renderQualitativeSection(gate: GateJson, result: GateResult): string {
  const lines: string[] = [];
  const qualWeight = gate.thresholds.qualitativeWeight ?? DEFAULT_THRESHOLDS.qualitativeWeight;
  lines.push("## Qualitative review");
  lines.push("");
  lines.push(
    `Reviewer: ${gate.qualitative?.reviewer ?? "tech-recruitment-manager"} — hiring-side screen of cv.md against this JD.`,
  );
  lines.push("");
  if (result.qualitative.status === "complete") {
    lines.push(
      `**Status:** complete — composite ${result.qualitative.composite}/100 · truth lock ${result.qualitative.truthLockScore}/100 (hard gate)`,
    );
    lines.push("");
    lines.push(
      `Overall = (1 - ${qualWeight}) × quantitative ${result.score} + ${qualWeight} × qualitative ${result.qualitative.composite} = **${result.overallScore}/100**`,
    );
    lines.push("");
    lines.push("| Weight | Criterion | Score | Evidence |");
    lines.push("|--------|-----------|-------|----------|");
    for (const entry of result.qualitative.entries) {
      const evidence = (entry.evidence || "—").replace(/\s+/g, " ").replace(/\|/g, "\\|");
      lines.push(
        `| ${"★".repeat(entry.weight)} ${entry.weight} | ${entry.label} | ${entry.score ?? "—"} | ${evidence} |`,
      );
    }
    lines.push("");
    return lines.join("\n");
  }

  lines.push("**Status:** PENDING — the overall nota is withheld until the agent grades the rubric.");
  lines.push("");
  lines.push(
    `Run \`npm run jd -- qualitative "${gate.dir}"\`, fill qualitative.json (score 0–100 + evidence per criterion), then re-score. Delivery blocks on this.`,
  );
  for (const problem of result.qualitative.problems) {
    lines.push(`- ${problem}`);
  }
  if (result.qualitative.problems.length > 0) lines.push("");
  return lines.join("\n");
}

function gradeQualitative(
  gate: GateJson,
  qualitative?: QualitativeJson | null,
): QualitativeResult {
  const spec: QualitativeCriterion[] =
    gate.qualitative?.criteria && gate.qualitative.criteria.length > 0
      ? gate.qualitative.criteria
      : QUALITATIVE_CRITERIA;

  if (!qualitative) {
    return {
      status: "pending",
      problems: [],
      composite: null,
      truthLockScore: null,
      entries: spec.map((criterion) => ({
        id: criterion.id,
        label: criterion.label,
        weight: criterion.weight,
        score: null,
        evidence: "",
      })),
    };
  }

  const entries: QualitativeEntryResult[] = (qualitative.criteria ?? []).map((entry) => {
    const criterion =
      spec.find((candidate) => candidate.id === entry.id) ?? qualitativeCriterion(entry.id);
    return {
      id: entry.id,
      label: criterion?.label ?? entry.id,
      weight: criterion?.weight ?? 0,
      score:
        typeof entry.score === "number" && Number.isFinite(entry.score) && entry.score >= 0 && entry.score <= 100
          ? entry.score
          : null,
      evidence: typeof entry.evidence === "string" ? entry.evidence : "",
    };
  });

  const problems = validateQualitativeJson(qualitative);
  if (problems.length > 0) {
    return { status: "pending", problems, composite: null, truthLockScore: null, entries };
  }

  return {
    status: "complete",
    problems: [],
    composite: qualitativeComposite(qualitative.criteria),
    truthLockScore: truthLockScore(qualitative.criteria),
    entries,
  };
}

export function scoreCvAgainstGate(
  markdown: string,
  gate: GateJson,
  qualitative?: QualitativeJson | null,
): GateResult {
  const parsed = parseCvMarkdown(markdown);
  const segmentById = new Map(parsed.segments.map((segment) => [segment.id, segment]));

  const keywordScores: KeywordScore[] = [];
  let earnedWeight = 0;
  let totalWeight = 0;
  for (const keyword of gate.keywords) {
    let points = 0;
    let bestSegment: CvSegmentId | null = null;
    for (const segment of parsed.segments) {
      if (matchAliases(segment.text, keyword.aliases).length > 0) {
        const candidate = SEGMENT_PLACEMENT_POINTS[segment.id];
        if (candidate > points) {
          points = candidate;
          bestSegment = segment.id;
        }
      }
    }
    totalWeight += keyword.weight;
    earnedWeight += keyword.weight * points;
    keywordScores.push({
      term: keyword.term,
      weight: keyword.weight,
      points,
      bestSegment,
      present: points > 0,
    });
  }

  const score = totalWeight === 0 ? 0 : roundScore((earnedWeight / (totalWeight * 3)) * 100);

  const presentWeight = keywordScores
    .filter((keyword) => keyword.present)
    .reduce((sum, keyword) => sum + keyword.weight, 0);
  const presenceScore = totalWeight === 0 ? 0 : roundScore((presentWeight / totalWeight) * 100);

  const mustHave = keywordScores.filter((keyword) => keyword.weight >= 3);
  const mustHaveWeight = mustHave.reduce((sum, keyword) => sum + keyword.weight, 0);
  const mustHavePresentWeight = mustHave
    .filter((keyword) => keyword.present)
    .reduce((sum, keyword) => sum + keyword.weight, 0);
  const mustHaveCoverage =
    mustHaveWeight === 0 ? 100 : roundScore((mustHavePresentWeight / mustHaveWeight) * 100);

  const headline = segmentById.get("headline");
  const matchedHeadlineTerms = gate.headlineTerms.filter(
    (term) => matchAliases(headline?.text ?? "", [term]).length > 0,
  );
  const headlineMatchRatio =
    gate.headlineTerms.length === 0
      ? 1
      : matchedHeadlineTerms.length / gate.headlineTerms.length;
  const headlineRoleMatch = headlineMatchRatio >= gate.thresholds.headlineRoleMatchRatio;

  const sections: SectionCheck[] = gate.thresholds.requiredSections.map((id) => ({
    id,
    label: CV_SECTION_LABELS[id],
    present: segmentById.has(id),
  }));

  const withinWordLimit = parsed.wordCount <= gate.thresholds.maxWords;

  const qualitativeResult = gradeQualitative(gate, qualitative);
  const qualWeight = gate.thresholds.qualitativeWeight ?? DEFAULT_THRESHOLDS.qualitativeWeight;
  const minOverall = gate.thresholds.minOverallScore ?? DEFAULT_THRESHOLDS.minOverallScore;
  const overallScore =
    qualitativeResult.composite === null
      ? null
      : roundScore((1 - qualWeight) * score + qualWeight * qualitativeResult.composite);

  const failures: string[] = [];
  if (presenceScore < gate.thresholds.presenceScore) {
    failures.push(`Weighted presence ${presenceScore}% < ${gate.thresholds.presenceScore}%`);
  }
  if (mustHaveCoverage < gate.thresholds.mustHaveCoverage) {
    failures.push(`Must-have coverage ${mustHaveCoverage}% < ${gate.thresholds.mustHaveCoverage}%`);
  }
  if (!headlineRoleMatch) {
    failures.push(
      `Headline echoes ${matchedHeadlineTerms.length}/${gate.headlineTerms.length} role terms (need ≥ ${Math.round(gate.thresholds.headlineRoleMatchRatio * 100)}%)`,
    );
  }
  for (const section of sections) {
    if (!section.present) failures.push(`Missing section: ${section.label}`);
  }
  if (!withinWordLimit) {
    failures.push(`${parsed.wordCount} words > ${gate.thresholds.maxWords} limit`);
  }
  if (qualitativeResult.truthLockScore !== null && qualitativeResult.truthLockScore < 100) {
    failures.push(
      `Truth lock scored ${qualitativeResult.truthLockScore}/100 — non-negotiable: re-source or remove every unsourced claim (or flag it to the user); never fake it.`,
    );
  }
  if (overallScore !== null && overallScore < minOverall) {
    failures.push(
      `Overall ATS score ${overallScore}/100 < ${minOverall} (quantitative ${score} + qualitative ${qualitativeResult.composite} at ${Math.round(qualWeight * 100)}% weight)`,
    );
  }

  const improvements: string[] = [];
  if (score < PLACEMENT_ADVISORY) {
    const underPlaced = keywordScores.filter(
      (keyword) => keyword.weight >= 3 && keyword.present && keyword.points < 3,
    );
    if (underPlaced.length > 0) {
      improvements.push(
        `Placement advisory — must-have keywords earning ≤ 2 pts: ${underPlaced
          .map((keyword) => `"${keyword.term}"`)
          .join(", ")}. Echo them in the headline line or a headline tech line (3 pts each).`,
      );
    } else {
      improvements.push(
        "Placement advisory: place more gate keywords genuinely (headline 3 pts, summary/skills 2 pts, body 1 pt).",
      );
    }
  }
  for (const keyword of keywordScores.filter((k) => !k.present && k.weight >= 3)) {
    improvements.push(
      `MUST — add "${keyword.term}" to the Summary or Skills (only if genuinely part of your experience).`,
    );
  }
  if (!headlineRoleMatch) {
    const missing = gate.headlineTerms.filter(
      (term) => !matchedHeadlineTerms.includes(term),
    );
    improvements.push(
      `Headline should read "<JD role title> | <signature strengths>" — missing terms: ${missing.join(", ")}.`,
    );
  }
  for (const keyword of keywordScores.filter((k) => !k.present && k.weight === 2)) {
    improvements.push(
      `Add "${keyword.term}" to Skills or an experience bullet where you actually used it.`,
    );
  }
  for (const section of sections.filter((s) => !s.present)) {
    improvements.push(`Add the missing "${section.label}" section (see the CV template).`);
  }
  if (!withinWordLimit) {
    improvements.push(
      `Trim ${parsed.wordCount - gate.thresholds.maxWords} words — cut weakest bullets before any must-have keyword.`,
    );
  }
  for (const keyword of keywordScores.filter((k) => !k.present && k.weight === 1)) {
    improvements.push(`Optional — mention "${keyword.term}" if it maps to real experience.`);
  }
  if (qualitativeResult.status === "pending") {
    improvements.push(
      qualitativeResult.problems.length > 0
        ? `Fix qualitative.json — ${qualitativeResult.problems.slice(0, 3).join("; ")}.`
        : `Qualitative review pending — run npm run jd -- qualitative "${gate.dir}", grade each rubric criterion with evidence, then re-score.`,
    );
  } else {
    for (const entry of qualitativeResult.entries) {
      if (entry.id === TRUTH_LOCK_ID || entry.score === null || entry.score >= 80) continue;
      const criterion = qualitativeCriterion(entry.id);
      improvements.push(
        `Qualitative "${entry.label}" scored ${entry.score}/100 — ${criterion?.checks ?? "improve this dimension"} and re-grade.`,
      );
    }
  }

  const verdict: GateResult["verdict"] = failures.length === 0 ? "PASS" : "FAIL";

  return {
    verdict,
    presenceScore,
    score,
    overallScore,
    qualitative: qualitativeResult,
    mustHaveCoverage,
    headlineMatchRatio: roundScore(headlineMatchRatio * 100),
    headlineRoleMatch,
    sections,
    wordCount: parsed.wordCount,
    withinWordLimit,
    keywords: keywordScores,
    failures,
    improvements,
  };
}
