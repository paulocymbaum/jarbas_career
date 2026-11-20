import type Database from "better-sqlite3";

export type SiteProfileRow = {
  id: number;
  name: string;
  title: string;
  pitch: string;
  about_paragraphs: string;
  photo_url: string | null;
  email: string;
  city: string;
  country: string;
  github_url: string | null;
  linkedin_url: string | null;
  website_url: string | null;
  twitter_url: string | null;
  footer_note: string | null;
};

export type ProfessionalProfileRow = {
  id: number;
  title: string;
  slug: string;
  summary: string | null;
  description: string | null;
  accent: string | null;
  resume_url: string;
  sort_order: number;
  archived: number;
};

export type ProfessionalProfileChipRow = {
  profile_id: number;
  label: string;
  kind: "stack" | "skill";
  sort_order: number;
};

export type ExperienceRow = {
  id: number;
  role: string;
  company: string;
  start_date: string;
  end_date: string | null;
  location: string | null;
  summary: string | null;
  sort_order: number;
  archived: number;
  highlights: string | null;
  tech: string | null;
};

export type ProjectRow = {
  id: number;
  title: string;
  slug: string;
  description: string;
  image_url: string | null;
  gradient: string;
  featured: number;
  private_repo: number;
  sort_order: number;
  archived: number;
  links: string | null;
  tech: string | null;
};

export type EducationRow = {
  id: number;
  institution: string;
  degree: string;
  field: string | null;
  start_date: string | null;
  end_date: string | null;
  location: string | null;
  summary: string | null;
  sort_order: number;
  archived: number;
};

export type CertificationRow = {
  id: number;
  name: string;
  issuer: string;
  issued_date: string | null;
  expiry_date: string | null;
  credential_id: string | null;
  verify_url: string | null;
  sort_order: number;
  archived: number;
};

export type SkillCategoryRow = {
  id: number;
  name: string;
  sort_order: number;
  archived: number;
  items: string | null;
};

export type ArticleRow = {
  id: number;
  kind: "article" | "post";
  title: string;
  url: string;
  author: string | null;
  source: string | null;
  read_time: string | null;
  reactions: number | null;
  comments: number | null;
  external_id: string | null;
  featured: number;
  sort_order: number;
  archived: number;
};

const SITE_PROFILE_SQL = `
  SELECT * FROM site_profile WHERE id = 1
`;

const PROFESSIONAL_PROFILES_SQL = `
  SELECT * FROM professional_profile
  WHERE archived = 0
  ORDER BY sort_order ASC, title ASC
`;

const PROFESSIONAL_PROFILES_ADMIN_SQL = `
  SELECT * FROM professional_profile
  ORDER BY archived ASC, sort_order ASC, title ASC
`;

const PROFESSIONAL_PROFILE_CHIPS_SQL = `
  SELECT profile_id, label, kind, sort_order
  FROM professional_profile_chip
  ORDER BY profile_id, kind, sort_order
`;

const EXPERIENCE_SQL = `
  SELECT e.*,
    (SELECT json_group_array(h.body)
     FROM (
       SELECT body FROM experience_highlight
       WHERE experience_id = e.id
       ORDER BY sort_order
     ) h) AS highlights,
    (SELECT json_group_array(t.label)
     FROM (
       SELECT label FROM experience_tech
       WHERE experience_id = e.id
       ORDER BY sort_order
     ) t) AS tech
  FROM experience e
  WHERE e.archived = 0
  ORDER BY e.sort_order ASC, e.id ASC
`;

const EXPERIENCE_ADMIN_SQL = `
  SELECT e.*,
    (SELECT json_group_array(h.body)
     FROM (
       SELECT body FROM experience_highlight
       WHERE experience_id = e.id
       ORDER BY sort_order
     ) h) AS highlights,
    (SELECT json_group_array(t.label)
     FROM (
       SELECT label FROM experience_tech
       WHERE experience_id = e.id
       ORDER BY sort_order
     ) t) AS tech
  FROM experience e
  ORDER BY e.archived ASC, e.sort_order ASC, e.id ASC
`;

const PROJECTS_SQL = `
  SELECT p.*,
    (SELECT json_group_array(json_object('kind', l.kind, 'url', l.url, 'label', l.label))
     FROM (
       SELECT kind, url, label FROM project_link
       WHERE project_id = p.id
       ORDER BY sort_order
     ) l) AS links,
    (SELECT json_group_array(t.label)
     FROM (
       SELECT label FROM project_tech
       WHERE project_id = p.id
       ORDER BY sort_order
     ) t) AS tech
  FROM project p
  WHERE p.archived = 0
  ORDER BY p.featured DESC, p.sort_order, p.title
`;

const PROJECTS_ADMIN_SQL = `
  SELECT p.*,
    (SELECT json_group_array(json_object('kind', l.kind, 'url', l.url, 'label', l.label))
     FROM (
       SELECT kind, url, label FROM project_link
       WHERE project_id = p.id
       ORDER BY sort_order
     ) l) AS links,
    (SELECT json_group_array(t.label)
     FROM (
       SELECT label FROM project_tech
       WHERE project_id = p.id
       ORDER BY sort_order
     ) t) AS tech
  FROM project p
  ORDER BY p.archived ASC, p.sort_order ASC, p.title ASC
`;

const EDUCATION_SQL = `
  SELECT * FROM education
  WHERE archived = 0
  ORDER BY sort_order ASC, id ASC
`;

const EDUCATION_ADMIN_SQL = `
  SELECT * FROM education
  ORDER BY archived ASC, sort_order ASC, id ASC
`;

const CERTIFICATIONS_SQL = `
  SELECT * FROM certification
  WHERE archived = 0
  ORDER BY sort_order ASC, id ASC
`;

const CERTIFICATIONS_ADMIN_SQL = `
  SELECT * FROM certification
  ORDER BY archived ASC, sort_order ASC, id ASC
`;

const SKILLS_SQL = `
  SELECT c.id, c.name, c.sort_order, c.archived,
    (SELECT json_group_array(i.label)
     FROM (
       SELECT label FROM skill_item
       WHERE category_id = c.id
       ORDER BY sort_order
     ) i) AS items
  FROM skill_category c
  WHERE c.archived = 0
  ORDER BY c.sort_order
`;

const SKILLS_ADMIN_SQL = `
  SELECT c.id, c.name, c.sort_order, c.archived,
    (SELECT json_group_array(i.label)
     FROM (
       SELECT label FROM skill_item
       WHERE category_id = c.id
       ORDER BY sort_order
     ) i) AS items
  FROM skill_category c
  ORDER BY c.archived ASC, c.sort_order ASC, c.id ASC
`;

const ARTICLES_SQL = `
  SELECT * FROM article
  WHERE archived = 0
  ORDER BY featured DESC, sort_order ASC, id DESC
`;

const ARTICLES_ADMIN_SQL = `
  SELECT * FROM article
  ORDER BY archived ASC, sort_order ASC, id ASC
`;

export function fetchSiteProfile(db: Database.Database): SiteProfileRow | undefined {
  return db.prepare(SITE_PROFILE_SQL).get() as SiteProfileRow | undefined;
}

export function fetchProfessionalProfiles(db: Database.Database): ProfessionalProfileRow[] {
  return db.prepare(PROFESSIONAL_PROFILES_SQL).all() as ProfessionalProfileRow[];
}

export function fetchProfessionalProfilesAdmin(db: Database.Database): ProfessionalProfileRow[] {
  return db.prepare(PROFESSIONAL_PROFILES_ADMIN_SQL).all() as ProfessionalProfileRow[];
}

export function fetchProfessionalProfileChips(
  db: Database.Database,
): ProfessionalProfileChipRow[] {
  return db.prepare(PROFESSIONAL_PROFILE_CHIPS_SQL).all() as ProfessionalProfileChipRow[];
}

export function fetchExperience(db: Database.Database): ExperienceRow[] {
  return db.prepare(EXPERIENCE_SQL).all() as ExperienceRow[];
}

export function fetchExperienceAdmin(db: Database.Database): ExperienceRow[] {
  return db.prepare(EXPERIENCE_ADMIN_SQL).all() as ExperienceRow[];
}

export function fetchProjects(db: Database.Database): ProjectRow[] {
  return db.prepare(PROJECTS_SQL).all() as ProjectRow[];
}

export function fetchProjectsAdmin(db: Database.Database): ProjectRow[] {
  return db.prepare(PROJECTS_ADMIN_SQL).all() as ProjectRow[];
}

export function fetchEducation(db: Database.Database): EducationRow[] {
  return db.prepare(EDUCATION_SQL).all() as EducationRow[];
}

export function fetchEducationAdmin(db: Database.Database): EducationRow[] {
  return db.prepare(EDUCATION_ADMIN_SQL).all() as EducationRow[];
}

export function fetchCertifications(db: Database.Database): CertificationRow[] {
  return db.prepare(CERTIFICATIONS_SQL).all() as CertificationRow[];
}

export function fetchCertificationsAdmin(db: Database.Database): CertificationRow[] {
  return db.prepare(CERTIFICATIONS_ADMIN_SQL).all() as CertificationRow[];
}

export function fetchSkills(db: Database.Database): SkillCategoryRow[] {
  return db.prepare(SKILLS_SQL).all() as SkillCategoryRow[];
}

export function fetchSkillsAdmin(db: Database.Database): SkillCategoryRow[] {
  return db.prepare(SKILLS_ADMIN_SQL).all() as SkillCategoryRow[];
}

export function fetchArticles(db: Database.Database): ArticleRow[] {
  return db.prepare(ARTICLES_SQL).all() as ArticleRow[];
}

export function fetchArticlesAdmin(db: Database.Database): ArticleRow[] {
  return db.prepare(ARTICLES_ADMIN_SQL).all() as ArticleRow[];
}
