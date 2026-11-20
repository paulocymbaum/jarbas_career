import { githubActivity } from "@/content/github-activity";
import { siteContent } from "@/content/site";
import { isDisplayableProject } from "@/lib/projects";

export type ProofMetrics = {
  systemCount: number;
  featuredCount: number;
  contributions: number;
};

/**
 * Proof metrics derived strictly from real site data.
 * Note: deliberately excludes tenure/year claims — teaching and early
 * engineering roles are not "shipped systems", so no aggregate is honest.
 */
export function buildProofMetrics(): ProofMetrics | null {
  const projects = siteContent.projects.filter(isDisplayableProject);
  const featuredCount = projects.filter((project) => project.featured).length;
  const hasActivity = githubActivity.weeks.length > 0;

  if (!projects.length || !hasActivity) return null;

  return {
    systemCount: projects.length,
    featuredCount,
    contributions: githubActivity.totalContributions,
  };
}
