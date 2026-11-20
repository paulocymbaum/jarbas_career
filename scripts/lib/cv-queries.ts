import type Database from "better-sqlite3";

export type ProfileCvRow = {
  profile_id: number;
  headline: string | null;
  summary: string;
  keywords: string | null;
  target_role: string | null;
  locale: string;
  pdf_path: string | null;
  page_count: number | null;
  generated_at: string | null;
  content_version: number;
  education_ids: string | null;
  certification_ids: string | null;
};

export type ProfileCvExperienceRow = {
  profile_id: number;
  experience_id: number;
  sort_order: number;
  include: number;
  role_override: string | null;
  summary_override: string | null;
  tech_override: string | null;
};

export type ProfileCvHighlightRow = {
  id: number;
  profile_id: number;
  experience_id: number;
  body: string;
  sort_order: number;
  source_highlight_id: number | null;
};

export type ProfileCvSkillRow = {
  profile_id: number;
  category: string;
  label: string;
  sort_order: number;
};

export type ProfileCvProjectRow = {
  profile_id: number;
  project_id: number;
  sort_order: number;
};

export type ProfileCvProfileRow = {
  id: number;
  slug: string;
  title: string;
  resume_url: string;
};

const PROFILE_CV_SQL = `SELECT * FROM professional_profile_cv ORDER BY profile_id`;

const PROFILE_CV_EXPERIENCE_SQL = `
  SELECT * FROM professional_profile_experience
  ORDER BY profile_id, sort_order
`;

const PROFILE_CV_HIGHLIGHTS_SQL = `
  SELECT * FROM professional_profile_experience_highlight
  ORDER BY profile_id, experience_id, sort_order
`;

const PROFILE_CV_SKILLS_SQL = `
  SELECT * FROM professional_profile_cv_skill
  ORDER BY profile_id, sort_order
`;

const PROFILE_CV_PROJECTS_SQL = `
  SELECT * FROM professional_profile_cv_project
  ORDER BY profile_id, sort_order
`;

const PROFILES_WITH_CV_SQL = `
  SELECT p.id, p.slug, p.title, p.resume_url
  FROM professional_profile p
  INNER JOIN professional_profile_cv cv ON cv.profile_id = p.id
  ORDER BY p.sort_order
`;

export function fetchProfileCvRows(db: Database.Database): ProfileCvRow[] {
  return db.prepare(PROFILE_CV_SQL).all() as ProfileCvRow[];
}

export function fetchProfileCvExperienceRows(db: Database.Database): ProfileCvExperienceRow[] {
  return db.prepare(PROFILE_CV_EXPERIENCE_SQL).all() as ProfileCvExperienceRow[];
}

export function fetchProfileCvHighlightRows(db: Database.Database): ProfileCvHighlightRow[] {
  return db.prepare(PROFILE_CV_HIGHLIGHTS_SQL).all() as ProfileCvHighlightRow[];
}

export function fetchProfileCvSkillRows(db: Database.Database): ProfileCvSkillRow[] {
  return db.prepare(PROFILE_CV_SKILLS_SQL).all() as ProfileCvSkillRow[];
}

export function fetchProfileCvProjectRows(db: Database.Database): ProfileCvProjectRow[] {
  return db.prepare(PROFILE_CV_PROJECTS_SQL).all() as ProfileCvProjectRow[];
}

export function fetchProfilesWithCv(db: Database.Database): ProfileCvProfileRow[] {
  return db.prepare(PROFILES_WITH_CV_SQL).all() as ProfileCvProfileRow[];
}

export function updateProfileCvMetadata(
  db: Database.Database,
  profileId: number,
  pageCount: number,
  generatedAt: string,
): void {
  db.prepare(
    `UPDATE professional_profile_cv
     SET page_count = ?, generated_at = ?
     WHERE profile_id = ?`,
  ).run(pageCount, generatedAt, profileId);
}

export function syncProfileResumeUrl(
  db: Database.Database,
  profileId: number,
  pdfPath: string,
): void {
  db.prepare(`UPDATE professional_profile SET resume_url = ? WHERE id = ?`).run(pdfPath, profileId);
}
