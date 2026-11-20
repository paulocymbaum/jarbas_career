// Deterministic SEO/ATS audit of the portfolio content.
// Usage: tsx scripts/audit-seo-ats.ts [--json[=path]]
// Output is stable: no timestamps, dataset-ordered keywords, 1-decimal rounding.

import fs from "node:fs";
import path from "node:path";
import { getProjectRoot } from "./lib/db.js";
import { loadAuditInput } from "./lib/audit-source.js";
import { scoreProfileCv } from "./lib/scoring/ats.js";
import { scoreSiteSeo } from "./lib/scoring/seo.js";
import { scoreFreelancePageSeo } from "./lib/scoring/seo-freelance.js";
import { freelanceContent } from "../src/content/freelance.js";
import {
  MUST_HAVE_PREVALENCE,
  PROFILE_ROLE_TARGETS,
  ROLE_LABELS,
} from "./lib/scoring/market-insights.js";

function pct(value: number): string {
  return value.toFixed(1);
}

function buildReport() {
  const { site, documents, indexHtml, freelanceHtml } = loadAuditInput();

  const seo = scoreSiteSeo({ indexHtml, site });
  const freelanceSeo = scoreFreelancePageSeo({ freelanceHtml, content: freelanceContent });

  const ats = documents.map((doc) => {
    const target = PROFILE_ROLE_TARGETS[doc.slug];
    if (!target) {
      throw new Error(
        `Perfil "${doc.slug}" não tem mapeamento em PROFILE_ROLE_TARGETS. Adicione um alvo de role.`,
      );
    }
    return scoreProfileCv(doc, target);
  });

  return { seo, freelanceSeo, ats };
}

function printReport(report: ReturnType<typeof buildReport>): void {
  console.info("=== SEO / ATS deterministic audit ===");
  console.info("");
  console.info(
    `Site SEO: ${pct(report.seo.score)}/100 (static ${pct(report.seo.staticScore)}/45, copy ${pct(report.seo.contentScore)}/55)`,
  );
  for (const check of report.seo.checks) {
    if (check.earned < check.max) {
      console.info(`  [ ] ${check.label}: ${pct(check.earned)}/${check.max}`);
    }
  }

  console.info("");
  console.info(
    `Freelance page SEO (/freelance): ${pct(report.freelanceSeo.score)}/100 (static ${pct(report.freelanceSeo.staticScore)}/45, positioning + copy ${pct(report.freelanceSeo.contentScore)}/55)`,
  );
  for (const check of report.freelanceSeo.checks) {
    if (check.earned < check.max) {
      console.info(`  [ ] ${check.label}: ${pct(check.earned)}/${check.max}`);
    }
  }

  console.info("");
  console.info("Profile ATS:");
  for (const item of report.ats) {
    console.info(
      `  ${item.slug.padEnd(20)} → ${ROLE_LABELS[item.targetRole].padEnd(18)} score ${pct(item.score)}/100 · coverage ${pct(item.coverage)}% · must-have ${pct(item.mustHaveCoverage)}%`,
    );
  }

  console.info("");
  console.info("Missing must-have keywords (prevalence ≥ 70%), by weight:");
  for (const item of report.ats) {
    const missingMustHave = item.missing.filter(
      (keyword) => keyword.prevalence >= MUST_HAVE_PREVALENCE,
    );
    if (missingMustHave.length === 0) {
      console.info(`  ${item.slug}: none 🎉`);
      continue;
    }
    const labels = missingMustHave
      .slice(0, 10)
      .map((keyword) => `${keyword.keyword} (${pct(keyword.prevalence)}%)`);
    console.info(`  ${item.slug}: ${labels.join("; ")}`);
  }
}

function writeJson(report: ReturnType<typeof buildReport>, outputPath: string): void {
  const payload = {
    seo: {
      score: report.seo.score,
      staticScore: report.seo.staticScore,
      contentScore: report.seo.contentScore,
      checks: report.seo.checks,
    },
    freelanceSeo: {
      score: report.freelanceSeo.score,
      staticScore: report.freelanceSeo.staticScore,
      contentScore: report.freelanceSeo.contentScore,
      checks: report.freelanceSeo.checks,
    },
    ats: report.ats.map((item) => ({
      slug: item.slug,
      targetRole: item.targetRole,
      score: item.score,
      coverage: item.coverage,
      mustHaveCoverage: item.mustHaveCoverage,
      matched: item.matched.map((keyword) => keyword.keyword),
      missing: item.missing.map((keyword) => ({
        keyword: keyword.keyword,
        prevalence: keyword.prevalence,
      })),
    })),
  };

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, `${JSON.stringify(payload, null, 2)}\n`, "utf-8");
  console.info(`JSON report written to ${outputPath}`);
}

const jsonArg = process.argv.slice(2).find((arg) => arg.startsWith("--json"));
const report = buildReport();
printReport(report);

if (jsonArg !== undefined) {
  const eqIndex = jsonArg.indexOf("=");
  const outputPath =
    eqIndex >= 0
      ? path.resolve(jsonArg.slice(eqIndex + 1))
      : path.join(getProjectRoot(), "data", "seo-ats-report.json");
  writeJson(report, outputPath);
}
