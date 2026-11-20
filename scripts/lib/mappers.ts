import type { SiteContent } from "../../src/content/types.js";
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
} from "./queries.js";

function parseJsonArray<T>(value: string | null): T[] {
  if (!value) {
    return [];
  }

  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    throw new Error(`JSON inválido ao parsear array: ${value}`);
  }
}

function parseAboutParagraphs(value: string): string[] {
  try {
    const parsed: unknown = JSON.parse(value);
    if (!Array.isArray(parsed) || !parsed.every((item) => typeof item === "string")) {
      throw new Error("about_paragraphs deve ser um array JSON de strings");
    }
    return parsed;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`site_profile.about_paragraphs inválido: ${message}`);
  }
}

function mapProfessionalProfiles(
  profiles: ProfessionalProfileRow[],
  chips: ProfessionalProfileChipRow[],
): SiteContent["professionalProfiles"] {
  const chipsByProfile = new Map<number, { stack: string[]; skills: string[] }>();

  for (const chip of chips) {
    const entry = chipsByProfile.get(chip.profile_id) ?? { stack: [], skills: [] };
    if (chip.kind === "stack") {
      entry.stack.push(chip.label);
    } else {
      entry.skills.push(chip.label);
    }
    chipsByProfile.set(chip.profile_id, entry);
  }

  return profiles.map((profile) => {
    const chipGroup = chipsByProfile.get(profile.id) ?? { stack: [], skills: [] };

    return {
      title: profile.title,
      slug: profile.slug,
      ...(profile.summary ? { summary: profile.summary } : {}),
      ...(profile.description ? { description: profile.description } : {}),
      stack: chipGroup.stack,
      skills: chipGroup.skills,
      accent: profile.accent ?? "",
      resumeUrl: profile.resume_url,
    };
  });
}

function mapExperience(rows: ExperienceRow[]): SiteContent["experience"] {
  return rows.map((row) => ({
    role: row.role,
    company: row.company,
    start: row.start_date,
    end: row.end_date,
    ...(row.location ? { location: row.location } : {}),
    ...(row.summary ? { summary: row.summary } : {}),
    highlights: parseJsonArray<string>(row.highlights),
    tech: parseJsonArray<string>(row.tech),
  }));
}

type ProjectLinkJson = {
  kind: "github" | "demo" | "case_study" | "other";
  url: string;
  label?: string | null;
};

function mapProjects(rows: ProjectRow[]): SiteContent["projects"] {
  return rows.map((row) => {
    const links = parseJsonArray<ProjectLinkJson>(row.links).map((link) => ({
      kind: link.kind,
      url: link.url,
      ...(link.label ? { label: link.label } : {}),
    }));

    return {
      title: row.title,
      slug: row.slug,
      description: row.description,
      featured: Boolean(row.featured),
      ...(row.private_repo ? { privateRepo: true } : {}),
      ...(row.image_url ? { imageUrl: row.image_url } : {}),
      tech: parseJsonArray<string>(row.tech),
      links,
      gradient: row.gradient,
    };
  });
}

export function mapEducation(rows: EducationRow[]): SiteContent["education"] {
  return rows.map((row) => ({
    institution: row.institution,
    degree: row.degree,
    ...(row.start_date ? { start: row.start_date } : {}),
    ...(row.end_date !== null ? { end: row.end_date } : {}),
    ...(row.location ? { location: row.location } : {}),
    ...(row.summary ? { summary: row.summary } : {}),
  }));
}

export function mapCertifications(rows: CertificationRow[]): SiteContent["certifications"] {
  return rows.map((row) => ({
    name: row.name,
    issuer: row.issuer,
    ...(row.issued_date ? { issuedDate: row.issued_date } : {}),
    ...(row.expiry_date !== null ? { expiryDate: row.expiry_date } : {}),
    ...(row.verify_url ? { verifyUrl: row.verify_url } : {}),
  }));
}

export function mapArticles(rows: ArticleRow[]): SiteContent["articles"] {
  return rows
    .filter((row) => row.kind === "article")
    .map((row) => ({
    kind: row.kind,
    title: row.title,
    url: row.url,
    ...(row.author ? { author: row.author } : {}),
    ...(row.source ? { source: row.source } : {}),
    ...(row.read_time ? { readTime: row.read_time } : {}),
    ...(row.reactions !== null ? { reactions: row.reactions } : {}),
    ...(row.comments !== null ? { comments: row.comments } : {}),
    ...(row.featured ? { featured: true } : {}),
  }));
}

function mapSkills(rows: SkillCategoryRow[]): SiteContent["skills"] {
  return rows.map((row) => ({
    name: row.name,
    items: parseJsonArray<string>(row.items),
  }));
}

export function mapSiteContent(input: {
  profile: SiteProfileRow;
  professionalProfiles: ProfessionalProfileRow[];
  professionalProfileChips: ProfessionalProfileChipRow[];
  experience: ExperienceRow[];
  projects: ProjectRow[];
  education: EducationRow[];
  certifications: CertificationRow[];
  skills: SkillCategoryRow[];
  articles: ArticleRow[];
}): SiteContent {
  const links: SiteContent["links"] = {};
  if (input.profile.github_url) {
    links.github = input.profile.github_url;
  }
  if (input.profile.linkedin_url) {
    links.linkedin = input.profile.linkedin_url;
  }

  return {
    name: input.profile.name,
    title: input.profile.title,
    pitch: input.profile.pitch,
    aboutParagraphs: parseAboutParagraphs(input.profile.about_paragraphs),
    ...(input.profile.photo_url ? { photoUrl: input.profile.photo_url } : {}),
    professionalProfiles: mapProfessionalProfiles(
      input.professionalProfiles,
      input.professionalProfileChips,
    ),
    email: input.profile.email,
    city: input.profile.city,
    country: input.profile.country,
    links,
    ...(input.profile.footer_note ? { footerNote: input.profile.footer_note } : {}),
    experience: mapExperience(input.experience),
    education: mapEducation(input.education),
    projects: mapProjects(input.projects),
    skills: mapSkills(input.skills),
    certifications: mapCertifications(input.certifications),
    articles: mapArticles(input.articles),
  };
}
