// Agent-graded qualitative layer for the ATS gate.
//
// The deterministic scorer (score.ts) is purely quantitative; this module defines
// the reviewer persona and the rubric the agent grades by hand (criteria,
// validation, composite) so the overall nota can blend quantitative placement
// quality with the qualitative review:
//   overall = (1 − qualitativeWeight) × quantitative + qualitativeWeight × qualitative.
// Truth lock is a hard gate: below 100 the gate fails regardless of the nota.

/** Who grades the qualitative layer: the hiring side, not the candidate's advocate. */
export const REVIEWER_PERSONA = {
  id: "tech-recruitment-manager",
  label: "Tech recruitment manager",
  brief:
    "Screen the CV as a tech recruitment manager hiring for this role — the person who owns the shortlist and rejects most CVs. Use the trade's frameworks: the 6-second screen, knock-out requirements, ATS keyword search, STAR/CAR bullets, leveling signals, and the red-flag scan.",
} as const;

export type QualitativeCriterion = {
  id: string;
  label: string;
  /** Rubric weight inside the qualitative composite. */
  weight: number;
  /** What the agent verifies, and what evidence to record. */
  checks: string;
};

export const TRUTH_LOCK_ID = "truth-lock";

export const QUALITATIVE_CRITERIA: QualitativeCriterion[] = [
  {
    id: TRUTH_LOCK_ID,
    label: "Truth lock (verification pass)",
    weight: 3,
    checks:
      "The background check you would run before putting a CV on a shortlist: every claim must trace to profile-scopes.mjs, site.ts, content/projects/*.md, or facts the user gave this session — no invented employers, dates, degrees, metrics, or tools. 100 = fully compliant; anything below fails the gate (a recruiter's trust, once broken, is unrecoverable).",
  },
  {
    id: "six-second-scan",
    label: "6-second screen",
    weight: 2,
    checks:
      "The industry-standard first pass: from headline + summary alone, you get the role, seniority, core stack, and a gut fit verdict for this JD. A summary that argues the fit scores high; a duty list or generic praise makes you move to the next CV.",
  },
  {
    id: "screen-out-check",
    label: "Knock-out requirements",
    weight: 2,
    checks:
      "Answer the JD's non-negotiables (seniority, years, core stack, eligibility) clearly; silence on a must reads as a screen-out rejection, and hedged answers read as a no.",
  },
  {
    id: "jd-language",
    label: "ATS keyword search",
    weight: 2,
    checks:
      "Recruiters query their ATS with the JD's own terms: the CV must surface for those searches (their noun, your evidence) — synonym drift buries an otherwise good CV in the pile.",
  },
  {
    id: "star-bullets",
    label: "STAR/CAR bullets",
    weight: 2,
    checks:
      "Experience/project bullets follow situation/challenge → action → measurable result; 'responsible for' phrasing reads as a duty list and scores low.",
  },
  {
    id: "seniority-signals",
    label: "Leveling signals",
    weight: 2,
    checks:
      "Scope, ownership, leadership, and impact evidence must match the seniority the CV claims for this JD — inflated titles without artifacts and seniors hiding behind team achievements both score low.",
  },
  {
    id: "red-flags",
    label: "Red-flag scan",
    weight: 2,
    checks:
      "Buzzword soup without artifacts, template/AI smell ('passionate', 'results-driven', 'dynamic professional', exclamation marks, colon reveals), vagueness, and overclaiming are what make a recruiter move to the next CV.",
  },
  {
    id: "ats-format",
    label: "Parsing safety",
    weight: 1,
    checks:
      "Standard template H2 headings, single column, no tables/images/icons or exotic unicode beyond standard accents — a CV the ATS mangles never reaches the recruiter's list.",
  },
];

export function qualitativeCriterion(id: string): QualitativeCriterion | null {
  return QUALITATIVE_CRITERIA.find((criterion) => criterion.id === id) ?? null;
}

/** One agent-graded rubric entry. Score null = not graded yet (scaffold state). */
export type QualitativeEntry = {
  id: string;
  score: number | null;
  evidence: string;
};

export type QualitativeJson = {
  version: 1;
  /** Reviewer persona id (REVIEWER_PERSONA.id) — the scaffold fills it. */
  reviewer?: string;
  /** Entries, ideally in rubric order (scaffold order). */
  criteria: QualitativeEntry[];
  /** Optional free-form review notes. */
  notes?: string;
};

/** Structural validation — one problem string per violation (empty array = valid). */
export function validateQualitativeJson(value: unknown): string[] {
  if (
    typeof value !== "object" ||
    value === null ||
    !("criteria" in value) ||
    !Array.isArray((value as QualitativeJson).criteria)
  ) {
    return ["qualitative.json must be an object with a criteria array"];
  }

  const problems: string[] = [];
  const json = value as QualitativeJson;
  const seen = new Set<string>();

  for (const entry of json.criteria) {
    const criterion = typeof entry?.id === "string" ? qualitativeCriterion(entry.id) : null;
    if (!criterion) {
      problems.push(`Unknown criterion id: ${String(entry?.id)}`);
      continue;
    }
    if (seen.has(entry.id)) problems.push(`Duplicated criterion: ${entry.id}`);
    seen.add(entry.id);
    if (entry.score === null || entry.score === undefined) {
      problems.push(`Criterion "${entry.id}" is not graded (score is null)`);
    } else if (
      typeof entry.score !== "number" ||
      !Number.isFinite(entry.score) ||
      entry.score < 0 ||
      entry.score > 100
    ) {
      problems.push(`Criterion "${entry.id}" score must be a number 0–100`);
    }
    if (typeof entry.evidence !== "string" || entry.evidence.trim().length < 8) {
      problems.push(`Criterion "${entry.id}" needs evidence (a short quote or specific reason)`);
    }
  }
  for (const criterion of QUALITATIVE_CRITERIA) {
    if (!seen.has(criterion.id)) problems.push(`Missing criterion: ${criterion.id}`);
  }

  return problems;
}

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

/** Weighted average of the graded entries, 0–100. Callers must validate first. */
export function qualitativeComposite(entries: QualitativeEntry[]): number {
  let earned = 0;
  let total = 0;
  for (const entry of entries) {
    const criterion = qualitativeCriterion(entry.id);
    if (!criterion || typeof entry.score !== "number") continue;
    total += criterion.weight;
    earned += criterion.weight * entry.score;
  }
  return total === 0 ? 0 : round1(earned / total);
}

/** Truth-lock entry score, or null when absent/ungraded. */
export function truthLockScore(entries: QualitativeEntry[]): number | null {
  const entry = entries.find((candidate) => candidate.id === TRUTH_LOCK_ID);
  return entry && typeof entry.score === "number" ? entry.score : null;
}

/**
 * Scaffold entries for qualitative.json: rubric order, null scores for anything
 * unscored, previous valid grades/evidence preserved, unknown ids dropped.
 */
export function scaffoldQualitativeEntries(previous?: QualitativeEntry[]): QualitativeEntry[] {
  const graded = new Map<string, QualitativeEntry>();
  for (const entry of previous ?? []) {
    if (typeof entry?.id === "string" && qualitativeCriterion(entry.id)) {
      graded.set(entry.id, entry);
    }
  }
  return QUALITATIVE_CRITERIA.map((criterion) => {
    const prior = graded.get(criterion.id);
    const score =
      typeof prior?.score === "number" &&
      Number.isFinite(prior.score) &&
      prior.score >= 0 &&
      prior.score <= 100
        ? prior.score
        : null;
    return {
      id: criterion.id,
      score,
      evidence: typeof prior?.evidence === "string" ? prior.evidence : "",
    };
  });
}

/** Full scaffold for qualitative.json: persona + rubric order + preserved grades. */
export function scaffoldQualitativeJson(previous?: QualitativeJson | null): QualitativeJson {
  return {
    version: 1,
    reviewer: REVIEWER_PERSONA.id,
    criteria: scaffoldQualitativeEntries(previous?.criteria),
    ...(previous?.notes ? { notes: previous.notes } : {}),
  };
}

