export const ADMIN_TABS = [
  "profile",
  "profiles",
  "experience",
  "writing",
  "education",
  "certifications",
  "projects",
  "skills",
] as const;

export type AdminTab = (typeof ADMIN_TABS)[number];

const DEFAULT_TAB: AdminTab = "profile";

export function isAdminTab(value: string): value is AdminTab {
  return (ADMIN_TABS as readonly string[]).includes(value);
}

export function parseAdminHash(hash: string): { isAdmin: boolean; tab: AdminTab } {
  const match = hash.match(/^#admin(?:\/([a-z]+))?$/);
  if (!match) {
    return { isAdmin: false, tab: DEFAULT_TAB };
  }

  const tabCandidate = match[1];
  return {
    isAdmin: true,
    tab: tabCandidate && isAdminTab(tabCandidate) ? tabCandidate : DEFAULT_TAB,
  };
}

export function adminHashForTab(tab: AdminTab): string {
  return tab === DEFAULT_TAB ? "#admin" : `#admin/${tab}`;
}

export function parseGithubRepoUrl(url: string): { owner: string; repo: string } | null {
  const match = url.match(/github\.com\/([^/]+)\/([^/?#]+)/i);
  if (!match) return null;
  return { owner: match[1], repo: match[2].replace(/\.git$/, "") };
}

export function repoNameToSlug(name: string): string {
  return name
    .replace(/\.git$/i, "")
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .replace(/_/g, "-")
    .toLowerCase();
}
