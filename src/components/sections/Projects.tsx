import { useMemo, useState } from "react";
import { siteContent } from "@/content/site";
import type { Project } from "@/content/types";
import { isDisplayableProject, sortProjects } from "@/lib/projects";
import { classifyProjectDomains, type SkillDomainId } from "@/lib/skill-domains";
import { trackPraxisProjectClickIfNeeded, trackProjectReadmeOpen } from "@/lib/analytics";
import { ProjectCard } from "@/components/ProjectCard";
import { ProjectReadmeModal } from "@/components/ProjectReadmeModal";
import { RoleSwitcher, type RoleSwitcherItem } from "@/components/bento";
import { Section } from "@/components/layout/Section";

/** Focus-area lens — mirrors the stitch reference's data-roles tile filter. */
const FOCUS_ITEMS: RoleSwitcherItem[] = [
  { id: "all", label: "All Systems" },
  { id: "ai", label: "AI & Agents" },
  { id: "fullstack", label: "Fullstack & Engines" },
  { id: "product", label: "Product & EdTech" },
];

function matchesFocus(domains: SkillDomainId[], focus: string): boolean {
  if (focus === "ai") return domains.includes("ai");
  if (focus === "fullstack") {
    return domains.includes("software-development") || domains.includes("infrastructure");
  }
  if (focus === "product") return domains.includes("business");
  return true;
}

export function Projects() {
  const [modalProject, setModalProject] = useState<Project | null>(null);
  const [focus, setFocus] = useState("all");

  const handleOpenReadme = (project: Project, event: React.MouseEvent<HTMLButtonElement>) => {
    trackProjectReadmeOpen(project.slug, event);
    trackPraxisProjectClickIfNeeded(project.slug, "readme", project.slug, event);
    setModalProject(project);
  };

  const projects = useMemo(
    () => sortProjects(siteContent.projects.filter(isDisplayableProject)),
    [],
  );

  const projectsWithDomains = useMemo(
    () =>
      projects.map((project) => ({
        project,
        domains: classifyProjectDomains(project).map((domain) => domain.id),
      })),
    [projects],
  );

  const visible = useMemo(
    () =>
      projectsWithDomains.filter(({ domains }) => matchesFocus(domains, focus)),
    [projectsWithDomains, focus],
  );

  return (
    <Section id="projects" eyebrow="FLAGSHIP SYSTEMS · OPEN SOURCE & PRODUCTION" title="Projects" alt>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
        <RoleSwitcher
          items={FOCUS_ITEMS}
          value={focus}
          onChange={setFocus}
          prefix="Focus areas"
          ariaLabel="Filter projects by focus area"
          analyticsPrefix="projects-focus"
        />
        <p className="font-mono text-[11px] font-medium text-muted-foreground">
          {String(visible.length).padStart(2, "0")} /{" "}
          {String(projectsWithDomains.length).padStart(2, "0")} MODULES
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map(({ project }) => (
          <ProjectCard
            key={project.slug}
            project={project}
            onOpenReadme={handleOpenReadme}
            className="w-full min-w-0"
          />
        ))}
      </div>

      <ProjectReadmeModal project={modalProject} onClose={() => setModalProject(null)} />
    </Section>
  );
}
