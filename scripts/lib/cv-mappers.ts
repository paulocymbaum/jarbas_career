import type {
  Certification,
  Education,
  Experience,
  ProfileCvDocument,
  ResumeContact,
  ResumeProject,
  SkillCategory,
} from "../../src/content/types.js";
import { mapCertifications, mapEducation } from "./mappers.js";
import type {
  CertificationRow,
  EducationRow,
  ExperienceRow,
  ProjectRow,
  SiteProfileRow,
} from "./queries.js";
import type {
  ProfileCvExperienceRow,
  ProfileCvHighlightRow,
  ProfileCvProfileRow,
  ProfileCvProjectRow,
  ProfileCvRow,
  ProfileCvSkillRow,
} from "./cv-queries.js";

function parseKeywords(value: string | null): string[] {
  if (!value) return [];
  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((item) => typeof item === "string") : [];
  } catch {
    return [];
  }
}

function parseJsonArray<T>(value: string | null): T[] {
  if (!value) return [];
  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

function parseIdList(value: string | null): number[] {
  return parseJsonArray<unknown>(value).filter((item): item is number => typeof item === "number");
}

function selectByIds<T extends { id: number }>(rows: T[], ids: number[]): T[] {
  if (ids.length === 0) return rows;
  const byId = new Map(rows.map((row) => [row.id, row]));
  return ids.map((id) => byId.get(id)).filter((row): row is T => row !== undefined);
}

/** "YYYY-MM" → "Mon YYYY"; a bare "YYYY" stays unchanged. Single source of ATS-friendly date formatting. */
export function formatMonthYear(value: string): string {
  const [year, month] = value.split("-");
  if (!month) return year;
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  return `${months[Number(month) - 1]} ${year}`;
}

/** "YYYY-MM" start/end → "Mon YYYY – Mon YYYY/Present" (ATS-friendly month-year range). */
export function formatDateRange(start: string, end: string | null): string {
  const endLabel = end ? formatMonthYear(end) : "Present";
  return `${formatMonthYear(start)} – ${endLabel}`;
}

export function mapResumeContact(profile: SiteProfileRow): ResumeContact {
  return {
    name: profile.name,
    email: profile.email,
    city: profile.city,
    country: profile.country,
    ...(profile.github_url ? { github: profile.github_url } : {}),
    ...(profile.linkedin_url ? { linkedin: profile.linkedin_url } : {}),
    ...(profile.website_url ? { portfolioUrl: profile.website_url } : {}),
  };
}

export function mapProfileCvDocuments(input: {
  profiles: ProfileCvProfileRow[];
  cvRows: ProfileCvRow[];
  cvExperience: ProfileCvExperienceRow[];
  cvHighlights: ProfileCvHighlightRow[];
  cvSkills: ProfileCvSkillRow[];
  cvProjects: ProfileCvProjectRow[];
  canonicalExperience: ExperienceRow[];
  projects: ProjectRow[];
  education: EducationRow[];
  certifications: CertificationRow[];
}): ProfileCvDocument[] {
  const experienceById = new Map(input.canonicalExperience.map((row) => [row.id, row]));
  const projectById = new Map(input.projects.map((row) => [row.id, row]));

  const highlightsByProfileExp = new Map<string, string[]>();
  for (const row of input.cvHighlights) {
    const key = `${row.profile_id}:${row.experience_id}`;
    const list = highlightsByProfileExp.get(key) ?? [];
    list.push(row.body);
    highlightsByProfileExp.set(key, list);
  }

  const skillsByProfile = new Map<number, SkillCategory[]>();
  for (const row of input.cvSkills) {
    const groups = skillsByProfile.get(row.profile_id) ?? [];
    let group = groups.find((g) => g.name === row.category);
    if (!group) {
      group = { name: row.category, items: [] };
      groups.push(group);
    }
    group.items.push(row.label);
    skillsByProfile.set(row.profile_id, groups);
  }

  const profileMetaById = new Map(input.profiles.map((row) => [row.id, row]));

  return input.cvRows
    .map((cvRow) => {
      const meta = profileMetaById.get(cvRow.profile_id);
      if (!meta) return null;

      const profileExperiences = input.cvExperience
        .filter((row) => row.profile_id === cvRow.profile_id && row.include === 1)
        .sort((a, b) => a.sort_order - b.sort_order);

      const experience = profileExperiences
        .map((row) => {
          const canonical = experienceById.get(row.experience_id);
          if (!canonical) return null;

          const highlights =
            highlightsByProfileExp.get(`${row.profile_id}:${row.experience_id}`) ?? [];
          const techOverride = parseJsonArray<string>(row.tech_override);
          const tech = techOverride.length > 0 ? techOverride : parseJsonArray<string>(canonical.tech);

          const mapped: Experience = {
            role: row.role_override ?? canonical.role,
            company: canonical.company,
            start: canonical.start_date,
            end: canonical.end_date,
            ...(canonical.location ? { location: canonical.location } : {}),
            highlights,
            tech,
          };

          return mapped;
        })
        .filter((item): item is Experience => item !== null);

      const projects: ResumeProject[] = input.cvProjects
        .filter((row) => row.profile_id === cvRow.profile_id)
        .sort((a, b) => a.sort_order - b.sort_order)
        .map((row) => {
          const project = projectById.get(row.project_id);
          if (!project) return null;
          return {
            title: project.title,
            slug: project.slug,
            description: project.description,
            tech: parseJsonArray<string>(project.tech),
          };
        })
        .filter((item): item is ResumeProject => item !== null);

      const educationIds = parseIdList(cvRow.education_ids);
      const certificationIds = parseIdList(cvRow.certification_ids);
      const education: Education[] = mapEducation(
        educationIds.length ? selectByIds(input.education, educationIds) : input.education.slice(0, 3),
      );
      const certifications: Certification[] = mapCertifications(
        certificationIds.length
          ? selectByIds(input.certifications, certificationIds)
          : input.certifications.slice(0, 3),
      );

      const doc: ProfileCvDocument = {
        slug: meta.slug,
        title: meta.title,
        headline: cvRow.headline ?? meta.title,
        targetRole: cvRow.target_role ?? meta.title,
        summary: cvRow.summary,
        keywords: parseKeywords(cvRow.keywords),
        skills: skillsByProfile.get(cvRow.profile_id) ?? [],
        experience,
        projects,
        education,
        certifications,
        pdfPath: cvRow.pdf_path ?? meta.resume_url,
        locale: cvRow.locale,
        contentVersion: cvRow.content_version,
        ...(cvRow.page_count !== null ? { pageCount: cvRow.page_count } : {}),
        ...(cvRow.generated_at ? { generatedAt: cvRow.generated_at } : {}),
      };

      return doc;
    })
    .filter((item): item is ProfileCvDocument => item !== null);
}

export function formatExperienceDates(experience: Experience): string {
  return formatDateRange(experience.start, experience.end);
}
