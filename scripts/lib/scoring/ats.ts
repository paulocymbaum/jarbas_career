// Deterministic ATS scoring: prevalence-weighted keyword coverage of a CV document,
// with placement weighting (headline ×3, summary/keywords/skills ×2, body ×1).

import type { ProfileCvDocument } from "../../../src/content/types.js";
import {
  getPrevalence,
  MARKET_KEYWORDS,
  MUST_HAVE_PREVALENCE,
  type MarketRoleKey,
} from "./market-insights.js";
import { matchAliases } from "./keyword-match.js";

export type AtsSegmentId =
  | "headline"
  | "summary"
  | "keywords"
  | "skills"
  | "experience"
  | "projects"
  | "credentials";

const SEGMENT_WEIGHTS: Record<AtsSegmentId, number> = {
  headline: 3,
  summary: 2,
  keywords: 2,
  skills: 2,
  experience: 1,
  projects: 1,
  credentials: 1,
};

export const ATS_MAX_POINTS = 3;

export type AtsSegment = { id: AtsSegmentId; weight: number; text: string };

export type AtsKeywordResult = {
  category: string;
  keyword: string;
  prevalence: number;
  present: boolean;
  /** Placement points: 3 headline, 2 summary/keywords/skills, 1 body, 0 absent. */
  points: number;
  segments: AtsSegmentId[];
  aliases: string[];
};

export type AtsReport = {
  slug: string;
  profileTitle: string;
  targetRole: MarketRoleKey;
  /** Prevalence × placement weighted score, 0–100 (1 decimal). */
  score: number;
  /** Pure prevalence-weighted presence, 0–100 (1 decimal). */
  coverage: number;
  /** Presence coverage among must-have keywords (prevalence ≥ 70), 0–100 (1 decimal). */
  mustHaveCoverage: number;
  matched: AtsKeywordResult[];
  missing: AtsKeywordResult[];
};

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

export function buildCvSegments(doc: ProfileCvDocument): AtsSegment[] {
  // Fields join with "\n" (not " "): "\n" is still a word boundary for the alias
  // matcher, but multi-word aliases can no longer match across two adjacent
  // fields (e.g. a field ending in "REST" followed by one starting with
  // "APIs…" would false-match the "rest apis" alias under a space join).
  const experienceText = doc.experience
    .flatMap((item) => [item.role, item.company, item.summary ?? "", ...item.highlights, ...item.tech])
    .join("\n");
  const projectText = doc.projects
    .flatMap((item) => [item.title, item.description, ...item.tech])
    .join("\n");
  const credentialsText = [
    ...doc.education.flatMap((item) => [item.institution, item.degree, item.summary ?? ""]),
    ...doc.certifications.flatMap((item) => [item.name, item.issuer]),
  ].join("\n");

  return [
    { id: "headline", weight: SEGMENT_WEIGHTS.headline, text: [doc.title, doc.headline].join("\n") },
    { id: "summary", weight: SEGMENT_WEIGHTS.summary, text: doc.summary },
    { id: "keywords", weight: SEGMENT_WEIGHTS.keywords, text: doc.keywords.join("\n") },
    {
      id: "skills",
      weight: SEGMENT_WEIGHTS.skills,
      text: doc.skills.flatMap((group) => [group.name, ...group.items]).join("\n"),
    },
    { id: "experience", weight: SEGMENT_WEIGHTS.experience, text: experienceText },
    { id: "projects", weight: SEGMENT_WEIGHTS.projects, text: projectText },
    { id: "credentials", weight: SEGMENT_WEIGHTS.credentials, text: credentialsText },
  ];
}

/** Score a CV document against a role distribution. Pure and deterministic. */
export function scoreProfileCv(doc: ProfileCvDocument, targetRole: MarketRoleKey): AtsReport {
  const segments = buildCvSegments(doc);
  const results: AtsKeywordResult[] = [];

  let weightedSum = 0;
  let prevalenceSum = 0;
  let presentPrevalence = 0;
  let mustHavePrevalence = 0;
  let mustHavePresent = 0;

  for (const row of MARKET_KEYWORDS) {
    const prevalence = getPrevalence(row, targetRole);
    prevalenceSum += prevalence;

    const hitSegments: AtsSegmentId[] = [];
    const hitAliases = new Set<string>();

    for (const segment of segments) {
      const aliases = matchAliases(segment.text, row.aliases);
      if (aliases.length > 0) {
        hitSegments.push(segment.id);
        for (const alias of aliases) hitAliases.add(alias);
      }
    }

    const present = hitSegments.length > 0;
    let points = 0;
    if (present) {
      points = Math.max(...hitSegments.map((id) => SEGMENT_WEIGHTS[id]));
      presentPrevalence += prevalence;
    }

    if (prevalence >= MUST_HAVE_PREVALENCE) {
      mustHavePrevalence += prevalence;
      if (present) mustHavePresent += prevalence;
    }

    weightedSum += prevalence * points;

    results.push({
      category: row.category,
      keyword: row.keyword,
      prevalence,
      present,
      points,
      segments: hitSegments,
      aliases: [...hitAliases],
    });
  }

  const matched = results.filter((item) => item.present);
  const missing = results
    .filter((item) => !item.present)
    .sort((a, b) => b.prevalence - a.prevalence);

  return {
    slug: doc.slug,
    profileTitle: doc.title,
    targetRole,
    score: round1((weightedSum / (prevalenceSum * ATS_MAX_POINTS)) * 100),
    coverage: round1((presentPrevalence / prevalenceSum) * 100),
    mustHaveCoverage: round1((mustHavePresent / mustHavePrevalence) * 100),
    matched,
    missing,
  };
}

/** Prevalence-weighted presence of a role's keywords in free text, 0–100 (1 decimal). */
export function roleCoverage(text: string, targetRole: MarketRoleKey): number {
  let presentPrevalence = 0;
  let prevalenceSum = 0;

  for (const row of MARKET_KEYWORDS) {
    const prevalence = getPrevalence(row, targetRole);
    prevalenceSum += prevalence;
    if (matchAliases(text, row.aliases).length > 0) {
      presentPrevalence += prevalence;
    }
  }

  return round1((presentPrevalence / prevalenceSum) * 100);
}
