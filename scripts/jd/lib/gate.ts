// Builds the per-job ATS gate (gate.json + gate.md) from curated jd.json.

import type { CvSegmentId } from "./markdown.js";
import { CV_SECTION_LABELS } from "./markdown.js";
import type { JdJson, JdKeyword, JdExtraKeyword } from "./types.js";
import { QUALITATIVE_CRITERIA, REVIEWER_PERSONA, type QualitativeCriterion } from "./qualitative.js";

export type GateThresholds = {
  /** Minimum weighted presence coverage of JD keywords, 0–100 (the primary gate). */
  presenceScore: number;
  /** Minimum must-have (weight 3) presence coverage, 0–100. */
  mustHaveCoverage: number;
  /** Fraction of headline terms required in the CV headline, 0–1. */
  headlineRoleMatchRatio: number;
  /** CV segments that must be non-empty. */
  requiredSections: CvSegmentId[];
  /** Maximum total words across scored segments (≈2 A4 pages). */
  maxWords: number;
  /** Share of the overall nota coming from the agent-graded qualitative layer, 0–1. */
  qualitativeWeight: number;
  /** Minimum blended overall nota (quantitative + qualitative) required to pass, 0–100. */
  minOverallScore: number;
};

export const DEFAULT_THRESHOLDS: GateThresholds = {
  presenceScore: 85,
  mustHaveCoverage: 100,
  headlineRoleMatchRatio: 0.6,
  requiredSections: ["summary", "skills", "experience", "projects", "credentials"],
  maxWords: 1000,
  qualitativeWeight: 0.3,
  minOverallScore: 70,
};

/** Advisory placement-quality target, reported but not verdict-blocking. */
export const PLACEMENT_ADVISORY = 60;

export type GateKeyword = { term: string; weight: number; aliases: string[] };

/** Snapshot of the agent-graded rubric blended into the overall nota. */
export type GateQualitativeSpec = {
  version: 1;
  /** Who grades this layer — REVIEWER_PERSONA.id (hiring-side screen). */
  reviewer: string;
  /** Share of the overall nota from this layer, 0–1 (mirrors thresholds.qualitativeWeight). */
  weight: number;
  criteria: QualitativeCriterion[];
};

export type GateJson = {
  version: 1;
  dir: string;
  role: string;
  company: string;
  /** Significant words of the JD role title; the CV headline must echo them. */
  headlineTerms: string[];
  thresholds: GateThresholds;
  keywords: GateKeyword[];
  qualitative: GateQualitativeSpec;
};

const HEADLINE_STOPWORDS = new Set([
  "a",
  "an",
  "the",
  "of",
  "and",
  "or",
  "for",
  "with",
  "to",
  "in",
  "on",
  "at",
  "&",
]);

/** Role title → significant words the CV headline must echo. */
export function headlineTerms(role: string): string[] {
  const terms = role
    .toLowerCase()
    .split(/[^\p{L}\p{N}+#.]+/u)
    .filter((word) => word.length >= 2 && !HEADLINE_STOPWORDS.has(word));
  return [...new Set(terms)];
}

/**
 * Merges dataset keywords with agent-curated extraKeywords.
 * Dedupe by lowercase term; dataset keywords take precedence. Extras default to weight 2.
 */
export function mergeJdKeywords(jd: JdJson): JdKeyword[] {
  const merged = new Map<string, JdKeyword>();
  for (const keyword of jd.keywords) {
    merged.set(keyword.term.toLowerCase(), { ...keyword });
  }
  for (const extra of jd.extraKeywords as JdExtraKeyword[]) {
    const key = extra.term.toLowerCase();
    if (merged.has(key)) continue;
    const weight = Math.min(3, Math.max(1, Math.round(extra.weight || 2)));
    merged.set(key, {
      term: extra.term,
      weight: weight as 1 | 2 | 3,
      aliases: extra.aliases?.length ? [...extra.aliases] : [key],
      origin: "other",
    });
  }
  return [...merged.values()].sort(
    (a, b) => b.weight - a.weight || a.term.localeCompare(b.term),
  );
}

export function buildGateJson(jd: JdJson): GateJson {
  // Honest-gaps contract: terms recorded in jd.gaps are job-fit questions for
  // the user, not CV writing targets — they never enter the gate.
  const gapTerms = new Set((jd.gaps ?? []).map((gap) => gap.term.toLowerCase()));
  return {
    version: 1,
    dir: jd.dir,
    role: jd.role,
    company: jd.company,
    headlineTerms: headlineTerms(jd.role),
    thresholds: { ...DEFAULT_THRESHOLDS },
    keywords: mergeJdKeywords(jd)
      .filter((keyword) => !gapTerms.has(keyword.term.toLowerCase()))
      .map(({ term, weight, aliases }) => ({ term, weight, aliases })),
    qualitative: {
      version: 1,
      reviewer: REVIEWER_PERSONA.id,
      weight: DEFAULT_THRESHOLDS.qualitativeWeight,
      criteria: QUALITATIVE_CRITERIA.map((criterion) => ({ ...criterion })),
    },
  };
}

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

export function renderGateMarkdown(gate: GateJson, jdSummary: string): string {
  const lines: string[] = [];
  lines.push(`# ATS Gate — ${gate.role} @ ${gate.company}`);
  lines.push("");
  lines.push(`Application folder: \`${gate.dir}\``);
  lines.push("");
  if (jdSummary) {
    lines.push(`> ${jdSummary}`);
    lines.push("");
  }

  lines.push("## Thresholds");
  lines.push("");
  lines.push("| Check | Threshold | Meaning |");
  lines.push("|-------|-----------|---------|");
  lines.push(
    `| Weighted presence | ≥ ${gate.thresholds.presenceScore}% | JD keyword coverage by weight (any truthful placement) — the primary gate |`,
  );
  lines.push(
    `| Must-have coverage | ≥ ${gate.thresholds.mustHaveCoverage}% | Every weight-3 keyword must appear somewhere in the CV |`,
  );
  lines.push(
    `| Headline role match | ≥ ${Math.round(gate.thresholds.headlineRoleMatchRatio * 100)}% of terms | Headline must echo the JD role title (${gate.headlineTerms.join(", ")}) |`,
  );
  lines.push(
    `| Required sections | ${gate.thresholds.requiredSections.map((id) => CV_SECTION_LABELS[id]).join(", ")} | ATS-safe section structure |`,
  );
  lines.push(`| Length | ≤ ${gate.thresholds.maxWords} words | Fits 2 A4 pages |`);
  lines.push(
    `| Placement quality | advisory ≥ ${PLACEMENT_ADVISORY}/100 | Headline ×3, summary/skills ×2, body ×1 — reported, not verdict-blocking |`,
  );
  lines.push(
    `| Overall ATS score | ≥ ${gate.thresholds.minOverallScore}/100 | Blended nota: (1 − ${gate.qualitative.weight}) × placement + ${gate.qualitative.weight} × agent-graded qualitative composite |`,
  );
  lines.push("");

  lines.push("## Qualitative layer (agent-graded)");
  lines.push("");
  lines.push(
    `Reviewer persona: **${gate.qualitative.reviewer ?? REVIEWER_PERSONA.id}** — the agent grades from the hiring side, screening the CV against this JD with the trade's frameworks (6-second screen, knock-out requirements, ATS keyword search, STAR/CAR bullets, leveling signals, red-flag scan).`,
  );
  lines.push("");
  lines.push(
    `The overall nota blends both layers: overall = (1 − ${gate.qualitative.weight}) × quantitative placement + ${gate.qualitative.weight} × qualitative composite, and must reach ≥ ${gate.thresholds.minOverallScore}/100. Scaffold \`qualitative.json\` with \`npm run jd -- qualitative "${gate.dir}"\`, grade each criterion 0–100 with evidence, then re-run score. A complete review is required before delivery.`,
  );
  lines.push("");
  lines.push("| Weight | Criterion | What the agent verifies |");
  lines.push("|--------|-----------|------------------------|");
  for (const criterion of gate.qualitative.criteria) {
    lines.push(
      `| ${"★".repeat(criterion.weight)} ${criterion.weight} | ${criterion.label} | ${criterion.checks.replace(/\|/g, "\\|")} |`,
    );
  }
  lines.push("");
  lines.push(
    "_Truth lock below 100 fails the gate outright — an unsourced claim is removed or flagged to the user, never faked._",
  );
  lines.push("");

  lines.push("## Keywords");
  lines.push("");
  lines.push("| Weight | Keyword |");
  lines.push("|--------|---------|");
  for (const keyword of gate.keywords) {
    lines.push(`| ${"★".repeat(keyword.weight)} ${keyword.weight} | ${keyword.term} |`);
  }
  lines.push("");
  lines.push(
    "_Placement points: headline 3 · summary/skills 2 · experience/projects/credentials 1 · absent 0._",
  );
  lines.push("");
  lines.push(
    "_Tuning: edit thresholds or keywords in `gate.json` (aliases are word-boundary matched, case-insensitive), then re-run score._",
  );
  lines.push("");

  return lines.join("\n");
}

export { round1 as roundScore };
