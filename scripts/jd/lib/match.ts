// Ranks profile CV variants (scripts/resumes/profile-scopes.mjs) against curated jd.json keywords.

import { profileCvVariants } from "../../resumes/profile-scopes.mjs";
import { portfolioProjects } from "../../projects.config.mjs";
import { matchAliases } from "../../lib/scoring/keyword-match.js";
import { mergeJdKeywords } from "./gate.js";
import type { JdJson } from "./types.js";

type ProfileVariant = {
  slug: string;
  headline: string;
  targetRole: string;
  summary: string;
  keywords: string[];
  skills: { category: string; items: string[] }[];
  projectSlugs: string[];
  experiences: {
    roleOverride?: string;
    summaryOverride?: string;
    techOverride?: string[];
    bullets: string[];
  }[];
};

type ProjectConfig = { slug: string; title: string; description: string; tech?: string[] };

export type ProfileMatch = {
  slug: string;
  targetRole: string;
  coverage: number;
  mustHaveCoverage: number;
  matched: { term: string; weight: number }[];
  missing: { term: string; weight: number }[];
};

function variantText(variant: ProfileVariant, projects: ProjectConfig[]): string {
  const projectText = new Map(
    projects.map((project) => [
      project.slug,
      [project.title, project.description, ...(project.tech ?? [])].join("\n"),
    ]),
  );

  const parts: string[] = [
    variant.headline,
    variant.targetRole,
    variant.summary,
    ...variant.keywords,
    ...variant.skills.flatMap((group) => [group.category, ...group.items]),
  ];

  for (const experience of variant.experiences) {
    parts.push(
      experience.roleOverride ?? "",
      experience.summaryOverride ?? "",
      ...(experience.techOverride ?? []),
      ...experience.bullets,
    );
  }

  for (const slug of variant.projectSlugs) {
    parts.push(projectText.get(slug) ?? slug);
  }

  return parts.filter((part) => part.length > 0).join("\n");
}

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

export function matchProfiles(jd: JdJson): ProfileMatch[] {
  const keywords = mergeJdKeywords(jd);
  const totalWeight = keywords.reduce((sum, keyword) => sum + keyword.weight, 0);
  const mustHaveWeight = keywords
    .filter((keyword) => keyword.weight >= 3)
    .reduce((sum, keyword) => sum + keyword.weight, 0);

  const results = (profileCvVariants as unknown as ProfileVariant[]).map((variant) => {
    const text = variantText(
      variant,
      portfolioProjects as unknown as ProjectConfig[],
    );

    const matched: { term: string; weight: number }[] = [];
    const missing: { term: string; weight: number }[] = [];
    for (const keyword of keywords) {
      const target = matchAliases(text, keyword.aliases).length > 0 ? matched : missing;
      target.push({ term: keyword.term, weight: keyword.weight });
    }

    const matchedWeight = matched.reduce((sum, keyword) => sum + keyword.weight, 0);
    const matchedMustHaveWeight = matched
      .filter((keyword) => keyword.weight >= 3)
      .reduce((sum, keyword) => sum + keyword.weight, 0);

    return {
      slug: variant.slug,
      targetRole: variant.targetRole,
      coverage: totalWeight === 0 ? 0 : round1((matchedWeight / totalWeight) * 100),
      mustHaveCoverage:
        mustHaveWeight === 0 ? 100 : round1((matchedMustHaveWeight / mustHaveWeight) * 100),
      matched,
      missing,
    };
  });

  return results.sort(
    (a, b) =>
      b.mustHaveCoverage - a.mustHaveCoverage ||
      b.coverage - a.coverage ||
      a.slug.localeCompare(b.slug),
  );
}

export function renderMatchReportMarkdown(jd: JdJson, matches: ProfileMatch[]): string {
  const lines: string[] = [];
  lines.push(`# Profile Match — ${jd.role} @ ${jd.company}`);
  lines.push("");
  lines.push("Profiles ranked by must-have then overall keyword coverage against the curated JD.");
  lines.push("");
  lines.push("| Rank | Profile | Target role | Must-have coverage | Overall coverage |");
  lines.push("|------|---------|-------------|--------------------|------------------|");
  matches.forEach((match, index) => {
    lines.push(
      `| ${index + 1} | ${match.slug} | ${match.targetRole} | ${match.mustHaveCoverage}% | ${match.coverage}% |`,
    );
  });
  lines.push("");

  const best = matches[0];
  if (best) {
    lines.push(`## Recommended: ${best.slug}`);
    lines.push("");
    const missingMustHave = best.missing.filter((keyword) => keyword.weight >= 3);
    if (missingMustHave.length === 0) {
      lines.push("All JD must-have keywords have real support in this profile. ✅");
    } else {
      lines.push("JD must-have keywords **without direct support** in this profile:");
      lines.push("");
      for (const keyword of missingMustHave) lines.push(`- ${keyword.term}`);
      lines.push("");
      lines.push(
        "Truth lock: do NOT add these to the CV unless the profile genuinely has the experience — check `scripts/resumes/profile-scopes.mjs` and `src/content/site.ts` first. Adjacent real evidence may be highlighted instead; otherwise flag the gap to the user.",
      );
    }
    lines.push("");
  }

  return lines.join("\n");
}
