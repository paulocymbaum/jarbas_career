import type { ExperienceRow, ProjectRow } from "../../lib/queries.js";
import type { UpworkConfig } from "./config.js";
import type {
  CreateEmploymentRecordInput,
  OtherExperienceInput,
  UpworkCurrentUser,
  UpworkEmploymentPayload,
  UpworkProjectPayload,
  UpworkSyncAction,
  UpworkSyncPlan,
  UpworkSyncState,
} from "./types.js";

const EXPERIENCE_MARKER_PREFIX = "portfolio-cv:experience:";
const PROJECT_MARKER_PREFIX = "portfolio-cv:project:";

export function experienceMarker(portfolioId: number): string {
  return `${EXPERIENCE_MARKER_PREFIX}${portfolioId}`;
}

export function projectMarker(slug: string): string {
  return `${PROJECT_MARKER_PREFIX}${slug}`;
}

function parseJsonArray(value: string | null): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value) as unknown;
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}

function parseProjectLinks(value: string | null): Array<{ kind: string; url: string; label: string | null }> {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((item): item is { kind: string; url: string; label?: string | null } => {
        return Boolean(item && typeof item === "object" && "url" in item);
      })
      .map((item) => ({
        kind: String(item.kind ?? "other"),
        url: String(item.url),
        label: item.label ?? null,
      }));
  } catch {
    return [];
  }
}

export function normalizeUpworkDate(value: string | null | undefined): string | undefined {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
  if (/^\d{4}-\d{2}$/.test(trimmed)) return `${trimmed}-01`;
  if (/^\d{4}$/.test(trimmed)) return `${trimmed}-01-01`;
  return trimmed;
}

export function parseLocation(
  location: string | null,
  defaults: { city: string; country: string },
): { city: string; country: string } {
  if (!location?.trim()) {
    return defaults;
  }

  const parts = location.split(",").map((part) => part.trim()).filter(Boolean);
  if (parts.length >= 2) {
    const city = parts[0] ?? defaults.city;
    const region = parts[parts.length - 1] ?? "";
    const looksLikeStateCode = /^[A-Za-z]{2,3}$/.test(region);

    return {
      city,
      country: looksLikeStateCode ? defaults.country : region,
    };
  }

  return {
    city: parts[0] ?? defaults.city,
    country: defaults.country,
  };
}

function buildExperienceDescription(row: ExperienceRow): string {
  const highlights = parseJsonArray(row.highlights);
  const tech = parseJsonArray(row.tech);
  const sections: string[] = [];

  if (row.summary?.trim()) {
    sections.push(row.summary.trim());
  }

  if (highlights.length) {
    sections.push(highlights.map((item) => `• ${item}`).join("\n"));
  }

  if (tech.length) {
    sections.push(`Technologies: ${tech.join(", ")}`);
  }

  sections.push(experienceMarker(row.id));
  return sections.join("\n\n");
}

function buildProjectDescription(row: ProjectRow): string {
  const tech = parseJsonArray(row.tech);
  const links = parseProjectLinks(row.links);
  const sections: string[] = [row.description.trim()];

  if (tech.length) {
    sections.push(`Technologies: ${tech.join(", ")}`);
  }

  if (links.length) {
    const linkLines = links.map((link) => {
      const label = link.label?.trim() || link.kind;
      return `• ${label}: ${link.url}`;
    });
    sections.push(linkLines.join("\n"));
  }

  sections.push(projectMarker(row.slug));
  return sections.join("\n\n");
}

export function mapExperienceRows(
  rows: ExperienceRow[],
  config: UpworkConfig,
): UpworkEmploymentPayload[] {
  const defaults = { city: config.defaultCity, country: config.defaultCountry };

  return rows.map((row) => {
    const location = parseLocation(row.location, defaults);
    const input: CreateEmploymentRecordInput = {
      companyName: row.company,
      jobTitle: row.role,
      role: row.role,
      startDate: normalizeUpworkDate(row.start_date) ?? "2000-01-01",
      endDate: normalizeUpworkDate(row.end_date),
      description: buildExperienceDescription(row),
      city: location.city,
      country: location.country,
    };

    return {
      portfolioId: row.id,
      marker: experienceMarker(row.id),
      input,
      matchKey: `${row.company}|${row.role}|${input.startDate}`.toLowerCase(),
    };
  });
}

export function mapProjectRows(rows: ProjectRow[], config: UpworkConfig): UpworkProjectPayload[] {
  const filtered = rows.filter((row) => {
    if (config.featuredProjectsOnly && !row.featured) return false;
    if (!config.includePrivateRepos && row.private_repo) return false;
    return true;
  });

  return filtered.map((row) => {
    const subject = `${config.projectSubjectPrefix}: ${row.title}`;
    const input: OtherExperienceInput = {
      subject,
      description: buildProjectDescription(row),
      active: true,
    };

    return {
      portfolioSlug: row.slug,
      marker: projectMarker(row.slug),
      input,
      matchKey: subject.toLowerCase(),
    };
  });
}

function findEmploymentMatch(
  payload: UpworkEmploymentPayload,
  profile: UpworkCurrentUser,
  state: UpworkSyncState,
): string | undefined {
  const stateId = state.experience[String(payload.portfolioId)]?.upworkId;
  if (stateId) return stateId;

  const byMarker = profile.freelancerProfile?.employmentRecords.find((record) =>
    record.description?.includes(payload.marker),
  );
  if (byMarker) return byMarker.id;

  return profile.freelancerProfile?.employmentRecords.find((record) => {
    const key = `${record.companyName}|${record.jobTitle}|${normalizeUpworkDate(record.startDate) ?? ""}`.toLowerCase();
    return key === payload.matchKey;
  })?.id;
}

function findProjectMatch(
  payload: UpworkProjectPayload,
  profile: UpworkCurrentUser,
  state: UpworkSyncState,
): string | undefined {
  const stateId = state.projects[payload.portfolioSlug]?.upworkId;
  if (stateId) return stateId;

  const byMarker = profile.freelancerProfile?.otherExperiences.find((record) =>
    record.description.includes(payload.marker),
  );
  if (byMarker) return byMarker.id;

  return profile.freelancerProfile?.otherExperiences.find(
    (record) => record.subject.toLowerCase() === payload.matchKey,
  )?.id;
}

export function buildSyncPlan(options: {
  profile: UpworkCurrentUser;
  experience: UpworkEmploymentPayload[];
  projects: UpworkProjectPayload[];
  state: UpworkSyncState;
  syncExperience: boolean;
  syncProjects: boolean;
}): UpworkSyncPlan {
  const warnings: string[] = [];
  const actions: UpworkSyncAction[] = [];

  if (!options.profile.freelancerProfile) {
    warnings.push("No freelancer profile returned by Upwork. Check API key permissions and OAuth scopes.");
  }

  if (options.syncExperience) {
    for (const payload of options.experience) {
      const upworkId = findEmploymentMatch(payload, options.profile, options.state);
      if (upworkId) {
        actions.push({
          kind: "employment",
          action: "update",
          portfolioId: payload.portfolioId,
          upworkId,
          input: { id: upworkId, ...payload.input },
        });
      } else {
        actions.push({
          kind: "employment",
          action: "create",
          portfolioId: payload.portfolioId,
          input: payload.input,
        });
      }
    }
  }

  if (options.syncProjects) {
    for (const payload of options.projects) {
      const upworkId = findProjectMatch(payload, options.profile, options.state);
      if (upworkId) {
        actions.push({
          kind: "project",
          action: "update",
          portfolioSlug: payload.portfolioSlug,
          upworkId,
          input: { id: upworkId, ...payload.input },
        });
      } else {
        actions.push({
          kind: "project",
          action: "create",
          portfolioSlug: payload.portfolioSlug,
          input: payload.input,
        });
      }
    }
  }

  return {
    userId: options.profile.id,
    userName: options.profile.name,
    actions,
    warnings,
  };
}

export function printSyncPlan(plan: UpworkSyncPlan, dryRun: boolean): void {
  console.info(`\nUpwork sync plan for ${plan.userName} (${plan.userId})`);
  console.info(dryRun ? "Mode: dry-run (pass --apply to push changes)\n" : "Mode: apply\n");

  for (const warning of plan.warnings) {
    console.warn(`⚠ ${warning}`);
  }

  const employment = plan.actions.filter((action) => action.kind === "employment");
  const projects = plan.actions.filter((action) => action.kind === "project");

  console.info(`Employment: ${employment.length} (${employment.filter((a) => a.action === "create").length} create, ${employment.filter((a) => a.action === "update").length} update)`);
  for (const action of employment) {
    if (action.kind !== "employment") continue;
    const input = action.input as CreateEmploymentRecordInput & { id?: string };
    console.info(`  [${action.action}] #${action.portfolioId} ${input.jobTitle} @ ${input.companyName}`);
  }

  console.info(`\nProjects (other experience): ${projects.length} (${projects.filter((a) => a.action === "create").length} create, ${projects.filter((a) => a.action === "update").length} update)`);
  for (const action of projects) {
    if (action.kind !== "project") continue;
    const input = action.input as OtherExperienceInput & { id?: string };
    console.info(`  [${action.action}] ${action.portfolioSlug} — ${input.subject}`);
  }

  console.info("");
}
