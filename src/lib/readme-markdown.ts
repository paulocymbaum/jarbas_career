type GithubRepoInfo = {
  owner: string;
  repo: string;
  branch: string;
};

const GITHUB_REPO_PATTERN = /github\.com\/([^/]+)\/([^/]+)/i;

export function parseGithubRepoInfo(githubUrl: string, branch = "main"): GithubRepoInfo | null {
  const match = githubUrl.match(GITHUB_REPO_PATTERN);
  if (!match) return null;

  return {
    owner: match[1],
    repo: match[2].replace(/\.git$/, ""),
    branch,
  };
}

export function resolveReadmeAssetUrl(src: string, repo: GithubRepoInfo): string {
  const trimmed = src.trim();
  if (!trimmed) return trimmed;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (trimmed.startsWith("//")) return `https:${trimmed}`;

  const path = trimmed.replace(/^\.\//, "");
  return `https://raw.githubusercontent.com/${repo.owner}/${repo.repo}/${repo.branch}/${path}`;
}

function replaceHtmlImages(markdown: string, repo: GithubRepoInfo): string {
  return markdown.replace(/<img\b[^>]*\/?>/gi, (tag) => {
    const srcMatch = tag.match(/\bsrc=["']([^"']+)["']/i);
    if (!srcMatch) return "";

    const altMatch = tag.match(/\balt=["']([^"']*)["']/i);
    const alt = altMatch?.[1] ?? "Project screenshot";
    const url = resolveReadmeAssetUrl(srcMatch[1], repo);

    return `\n\n![${alt}](${url})\n\n`;
  });
}

function replaceMarkdownImages(markdown: string, repo: GithubRepoInfo): string {
  return markdown.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (match, alt: string, src: string) => {
    if (/^https?:\/\//i.test(src.trim())) return match;
    return `![${alt}](${resolveReadmeAssetUrl(src, repo)})`;
  });
}

function replaceMermaidBlocks(markdown: string): string {
  return markdown.replace(
    /```mermaid[\s\S]*?```/gi,
    "\n\n> **Diagram** — open the project on GitHub to view this Mermaid chart.\n\n",
  );
}

function removeDuplicateTitle(markdown: string, title?: string): string {
  if (!title) return markdown;

  const lines = markdown.split("\n");
  const firstHeadingIndex = lines.findIndex((line) => /^#\s+/.test(line.trim()));
  if (firstHeadingIndex === -1) return markdown;

  const headingText = lines[firstHeadingIndex].replace(/^#\s+/, "").trim();
  if (headingText.toLowerCase() !== title.toLowerCase()) return markdown;

  lines.splice(firstHeadingIndex, 1);
  while (lines[firstHeadingIndex]?.trim() === "") {
    lines.splice(firstHeadingIndex, 1);
  }

  return lines.join("\n");
}

export function preprocessReadme(
  markdown: string,
  options: { githubUrl?: string; title?: string; branch?: string },
): string {
  const repo = options.githubUrl ? parseGithubRepoInfo(options.githubUrl, options.branch) : null;

  let content = markdown;
  content = replaceMermaidBlocks(content);
  content = removeDuplicateTitle(content, options.title);

  if (repo) {
    content = replaceHtmlImages(content, repo);
    content = replaceMarkdownImages(content, repo);
  }

  return content.trim();
}
