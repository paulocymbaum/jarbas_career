import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import {
  fetchAllAccessibleRepos,
  fetchReadme,
  normalizeGithubRepoUrl,
  parseGithubRepoUrl,
  type GithubRepoSummary,
} from "./github-api.js";
import { getProjectRoot } from "./db.js";
import {
  GITHUB_OWNER_PERSONAL,
  GITHUB_OWNER_YourCompany,
  portfolioProjects,
} from "../projects.config.mjs";

const readmeDir = path.join(getProjectRoot(), "content", "projects");
const legacyReadmeDir = path.join(getProjectRoot(), "scripts", "content", "projects");

export function migrateLegacyReadmeFiles(): void {
  if (!fs.existsSync(legacyReadmeDir)) return;

  fs.mkdirSync(readmeDir, { recursive: true });

  for (const file of fs.readdirSync(legacyReadmeDir)) {
    if (!file.endsWith(".md")) continue;
    const source = path.join(legacyReadmeDir, file);
    const target = path.join(readmeDir, file);
    if (!fs.existsSync(target) || fs.statSync(source).mtimeMs > fs.statSync(target).mtimeMs) {
      fs.copyFileSync(source, target);
      console.info(`  migrated ${file} → content/projects/`);
    }
  }
}

export type SyncTarget = {
  slug: string;
  owner: string;
  repo: string;
};

export type SyncResult = {
  synced: number;
  skipped: number;
  total: number;
  errors: string[];
};

function ghApi(pathname: string, jq?: string): string {
  const jqArg = jq ? ` --jq '${jq}'` : "";
  return execSync(`gh api "${pathname}"${jqArg}`, {
    encoding: "utf-8",
    stdio: ["pipe", "pipe", "pipe"],
  }).trim();
}

function listAccessibleOwnerRepos(owner: string) {
  try {
    const repos = JSON.parse(
      ghApi(`user/repos?affiliation=owner,collaborator,organization_member&per_page=100`),
    ) as Array<{
      owner: { login: string };
      name: string;
      private: boolean;
      description: string | null;
    }>;

    return repos
      .filter((repo) => repo.owner.login === owner)
      .map((repo) => ({
        name: repo.name,
        private: repo.private,
        description: repo.description ?? "",
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  } catch {
    return [];
  }
}

export function discoverOwner(owner: string): void {
  const configured = new Set(
    portfolioProjects
      .filter((project) => (project.owner ?? GITHUB_OWNER_PERSONAL) === owner)
      .map((project) => project.repo),
  );

  const repos = listAccessibleOwnerRepos(owner);
  if (!repos.length) {
    console.warn(`No accessible repositories found for ${owner}.`);
    return;
  }

  console.info(`Repositories accessible for ${owner}:`);
  for (const repo of repos) {
    const status = configured.has(repo.name) ? "configured" : "missing from projects.config.mjs";
    console.info(`  - ${repo.name} (${repo.private ? "private" : "public"}) — ${status}`);
  }

  const missing = repos.filter((repo) => !configured.has(repo.name));
  if (missing.length) {
    console.info(
      `\nAdd ${missing.length} repo(s) to scripts/projects.config.mjs with owner: "${owner}".`,
    );
  }
}

async function syncTargets(targets: SyncTarget[]): Promise<SyncResult> {
  if (!targets.length) {
    return { synced: 0, skipped: 0, total: 0, errors: [] };
  }

  migrateLegacyReadmeFiles();
  fs.mkdirSync(readmeDir, { recursive: true });

  const errors: string[] = [];
  const results = await Promise.all(
    targets.map(async (target) => {
      try {
        const readme = await fetchReadme(target.owner, target.repo);
        const outputPath = path.join(readmeDir, `${target.slug}.md`);

        if (!readme) {
          console.warn(`  skip ${target.owner}/${target.repo}: no README`);
          return { synced: false };
        }

        fs.writeFileSync(outputPath, readme, "utf-8");
        console.info(`  synced ${target.slug} ← ${target.owner}/${target.repo}`);
        return { synced: true };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        errors.push(`${target.slug}: ${message}`);
        return { synced: false };
      }
    }),
  );

  const synced = results.filter((result) => result.synced).length;
  const skipped = results.length - synced;

  console.info(`\nDone: ${synced} READMEs written to content/projects/, ${skipped} skipped.`);

  return { synced, skipped, total: results.length, errors };
}

export async function syncGithubProjectsFromConfig(options: { slugs?: string[] } = {}): Promise<SyncResult> {
  const { slugs } = options;
  const projects = slugs?.length
    ? portfolioProjects.filter((project) => slugs.includes(project.slug))
    : portfolioProjects;

  const targets: SyncTarget[] = projects.map((project) => ({
    slug: project.slug,
    owner: project.owner ?? GITHUB_OWNER_PERSONAL,
    repo: project.repo,
  }));

  return syncTargets(targets);
}

export function buildSyncTargetsFromProjects(
  projects: Array<{
    slug: string;
    links: string | null;
  }>,
  slugs?: string[],
): SyncTarget[] {
  const filtered = slugs?.length
    ? projects.filter((project) => slugs.includes(project.slug))
    : projects;

  const targets: SyncTarget[] = [];

  for (const project of filtered) {
    let links: Array<{ kind: string; url: string }> = [];
    if (project.links) {
      try {
        const parsed: unknown = JSON.parse(project.links);
        links = Array.isArray(parsed) ? (parsed as Array<{ kind: string; url: string }>) : [];
      } catch {
        links = [];
      }
    }

    const githubLink = links.find((link) => link.kind === "github");
    if (!githubLink) {
      console.warn(`  skip ${project.slug}: no GitHub link in database`);
      continue;
    }

    const parsed = parseGithubRepoUrl(githubLink.url);
    if (!parsed) {
      console.warn(`  skip ${project.slug}: invalid GitHub URL`);
      continue;
    }

    targets.push({
      slug: project.slug,
      owner: parsed.owner,
      repo: parsed.repo,
    });
  }

  return targets;
}

export async function syncGithubProjectsFromDatabase(
  projects: Array<{ slug: string; links: string | null }>,
  options: { slugs?: string[] } = {},
): Promise<SyncResult> {
  const targets = buildSyncTargetsFromProjects(projects, options.slugs);
  return syncTargets(targets);
}

export type GithubRepoListing = GithubRepoSummary & {
  inDatabase: boolean;
  projectId: number | null;
  projectSlug: string | null;
};

export function matchReposToDatabase(
  repos: GithubRepoSummary[],
  dbProjects: Array<{ id: number; slug: string; links: string | null }>,
): GithubRepoListing[] {
  const byUrl = new Map<string, { id: number; slug: string }>();

  for (const project of dbProjects) {
    if (!project.links) continue;
    try {
      const links = JSON.parse(project.links) as Array<{ kind: string; url: string }>;
      const githubLink = links.find((link) => link.kind === "github");
      if (!githubLink) continue;
      const normalized = normalizeGithubRepoUrl(githubLink.url);
      if (normalized) {
        byUrl.set(normalized, { id: project.id, slug: project.slug });
      }
    } catch {
      continue;
    }
  }

  return repos.map((repo) => {
    const normalized = normalizeGithubRepoUrl(repo.url);
    const match = normalized ? byUrl.get(normalized) : undefined;
    return {
      ...repo,
      inDatabase: Boolean(match),
      projectId: match?.id ?? null,
      projectSlug: match?.slug ?? null,
    };
  });
}

export async function listGithubReposForAdmin(
  dbProjects: Array<{ id: number; slug: string; links: string | null }>,
): Promise<GithubRepoListing[]> {
  const repos = await fetchAllAccessibleRepos();
  return matchReposToDatabase(repos, dbProjects);
}

export { GITHUB_OWNER_YourCompany, normalizeGithubRepoUrl, parseGithubRepoUrl };

/** @deprecated Use syncGithubProjectsFromConfig */
export async function syncGithubProjects(options: { slugs?: string[] } = {}): Promise<SyncResult> {
  return syncGithubProjectsFromConfig(options);
}
