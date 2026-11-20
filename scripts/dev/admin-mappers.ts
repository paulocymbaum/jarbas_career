import type {
  ArticleRow,
  CertificationRow,
  EducationRow,
  ExperienceRow,
  ProfessionalProfileChipRow,
  ProfessionalProfileRow,
  ProjectRow,
  SiteProfileRow,
  SkillCategoryRow,
} from "../lib/queries.js";

function parseJsonArray<T>(value: string | null): T[] {
  if (!value) return [];
  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

function parseAboutParagraphs(value: string): string[] {
  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed) ? (parsed as string[]) : [];
  } catch {
    return [];
  }
}

export function mapSiteProfileApi(row: SiteProfileRow) {
  return {
    name: row.name,
    title: row.title,
    pitch: row.pitch,
    aboutParagraphs: parseAboutParagraphs(row.about_paragraphs),
    photoUrl: row.photo_url,
    email: row.email,
    city: row.city,
    country: row.country,
    githubUrl: row.github_url,
    linkedinUrl: row.linkedin_url,
    twitterUrl: row.twitter_url,
    footerNote: row.footer_note,
  };
}

export function mapProfessionalProfileApi(
  row: ProfessionalProfileRow,
  chips: ProfessionalProfileChipRow[],
) {
  const profileChips = chips.filter((chip) => chip.profile_id === row.id);
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    summary: row.summary,
    description: row.description,
    accent: row.accent,
    resumeUrl: row.resume_url,
    sortOrder: row.sort_order,
    archived: Boolean(row.archived),
    stack: profileChips.filter((c) => c.kind === "stack").map((c) => c.label),
    skills: profileChips.filter((c) => c.kind === "skill").map((c) => c.label),
  };
}

export function mapExperienceApi(row: ExperienceRow) {
  return {
    id: row.id,
    role: row.role,
    company: row.company,
    startDate: row.start_date,
    endDate: row.end_date,
    location: row.location,
    summary: row.summary,
    sortOrder: row.sort_order,
    archived: Boolean(row.archived),
    highlights: parseJsonArray<string>(row.highlights),
    tech: parseJsonArray<string>(row.tech),
  };
}

export function mapProjectApi(row: ProjectRow) {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    description: row.description,
    imageUrl: row.image_url,
    gradient: row.gradient,
    featured: Boolean(row.featured),
    privateRepo: Boolean(row.private_repo),
    sortOrder: row.sort_order,
    archived: Boolean(row.archived),
    links: parseJsonArray<{ kind: string; url: string; label?: string | null }>(row.links),
    tech: parseJsonArray<string>(row.tech),
  };
}

export function mapEducationApi(row: EducationRow) {
  return {
    id: row.id,
    institution: row.institution,
    degree: row.degree,
    field: row.field,
    startDate: row.start_date,
    endDate: row.end_date,
    location: row.location,
    summary: row.summary,
    sortOrder: row.sort_order,
    archived: Boolean(row.archived),
  };
}

export function mapCertificationApi(row: CertificationRow) {
  return {
    id: row.id,
    name: row.name,
    issuer: row.issuer,
    issuedDate: row.issued_date,
    expiryDate: row.expiry_date,
    credentialId: row.credential_id,
    verifyUrl: row.verify_url,
    sortOrder: row.sort_order,
    archived: Boolean(row.archived),
  };
}

export function mapSkillCategoryApi(row: SkillCategoryRow) {
  return {
    id: row.id,
    name: row.name,
    sortOrder: row.sort_order,
    archived: Boolean(row.archived),
    items: parseJsonArray<string>(row.items),
  };
}

export function mapArticleApi(row: ArticleRow) {
  return {
    id: row.id,
    kind: row.kind,
    title: row.title,
    url: row.url,
    author: row.author,
    source: row.source,
    readTime: row.read_time,
    reactions: row.reactions,
    comments: row.comments,
    externalId: row.external_id,
    featured: Boolean(row.featured),
    sortOrder: row.sort_order,
    archived: Boolean(row.archived),
  };
}
