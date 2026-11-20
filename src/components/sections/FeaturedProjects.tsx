import { ArrowRight } from "lucide-react";
import { useMemo, useState } from "react";
import { siteContent } from "@/content/site";
import type { Project } from "@/content/types";
import { useScrollReveal } from "@/hooks/use-anime";
import { getFeaturedProjects } from "@/lib/projects";
import { trackPraxisProjectClickIfNeeded, trackProjectReadmeOpen } from "@/lib/analytics";
import { ProjectCard } from "@/components/ProjectCard";
import { ProjectReadmeModal } from "@/components/ProjectReadmeModal";
import { contentPanelClass } from "@/lib/panel";
import { cn } from "@/lib/utils";

type FeaturedProjectsProps = {
  className?: string;
  limit?: number;
  compact?: boolean;
};

export function FeaturedProjects({ className, limit = 4, compact = false }: FeaturedProjectsProps) {
  const panelRef = useScrollReveal<HTMLDivElement>();
  const [modalProject, setModalProject] = useState<Project | null>(null);

  const projects = useMemo(
    () => getFeaturedProjects(siteContent.projects, limit),
    [limit],
  );

  const handleOpenReadme = (project: Project, event: React.MouseEvent<HTMLButtonElement>) => {
    trackProjectReadmeOpen(project.slug, event);
    trackPraxisProjectClickIfNeeded(project.slug, "readme", project.slug, event);
    setModalProject(project);
  };

  if (!projects.length) return null;

  return (
    <>
      <aside
        ref={panelRef}
        aria-labelledby="featured-projects-heading"
        className={cn(contentPanelClass, "flex min-w-0 flex-col", className)}
      >
        <header className={cn(compact ? "mb-3" : "mb-5")}>
          <h2
            id="featured-projects-heading"
            className={cn(
              "font-medium tracking-tight",
              compact ? "text-sm sm:text-base lg:text-lg" : "text-xl lg:text-2xl",
            )}
          >
            Featured work
          </h2>
          {!compact ? (
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Two places to start. The rest of the projects sit further down the page.
            </p>
          ) : null}
        </header>

        <div
          className={cn(
            compact
              ? "flex flex-row gap-2.5 overflow-x-auto pb-1 [scrollbar-width:thin] snap-x snap-mandatory lg:flex-col lg:overflow-visible lg:snap-none"
              : "flex flex-col gap-3",
          )}
        >
          {projects.map((project) => (
            <ProjectCard
              key={project.slug}
              project={project}
              compact
              showImage
              thumbnail={compact}
              onOpenReadme={handleOpenReadme}
              className={cn(
                "border-border bg-background",
                compact && "w-[min(85vw,18rem)] shrink-0 snap-start lg:w-full lg:shrink",
              )}
            />
          ))}
        </div>

        <a
          href="#projects"
          className={cn(
            "inline-flex items-center gap-1.5 self-start text-xs font-medium text-primary transition-colors hover:text-primary/80 sm:text-sm",
            compact ? "mt-3 sm:mt-4" : "mt-5",
          )}
        >
          View all projects
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </a>
      </aside>

      <ProjectReadmeModal project={modalProject} onClose={() => setModalProject(null)} />
    </>
  );
}
