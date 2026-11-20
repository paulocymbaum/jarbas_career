import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "../..");
dotenv.config({ path: path.join(root, ".env") });

const token = process.env.GITHUB_TOKEN?.trim();

export type GithubRepoSummary = {
  owner: string;
  name: string;
  fullName: string;
  description: string | null;
  private: boolean;
  url: string;
};

function githubHeaders(): Record<string, string> {
  return {
    Accept: "application/vnd.github+json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "portfolio-cv-sync",
  };
}

export function parseGithubRepoUrl(url: string): { owner: string; repo: string } | null {
  const match = url.match(/github\.com\/([^/]+)\/([^/?#]+)/i);
  if (!match) return null;
  return { owner: match[1], repo: match[2].replace(/\.git$/, "") };
}

export function normalizeGithubRepoUrl(url: string): string | null {
  const parsed = parseGithubRepoUrl(url);
  if (!parsed) return null;
  return `https://github.com/${parsed.owner}/${parsed.repo}`.toLowerCase();
}

export async function fetchReadme(owner: string, repo: string): Promise<string | null> {
  let response: Response;
  try {
    response = await fetch(`https://api.github.com/repos/${owner}/${repo}/readme`, {
      headers: {
        ...githubHeaders(),
        Accept: "application/vnd.github.raw",
      },
    });
  } catch (error) {
    console.warn(
      `fetchReadme(${owner}/${repo}): network error — ${error instanceof Error ? error.message : String(error)}`,
    );
    return null;
  }

  if (!response.ok) {
    console.warn(
      `fetchReadme(${owner}/${repo}): HTTP ${response.status} ${response.statusText || "request failed"}`,
    );
    return null;
  }

  return response.text();
}

export async function fetchAllAccessibleRepos(): Promise<GithubRepoSummary[]> {
  const repos: GithubRepoSummary[] = [];
  let page = 1;

  while (page <= 10) {
    const response = await fetch(
      `https://api.github.com/user/repos?affiliation=owner,collaborator,organization_member&per_page=100&page=${page}&sort=updated`,
      { headers: githubHeaders() },
    );

    if (!response.ok) {
      const message = await response.text();
      throw new Error(`GitHub API failed (${response.status}): ${message}`);
    }

    const batch = (await response.json()) as Array<{
      owner: { login: string };
      name: string;
      full_name: string;
      description: string | null;
      private: boolean;
      html_url: string;
    }>;

    if (!batch.length) break;

    repos.push(
      ...batch.map((repo) => ({
        owner: repo.owner.login,
        name: repo.name,
        fullName: repo.full_name,
        description: repo.description,
        private: repo.private,
        url: repo.html_url,
      })),
    );

    if (batch.length < 100) break;
    page += 1;
  }

  return repos.sort((a, b) => a.fullName.localeCompare(b.fullName));
}

export function hasGithubToken(): boolean {
  return Boolean(token);
}
