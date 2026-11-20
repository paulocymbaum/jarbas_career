/**
 * Per-profile ATS scope definitions and CV variant content.
 * Edit here when tailoring resumes; regenerate seed via generate-cv-seed.mjs.
 */

import { getResumePublicPath } from "../lib/resume-filename.mjs";
import { portfolioProjects } from "../projects.config.mjs";

/** @typedef {{ experienceId: number; sortOrder: number; include?: boolean; roleOverride?: string; summaryOverride?: string; techOverride?: string[]; bullets: string[] }} CvExperienceVariant */

/** @typedef {{ slug: string; profileId: number; headline: string; targetRole: string; summary: string; keywords: string[]; pdfPath: string; skills: { category: string; items: string[] }[]; experiences: CvExperienceVariant[]; projectSlugs: string[]; educationIds: number[]; certificationIds: number[] }} ProfileCvVariant */

function projectIdBySlug(slug) {
  const index = portfolioProjects.findIndex((project) => project.slug === slug);
  if (index < 0) {
    throw new Error(`Unknown CV project slug: ${slug}`);
  }
  return index + 1;
}

/** @type {ProfileCvVariant[]} */
export const profileCvVariants = [];

export function buildCvSeedSql(esc) {
  let sql = "";

  sql +=
    "INSERT INTO professional_profile_cv (profile_id, headline, summary, keywords, target_role, locale, pdf_path, content_version, education_ids, certification_ids) VALUES\n";
  sql +=
    profileCvVariants
      .map(
        (v) =>
          `  (${v.profileId}, '${esc(v.headline)}', '${esc(v.summary)}', '${esc(JSON.stringify(v.keywords))}', '${esc(v.targetRole)}', 'en', '${esc(v.pdfPath)}', 2, '${esc(JSON.stringify(v.educationIds))}', '${esc(JSON.stringify(v.certificationIds))}')`,
      )
      .join(",\n") + ";\n\n";

  const expRows = [];
  for (const variant of profileCvVariants) {
    for (const exp of variant.experiences) {
      const include = exp.include === false ? 0 : 1;
      const techOverride = exp.techOverride?.length ? `'${esc(JSON.stringify(exp.techOverride))}'` : "NULL";
      expRows.push(
        `  (${variant.profileId}, ${exp.experienceId}, ${exp.sortOrder}, ${include}, ${exp.roleOverride ? `'${esc(exp.roleOverride)}'` : "NULL"}, ${exp.summaryOverride ? `'${esc(exp.summaryOverride)}'` : "NULL"}, ${techOverride})`,
      );
    }
  }
  sql +=
    "INSERT INTO professional_profile_experience (profile_id, experience_id, sort_order, include, role_override, summary_override, tech_override) VALUES\n";
  sql += expRows.join(",\n") + ";\n\n";

  const bulletRows = [];
  for (const variant of profileCvVariants) {
    for (const exp of variant.experiences) {
      exp.bullets.forEach((body, i) => {
        bulletRows.push(
          `  (${variant.profileId}, ${exp.experienceId}, '${esc(body)}', ${i}, NULL)`,
        );
      });
    }
  }
  sql +=
    "INSERT INTO professional_profile_experience_highlight (profile_id, experience_id, body, sort_order, source_highlight_id) VALUES\n";
  sql += bulletRows.join(",\n") + ";\n\n";

  const skillRows = [];
  for (const variant of profileCvVariants) {
    variant.skills.forEach((group, gi) => {
      group.items.forEach((label, si) => {
        skillRows.push(
          `  (${variant.profileId}, '${esc(group.category)}', '${esc(label)}', ${gi * 20 + si})`,
        );
      });
    });
  }
  sql +=
    "INSERT INTO professional_profile_cv_skill (profile_id, category, label, sort_order) VALUES\n";
  sql += skillRows.join(",\n") + ";\n\n";

  const projectRows = [];
  for (const variant of profileCvVariants) {
    variant.projectSlugs.forEach((slug, i) => {
      projectRows.push(`  (${variant.profileId}, ${projectIdBySlug(slug)}, ${i})`);
    });
  }
  sql +=
    "INSERT INTO professional_profile_cv_project (profile_id, project_id, sort_order) VALUES\n";
  sql += projectRows.join(",\n") + ";\n";

  return sql;
}
