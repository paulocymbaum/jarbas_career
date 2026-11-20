import { ExternalLink, Github } from "lucide-react";
import { trackGithubNavigation, trackPraxisProjectClickIfNeeded } from "@/lib/analytics";
import { cn } from "@/lib/utils";

type ProjectGithubLinkProps = {
  privateRepo?: boolean;
  url?: string;
  className?: string;
  size?: "sm" | "md";
  label?: string;
  analyticsSource?: string;
  projectSlug?: string;
};

export function ProjectGithubLink({
  privateRepo = false,
  url,
  className,
  size = "sm",
  label = "GitHub",
  analyticsSource = "project_github_link",
  projectSlug,
}: ProjectGithubLinkProps) {
  const iconClass = size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4";
  const textClass = size === "sm" ? "text-xs" : "text-sm";

  if (privateRepo) {
    return (
      <span className={cn("group relative inline-flex", className)}>
        <span
          className={cn(
            "inline-flex cursor-not-allowed items-center gap-1 font-medium text-muted-foreground/45",
            textClass,
          )}
          aria-disabled="true"
          tabIndex={0}
        >
          <Github className={iconClass} aria-hidden="true" />
          {label}
        </span>
        <span
          role="tooltip"
          className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 w-max max-w-[12rem] -translate-x-1/2 rounded-md border border-border bg-card px-2 py-1 text-center text-[11px] leading-snug text-foreground opacity-0 shadow-md transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"
        >
          This repo is private
        </span>
      </span>
    );
  }

  if (!url) return null;

  return (
    <a
      href={url}
      className={cn(
        "inline-flex items-center gap-1 font-medium text-muted-foreground transition-colors hover:text-primary",
        textClass,
        className,
      )}
      rel="noopener noreferrer"
      target="_blank"
      aria-label="GitHub, opens in new tab"
      onClick={(event) => {
        trackGithubNavigation(url, analyticsSource, event);
        if (projectSlug) {
          trackPraxisProjectClickIfNeeded(projectSlug, "github", url, event);
        }
      }}
    >
      <Github className={iconClass} aria-hidden="true" />
      {label}
      {size === "md" ? <ExternalLink className="h-3 w-3" aria-hidden="true" /> : null}
    </a>
  );
}
