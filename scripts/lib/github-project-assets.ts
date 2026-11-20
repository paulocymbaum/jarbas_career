import fs from "node:fs";
import path from "node:path";
import {
  fetchReadme,
  parseGithubRepoUrl,
} from "./github-api.js";
import { getProjectRoot, openDatabaseReadWrite } from "./db.js";
import {
  GITHUB_OWNER_PERSONAL,
  portfolioProjects,
  projectGithubUrl,
} from "../projects.config.mjs";

const IMAGE_EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".webp", ".gif"]);
const PRIORITY_DIRS = ["docs", "assets", "public", "screenshots", ".github", "images", "media"];
const PRIORITY_NAMES = [
  "screenshot",
  "preview",
  "banner",
  "cover",
  "hero",
  "thumbnail",
  "demo",
  "og-image",
  "social",
  "landing",
];

const SKIP_NAMES = ["favicon", "badge", "icon-16", "icon-32", "logo-small", "dependabot"];

export type ProjectAssetManifestEntry = {
  slug: string;
  owner: string;
  repo: string;
  coverFile: string | null;
  publicUrl: string | null;
  files: string[];
  errors: string[];
};

export type ProjectAssetManifest = {
  generatedAt: string;
  projects: Record<string, ProjectAssetManifestEntry>;
};

type TreeEntry = {
  path: string;
  type: string;
  size?: number;
};

type AssetCandidate = {
  path: string;
  score: number;
  size: number;
};

function githubHeaders(): Record<string, string> {
  const token = process.env.GITHUB_TOKEN?.trim();
  return {
    Accept: "application/vnd.github+json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "portfolio-cv-asset-sync",
  };
}

function isImagePath(filePath: string): boolean {
  const ext = path.extname(filePath).toLowerCase();
  return IMAGE_EXTENSIONS.has(ext);
}

function extractReadmeImageRefs(markdown: string): Set<string> {
  const refs = new Set<string>();

  const markdownPattern = /!\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;
  const htmlPattern = /<img[^>]+src=["']([^"']+)["']/gi;

  for (const pattern of [markdownPattern, htmlPattern]) {
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(markdown)) !== null) {
      const raw = match[1]?.trim();
      if (!raw || raw.startsWith("data:")) continue;
      refs.add(decodeURIComponent(raw.replace(/^\.\//, "")));
    }
  }

  return refs;
}

function normalizeRepoPath(value: string): string {
  return decodeURIComponent(value.replace(/^\.\//, "").split("?")[0] ?? "");
}

function scoreImagePath(filePath: string, readmeRefs: Set<string>, size: number): number {
  const lower = filePath.toLowerCase();
  const basename = path.basename(lower);
  let score = 0;

  for (const ref of readmeRefs) {
    const normalized = normalizeRepoPath(ref);
    if (
      normalized === filePath ||
      normalized.endsWith(`/${filePath}`) ||
      filePath.endsWith(`/${normalized}`) ||
      basename === path.basename(normalized)
    ) {
      score += 120;
      break;
    }
  }

  for (const name of PRIORITY_NAMES) {
    if (basename.includes(name)) score += 28;
  }

  for (const dir of PRIORITY_DIRS) {
    if (lower.startsWith(`${dir}/`) || lower.includes(`/${dir}/`)) {
      score += 14;
    }
  }

  for (const skip of SKIP_NAMES) {
    if (basename.includes(skip)) score -= 80;
  }

  if (size > 8_000) score += 8;
  if (size > 40_000) score += 12;
  if (size < 1_500) score -= 25;

  return score;
}

async function fetchDefaultBranch(owner: string, repo: string): Promise<string> {
  const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
    headers: githubHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Failed to load repo metadata (${response.status})`);
  }

  const data = (await response.json()) as { default_branch?: string };
  return data.default_branch ?? "main";
}

async function listRepoImagePaths(owner: string, repo: string): Promise<TreeEntry[]> {
  const branch = await fetchDefaultBranch(owner, repo);
  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`,
    { headers: githubHeaders() },
  );

  if (!response.ok) {
    throw new Error(`Failed to list repo tree (${response.status})`);
  }

  const data = (await response.json()) as { tree?: TreeEntry[] };
  return (data.tree ?? []).filter(
    (entry) => entry.type === "blob" && isImagePath(entry.path),
  );
}

async function downloadRepoFile(
  owner: string,
  repo: string,
  filePath: string,
  targetPath: string,
): Promise<void> {
  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/contents/${encodeURIComponent(filePath).replace(/%2F/g, "/")}`,
    {
      headers: {
        ...githubHeaders(),
        Accept: "application/vnd.github.raw",
      },
    },
  );

  if (!response.ok) {
    throw new Error(`Download failed (${response.status})`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  fs.mkdirSync(path.dirname(targetPath), { recursive: true });
  fs.writeFileSync(targetPath, buffer);
}

function sanitizeFilename(filePath: string): string {
  return path.basename(filePath).replace(/[^\w.-]+/g, "-");
}

function selectCandidates(
  tree: TreeEntry[],
  readmeRefs: Set<string>,
  maxFiles: number,
): AssetCandidate[] {
  const candidates = tree
    .map((entry) => ({
      path: entry.path,
      size: entry.size ?? 0,
      score: scoreImagePath(entry.path, readmeRefs, entry.size ?? 0),
    }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || b.size - a.size);

  const selected: AssetCandidate[] = [];
  const seenBasenames = new Set<string>();

  for (const candidate of candidates) {
    const basename = path.basename(candidate.path).toLowerCase();
    if (seenBasenames.has(basename)) continue;
    seenBasenames.add(basename);
    selected.push(candidate);
    if (selected.length >= maxFiles) break;
  }

  return selected;
}

function getAssetsRoot(): string {
  return path.join(getProjectRoot(), "assets", "projects");
}

function getPublicAssetsRoot(): string {
  return path.join(getProjectRoot(), "public", "assets", "projects");
}

export function readAssetManifest(): ProjectAssetManifest | null {
  const manifestPath = path.join(getAssetsRoot(), "manifest.json");
  if (!fs.existsSync(manifestPath)) return null;

  try {
    return JSON.parse(fs.readFileSync(manifestPath, "utf-8")) as ProjectAssetManifest;
  } catch {
    return null;
  }
}

export function writeAssetManifest(manifest: ProjectAssetManifest): void {
  const assetsRoot = getAssetsRoot();
  fs.mkdirSync(assetsRoot, { recursive: true });
  fs.writeFileSync(path.join(assetsRoot, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
}

export type ProjectImageOption = {
  filename: string;
  publicUrl: string;
  isCover: boolean;
};

function publicUrlForProjectImage(slug: string, filename: string): string {
  return `/assets/projects/${slug}/${filename}`;
}

export function publishProjectImageToPublic(slug: string, filename: string): boolean {
  const source = path.join(getAssetsRoot(), slug, filename);
  if (!fs.existsSync(source) || !isImagePath(filename)) return false;

  const destination = path.join(getPublicAssetsRoot(), slug, filename);
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.copyFileSync(source, destination);
  return true;
}

export function listProjectImageOptions(slug: string): ProjectImageOption[] {
  const assetsDir = path.join(getAssetsRoot(), slug);
  const publicDir = path.join(getPublicAssetsRoot(), slug);
  const manifest = readAssetManifest();
  const coverFile = manifest?.projects[slug]?.coverFile ?? null;

  const filenames = new Set<string>();

  if (fs.existsSync(assetsDir)) {
    for (const filename of fs.readdirSync(assetsDir)) {
      if (isImagePath(filename)) filenames.add(filename);
    }
  }

  if (fs.existsSync(publicDir)) {
    for (const filename of fs.readdirSync(publicDir)) {
      if (isImagePath(filename)) filenames.add(filename);
    }
  }

  if (!filenames.size) return [];

  const sorted = [...filenames].sort((a, b) => {
    const aCover = a === coverFile || a.startsWith("cover.");
    const bCover = b === coverFile || b.startsWith("cover.");
    if (aCover !== bCover) return aCover ? -1 : 1;
    return a.localeCompare(b);
  });

  return sorted.map((filename) => {
    const assetsSource = path.join(assetsDir, filename);
    if (fs.existsSync(assetsSource)) {
      publishProjectImageToPublic(slug, filename);
    }

    return {
      filename,
      publicUrl: publicUrlForProjectImage(slug, filename),
      isCover: filename === coverFile || filename.startsWith("cover."),
    };
  });
}

export function ensureProjectImageUrlPublished(imageUrl: string | null | undefined): void {
  if (!imageUrl?.trim()) return;

  const match = imageUrl.trim().match(/^\/assets\/projects\/([^/]+)\/([^/]+)$/);
  if (!match) return;

  const [, slug, filename] = match;
  publishProjectImageToPublic(slug, filename);
}

function updateDatabaseCoverUrl(slug: string, publicUrl: string | null): void {
  const dbPath = path.join(getProjectRoot(), "data", "portfolio.db");
  if (!fs.existsSync(dbPath)) {
    console.info(`  skip DB update for ${slug}: portfolio.db not found`);
    return;
  }

  const db = openDatabaseReadWrite();
  try {
    db.prepare("UPDATE project SET image_url = ? WHERE slug = ?").run(publicUrl, slug);
    console.info(`  updated image_url for ${slug} → ${publicUrl ?? "(cleared)"}`);
  } finally {
    db.close();
  }
}

export type SyncProjectAssetsOptions = {
  slugs?: string[];
  featuredOnly?: boolean;
  maxFilesPerProject?: number;
  updateDatabase?: boolean;
  additionalProjects?: Array<{ slug: string; owner?: string; repo: string }>;
};

export type SyncProjectAssetsResult = {
  synced: number;
  skipped: number;
  total: number;
  manifest: ProjectAssetManifest;
  errors: string[];
};

export async function syncProjectAssets(
  options: SyncProjectAssetsOptions = {},
): Promise<SyncProjectAssetsResult> {
  const {
    slugs,
    featuredOnly = true,
    maxFilesPerProject = 6,
    updateDatabase = true,
    additionalProjects = [],
  } = options;

  const projectsBySlug = new Map(
    portfolioProjects.map((project) => [project.slug, project]),
  );

  for (const extra of additionalProjects) {
    if (!projectsBySlug.has(extra.slug)) {
      projectsBySlug.set(extra.slug, {
        slug: extra.slug,
        repo: extra.repo,
        owner: extra.owner,
        title: extra.slug,
        description: "",
        featured: true,
        gradient: "from-primary/20 to-primary/5",
        tech: [],
      });
    }
  }

  const projects = [...projectsBySlug.values()].filter((project) => {
    if (featuredOnly && !project.featured) return false;
    if (slugs?.length && !slugs.includes(project.slug)) return false;
    return true;
  });

  const assetsRoot = getAssetsRoot();
  const publicRoot = getPublicAssetsRoot();
  fs.mkdirSync(assetsRoot, { recursive: true });
  fs.mkdirSync(publicRoot, { recursive: true });

  const manifest: ProjectAssetManifest = {
    generatedAt: new Date().toISOString(),
    projects: {},
  };

  const errors: string[] = [];
  let synced = 0;
  let skipped = 0;

  for (const project of projects) {
    const owner = project.owner ?? GITHUB_OWNER_PERSONAL;
    const repo = project.repo;
    const slug = project.slug;
    const projectDir = path.join(assetsRoot, slug);
    const publicProjectDir = path.join(publicRoot, slug);

    console.info(`\n→ ${slug} (${owner}/${repo})`);

    const entry: ProjectAssetManifestEntry = {
      slug,
      owner,
      repo,
      coverFile: null,
      publicUrl: null,
      files: [],
      errors: [],
    };

    try {
      const readme = await fetchReadme(owner, repo);
      const readmeRefs = readme ? extractReadmeImageRefs(readme) : new Set<string>();
      const tree = await listRepoImagePaths(owner, repo);

      if (!tree.length) {
        entry.errors.push("No image files found in repository");
        manifest.projects[slug] = entry;
        skipped += 1;
        console.warn("  no images found");
        continue;
      }

      const candidates = selectCandidates(tree, readmeRefs, maxFilesPerProject);
      if (!candidates.length) {
        entry.errors.push("No suitable image candidates after scoring");
        manifest.projects[slug] = entry;
        skipped += 1;
        console.warn("  no suitable images after scoring");
        continue;
      }

      fs.mkdirSync(projectDir, { recursive: true });
      fs.mkdirSync(publicProjectDir, { recursive: true });

      for (const candidate of candidates) {
        const filename = sanitizeFilename(candidate.path);
        const destination = path.join(projectDir, filename);
        try {
          await downloadRepoFile(owner, repo, candidate.path, destination);
          entry.files.push(filename);
          console.info(`  saved ${filename}`);
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          entry.errors.push(`${candidate.path}: ${message}`);
        }
      }

      if (!entry.files.length) {
        manifest.projects[slug] = entry;
        skipped += 1;
        errors.push(...entry.errors.map((message) => `${slug}: ${message}`));
        continue;
      }

      const coverSource = path.join(projectDir, entry.files[0]);
      const coverExt = path.extname(entry.files[0]) || ".png";
      const coverFilename = `cover${coverExt}`;
      const publicCoverPath = path.join(publicProjectDir, coverFilename);
      fs.copyFileSync(coverSource, publicCoverPath);

      entry.coverFile = coverFilename;
      entry.publicUrl = `/assets/projects/${slug}/${coverFilename}`;
      manifest.projects[slug] = entry;

      if (updateDatabase) {
        updateDatabaseCoverUrl(slug, entry.publicUrl);
      }

      synced += 1;
      console.info(`  cover → ${entry.publicUrl}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      entry.errors.push(message);
      manifest.projects[slug] = entry;
      errors.push(`${slug}: ${message}`);
      skipped += 1;
      console.warn(`  failed: ${message}`);
    }
  }

  writeAssetManifest(manifest);

  console.info(
    `\nDone: ${synced} project asset folders synced, ${skipped} skipped. Manifest: assets/projects/manifest.json`,
  );

  return {
    synced,
    skipped,
    total: projects.length,
    manifest,
    errors,
  };
}

export function resolveProjectRepo(project: {
  slug: string;
  links?: Array<{ kind: string; url: string }>;
}): { owner: string; repo: string } | null {
  const configured = portfolioProjects.find((item) => item.slug === project.slug);
  if (configured) {
    const parsed = parseGithubRepoUrl(projectGithubUrl(configured));
    if (parsed) return parsed;
  }

  const githubLink = project.links?.find((link) => link.kind === "github");
  if (!githubLink) return null;
  return parseGithubRepoUrl(githubLink.url);
}
