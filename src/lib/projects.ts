import { projectReadmes } from "@/content/project-readmes";
import type { Project } from "@/content/types";

const PLACEHOLDER_README_MARKERS = new Set([
  "# ai_agent_system_placeholder",
  "# placeholder",
]);

export const OPEN_TAG_SLUGS = new Set(["praxis", "ed-tech-system-mcp"]);

export function isDisplayableProject(project: Project): boolean {
  const readme = projectReadmes[project.slug]?.trim();
  if (readme && PLACEHOLDER_README_MARKERS.has(readme)) return false;
  return Boolean(project.title && project.description);
}

export function sortProjects(projects: Project[]): Project[] {
  return [...projects].sort((a, b) => Number(b.featured) - Number(a.featured));
}

export function getFeaturedProjects(projects: Project[], limit = 6): Project[] {
  return sortProjects(projects.filter((project) => project.featured && isDisplayableProject(project))).slice(
    0,
    limit,
  );
}
