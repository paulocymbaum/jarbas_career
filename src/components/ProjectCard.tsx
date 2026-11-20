import { ExternalLink, FileText } from "lucide-react";
import { useMemo } from "react";
import { projectReadmes } from "@/content/project-readmes";
import { siteContent } from "@/content/site";
import type { Project } from "@/content/types";
import { classifyProjectDomains, type SkillDomain } from "@/lib/skill-domains";
import { OPEN_TAG_SLUGS } from "@/lib/projects";
import { trackOutbound, trackPraxisProjectClickIfNeeded } from "@/lib/analytics";
import { ProjectGithubLink } from "@/components/ProjectGithubLink";
import { BentoCard, StatusPill } from "@/components/bento";
import { TechChip } from "@/components/bento/TechChip";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const linkLabels: Record<string, string> = {
  github: "GitHub",
  demo: "Demo",
  case_study: "Case study",
  other: "Link",
};

/** Monospace breadcrumb header — github repo path or local module path. */
function projectBreadcrumb(project: Project): string {
  const github = project.links.find((link) => link.kind === "github");
  if (github) {
    return github.url.replace(/^https?:\/\//, "").replace(/\/$/, "");
  }
  return `local://projects/${project.slug}`;
}

/**
 * Theme-adaptive typographic cover for projects without a cover image:
 * repo breadcrumb, display title, and an oversized catalog index over the
 * project's brand gradient. Reads correctly in both themes — the card's
 * bottom scrim (from-background/80) plates the title, and gradient tops
 * stay dark enough for the white breadcrumb.
 */
export function TypographicCover({
  project,
  mini = false,
  className,
}: {
  project: Project;
  mini?: boolean;
  className?: string;
}) {
  const position = siteContent.projects.findIndex((item) => item.slug === project.slug);
  const index = position >= 0 ? String(position + 1).padStart(2, "0") : "··";

  return (
    <div
      className={cn(
        "relative flex h-full w-full flex-col justify-between bg-gradient-to-br",
        project.gradient,
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute -bottom-3 -right-1 select-none font-mono font-bold leading-none tracking-tighter text-white/10",
          mini ? "text-3xl" : "text-[4.75rem] sm:text-[5.5rem]",
        )}
      >
        {index}
      </span>
      {mini ? null : (
        <>
          <span className="relative truncate font-mono text-[10px] uppercase tracking-[0.08em] text-white/75">
            {projectBreadcrumb(project)}
          </span>
          <span className="relative pb-1 pr-8 text-lg font-bold leading-tight tracking-[-0.01em] text-foreground sm:pr-10 sm:text-xl">
            {project.title}
          </span>
        </>
      )}
    </div>
  );
}

function ProjectStatusPills({ project, className }: { project: Project; className?: string }) {
  return (
    <>
      {project.featured ? (
        <StatusPill variant="flagship" className={className}>
          Featured
        </StatusPill>
      ) : null}
      {OPEN_TAG_SLUGS.has(project.slug) ? (
        <StatusPill variant="open" className={className}>
          Open source
        </StatusPill>
      ) : null}
    </>
  );
}

function DomainChips({ domains }: { domains: SkillDomain[] }) {
  return (
    <div className="flex flex-wrap gap-1">
      {domains.map((domain) => (
        <span
          key={domain.id}
          className="inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-medium"
          style={{
            borderColor: domain.color,
            color: domain.color,
            backgroundColor: domain.fill,
          }}
        >
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: domain.color }}
            aria-hidden="true"
          />
          {domain.shortLabel}
        </span>
      ))}
    </div>
  );
}

function TechChips({
  project,
  limit,
  dense,
}: {
  project: Project;
  limit: number;
  dense?: boolean;
}) {
  const overflow = project.tech.length - limit;
  return (
    <div className="flex flex-wrap gap-1.5">
      {project.tech.slice(0, limit).map((tech) => (
        <TechChip key={tech} className={dense ? "text-[10px]" : undefined}>
          {tech}
        </TechChip>
      ))}
      {overflow > 0 ? (
        <TechChip className={dense ? "text-[10px]" : undefined}>+{overflow}</TechChip>
      ) : null}
    </div>
  );
}

type ProjectCardProps = {
  project: Project;
  onOpenReadme?: (project: Project, event: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
  compact?: boolean;
  showImage?: boolean;
  thumbnail?: boolean;
};

function ProjectCardImage({
  project,
  thumbnail = false,
  className,
}: {
  project: Project;
  thumbnail?: boolean;
  className?: string;
}) {
  const image = project.imageUrl ? (
    <img
      src={project.imageUrl}
      alt=""
      loading="lazy"
      decoding="async"
      className="h-full w-full object-cover"
    />
  ) : (
    <TypographicCover project={project} mini={thumbnail} />
  );

  if (thumbnail) {
    return (
      <div
        className={cn(
          "relative shrink-0 overflow-hidden rounded-md border border-border/60",
          "h-12 w-16 sm:h-14 sm:w-[4.5rem]",
          className,
        )}
      >
        {image}
      </div>
    );
  }

  return (
    <div className={cn("relative aspect-[16/10] w-full overflow-hidden border-b border-border/60", className)}>
      {image}
      <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/10 to-transparent" />
      <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
        <ProjectStatusPills project={project} className="backdrop-blur" />
      </div>
    </div>
  );
}

function ProjectActions({
  project,
  hasReadme,
  onOpenReadme,
  size,
}: {
  project: Project;
  hasReadme: boolean;
  onOpenReadme?: (project: Project, event: React.MouseEvent<HTMLButtonElement>) => void;
  size: "standard" | "compact" | "dense";
}) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {hasReadme && onOpenReadme ? (
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className={cn(
            "gap-1.5 px-2 text-xs",
            size === "dense" ? "h-6 px-2 text-[10px]" : size === "compact" ? "h-7" : "h-8",
          )}
          data-analytics-id={`project-readme-${project.slug}`}
          onClick={(event) => onOpenReadme(project, event)}
        >
          <FileText className="h-3.5 w-3.5" />
          README
        </Button>
      ) : null}
      {project.links.map((link) => {
        if (link.kind === "github") {
          return (
            <ProjectGithubLink
              key={`${project.slug}-${link.url}`}
              privateRepo={project.privateRepo}
              url={link.url}
              projectSlug={project.slug}
              analyticsSource={`project_${project.slug}_github`}
            />
          );
        }

        if (link.kind === "demo") {
          return (
            <Button
              key={`${project.slug}-${link.url}`}
              asChild
              size="sm"
              className={cn(
                "gap-1.5 px-2 text-xs",
                size === "dense" ? "h-6 px-2 text-[10px]" : size === "compact" ? "h-7" : "h-8",
              )}
            >
              <a
                href={link.url}
                rel="noopener noreferrer"
                target="_blank"
                aria-label={`${link.label ?? "Demo"}, opens in new tab`}
                onClick={(event) => {
                  trackOutbound("demo", link.url, event);
                  trackPraxisProjectClickIfNeeded(project.slug, "demo", link.url, event);
                }}
              >
                <ExternalLink className="h-3.5 w-3.5" />
                {link.label ?? "Demo"}
              </a>
            </Button>
          );
        }

        return (
          <a
            key={`${project.slug}-${link.kind}-${link.url}`}
            href={link.url}
            className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-primary"
            rel="noopener noreferrer"
            target="_blank"
            aria-label={`${link.label ?? linkLabels[link.kind]}, opens in new tab`}
            onClick={(event) => {
              trackOutbound(link.kind, link.url, event);
              trackPraxisProjectClickIfNeeded(project.slug, link.kind, link.url, event);
            }}
          >
            <ExternalLink className="h-3.5 w-3.5" />
            {link.label ?? linkLabels[link.kind]}
          </a>
        );
      })}
    </div>
  );
}

export function ProjectCard({
  project,
  onOpenReadme,
  className,
  compact = false,
  showImage = false,
  thumbnail = false,
}: ProjectCardProps) {
  const hasReadme = Boolean(projectReadmes[project.slug]);
  const domains = useMemo(() => classifyProjectDomains(project), [project]);
  const useThumbnail = showImage && thumbnail;
  const techLimit = compact ? 2 : 4;

  // Thumbnail mini-card (horizontal) — used by compact side panels.
  if (useThumbnail) {
    return (
      <Card
        className={cn(
          "group flex w-full flex-row items-stretch overflow-hidden p-0 transition-all hover:border-primary/50 hover:shadow-[0_0_24px_-8px] hover:shadow-primary/30",
          className,
        )}
      >
        <div className="flex min-w-0 flex-1 flex-col gap-2 p-2.5">
          <div className="flex min-w-0 gap-2 sm:gap-2.5">
            <ProjectCardImage project={project} thumbnail />
            <div className="min-w-0 flex-1 space-y-1">
              <CardTitle className="text-xs font-semibold leading-snug transition-colors group-hover:text-primary sm:text-sm">
                {project.title}
              </CardTitle>
              <CardDescription className="line-clamp-2 text-[10px] leading-relaxed sm:text-[11px]">
                {project.description}
              </CardDescription>
            </div>
          </div>
          <CardContent className="mt-auto space-y-2 p-0">
            <TechChips project={project} limit={techLimit} dense />
            <ProjectActions
              project={project}
              hasReadme={hasReadme}
              onOpenReadme={onOpenReadme}
              size="dense"
            />
          </CardContent>
        </div>
      </Card>
    );
  }

  // Image / compact card (vertical) — used by featured panels.
  if (showImage || compact) {
    return (
      <Card
        className={cn(
          "group flex h-full w-full flex-col overflow-hidden p-0 transition-all hover:border-primary/50 hover:shadow-[0_0_24px_-8px] hover:shadow-primary/30",
          className,
        )}
      >
        {showImage ? (
          <ProjectCardImage project={project} />
        ) : (
          <div className="h-px w-full shrink-0 bg-border" aria-hidden="true" />
        )}
        <div className={cn("flex min-w-0 flex-1 flex-col", compact ? "p-3.5" : "p-4")}>
          <CardHeader className="space-y-2 p-0">
            {!showImage ? (
              <div className="flex items-start justify-between gap-2">
                <CardTitle
                  className={cn(
                    "font-semibold leading-snug tracking-[-0.01em] transition-colors group-hover:text-primary",
                    compact ? "text-sm" : "text-base",
                  )}
                >
                  {project.title}
                </CardTitle>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <ProjectStatusPills project={project} />
                </div>
              </div>
            ) : (
              <CardTitle
                className={cn(
                  "font-semibold leading-snug tracking-[-0.01em] transition-colors group-hover:text-primary",
                  compact ? "text-sm" : "text-base",
                )}
              >
                {project.title}
              </CardTitle>
            )}
            <CardDescription
              className={cn(
                "leading-relaxed",
                compact ? "line-clamp-2 text-xs" : "line-clamp-3 text-sm",
              )}
            >
              {project.description}
            </CardDescription>
            {!compact ? <DomainChips domains={domains} /> : null}
          </CardHeader>

          <CardContent className={cn("mt-auto space-y-3 p-0", compact ? "pt-2.5" : "pt-3")}>
            <TechChips project={project} limit={techLimit} dense={compact} />
            <ProjectActions
              project={project}
              hasReadme={hasReadme}
              onOpenReadme={onOpenReadme}
              size={compact ? "compact" : "standard"}
            />
          </CardContent>
        </div>
      </Card>
    );
  }

  // Standard project card — high-density BentoCard composition.
  return (
    <BentoCard
      hover
      breadcrumb={projectBreadcrumb(project)}
      pills={<ProjectStatusPills project={project} />}
      title={project.title}
      titleClassName="text-base"
      footer={
        <ProjectActions
          project={project}
          hasReadme={hasReadme}
          onOpenReadme={onOpenReadme}
          size="standard"
        />
      }
      className={cn("h-full w-full", className)}
    >
      <CardDescription className="line-clamp-3 text-sm leading-relaxed">
        {project.description}
      </CardDescription>
      <div className="mt-3">
        <DomainChips domains={domains} />
      </div>
      <div className="mt-3">
        <TechChips project={project} limit={techLimit} />
      </div>
    </BentoCard>
  );
}
