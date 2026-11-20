export type ProjectLinkConfig = {
  kind: "github" | "demo" | "case_study" | "other";
  url: string;
  label?: string;
};

export type PortfolioProject = {
  slug: string;
  owner?: string;
  repo: string;
  title: string;
  description: string;
  featured: boolean;
  privateRepo?: boolean;
  openTag?: boolean;
  links?: ProjectLinkConfig[];
  gradient: string;
  tech: string[];
};

export const GITHUB_OWNER_PERSONAL: string;
export const GITHUB_OWNER_YourCompany: string;

export function projectGithubUrl(project: Pick<PortfolioProject, "owner" | "repo">): string;

export const portfolioProjects: PortfolioProject[];

export function buildProjectsSeedSql(esc: (value: string) => string): string;
