// Dev utility: generates the data behind the CV report (docs/).
// Usage: npx tsx scripts/dev/cv-report.ts
// Writes docs/cv-report-data.json — quantitative tables + per-CV content extracts
// used to assemble the human-readable report.

import fs from "node:fs";
import path from "node:path";
import { loadAuditInput } from "../lib/audit-source.js";
import { buildCvSegments, scoreProfileCv } from "../lib/scoring/ats.js";
import {
  MUST_HAVE_PREVALENCE,
  PROFILE_ROLE_TARGETS,
  ROLE_LABELS,
  type MarketRoleKey,
} from "../lib/scoring/market-insights.js";

const ROLES: MarketRoleKey[] = [
  "aiEngineer",
  "automationEngineer",
  "developerPlusAi",
  "overallAverage",
];

function main(): void {
  const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..", "..");
  const { documents } = loadAuditInput();

  const profiles = documents.map((doc) => {
    const target = PROFILE_ROLE_TARGETS[doc.slug];
    const report = scoreProfileCv(doc, target);

    const matrix = ROLES.map((role) => {
      const scored = scoreProfileCv(doc, role);
      return {
        role,
        roleLabel: ROLE_LABELS[role],
        score: scored.score,
        coverage: scored.coverage,
        mustHaveCoverage: scored.mustHaveCoverage,
      };
    });

    const byPlacement = [...report.matched].sort(
      (a, b) => b.points - a.points || b.prevalence - a.prevalence,
    );
    const topMatched = byPlacement.slice(0, 14).map((keyword) => ({
      keyword: keyword.keyword,
      prevalence: keyword.prevalence,
      points: keyword.points,
      segments: keyword.segments,
    }));
    const headlinePlacements = byPlacement
      .filter((keyword) => keyword.points === 3)
      .map((keyword) => keyword.keyword);
    const missingMustHave = report.missing
      .filter((keyword) => keyword.prevalence >= MUST_HAVE_PREVALENCE)
      .map((keyword) => ({ keyword: keyword.keyword, prevalence: keyword.prevalence }));
    const missingTop = report.missing.slice(0, 12).map((keyword) => ({
      keyword: keyword.keyword,
      prevalence: keyword.prevalence,
    }));

    const segments = buildCvSegments(doc);
    const sectionWords = Object.fromEntries(
      segments.map((segment) => [
        segment.id,
        segment.text.split(/\s+/).filter(Boolean).length,
      ]),
    );

    return {
      slug: doc.slug,
      title: doc.title,
      headline: doc.headline,
      targetRole: target,
      targetRoleLabel: ROLE_LABELS[target],
      summary: doc.summary,
      keywords: doc.keywords,
      skills: doc.skills.map((group) => ({ category: group.name, items: group.items })),
      experience: doc.experience.map((item) => ({
        role: item.role,
        company: item.company,
        start: item.start,
        end: item.end,
        summary: item.summary ?? "",
        highlights: item.highlights,
        tech: item.tech,
      })),
      projects: doc.projects.map((item) => ({ title: item.title, description: item.description })),
      certifications: doc.certifications.map((item) => item.name),
      education: doc.education.map((item) => item.degree),
      sectionWords,
      ats: {
        score: report.score,
        coverage: report.coverage,
        mustHaveCoverage: report.mustHaveCoverage,
        matchedCount: report.matched.length,
        missingCount: report.missing.length,
      },
      matrix,
      topMatched,
      headlinePlacements,
      missingMustHave,
      missingTop,
    };
  });

  const outDir = path.join(root, "docs");
  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, "cv-report-data.json");
  fs.writeFileSync(outPath, `${JSON.stringify({ generatedWith: "scripts/dev/cv-report.ts", profiles }, null, 2)}\n`);
  console.info(`Wrote ${outPath} (${profiles.length} profiles)`);
  for (const profile of profiles) {
    console.info(
      `  ${profile.slug.padEnd(20)} → ${profile.targetRoleLabel.padEnd(16)} score ${profile.ats.score}/100 · coverage ${profile.ats.coverage}% · must-have ${profile.ats.mustHaveCoverage}%`,
    );
  }
}

main();