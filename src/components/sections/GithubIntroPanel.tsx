import { useCallback, useState } from "react";
import { githubActivity } from "@/content/github-activity";
import { GithubContributionHeatmap } from "@/components/GithubContributionHeatmap";
import { GithubContributionHeatmap3d } from "@/components/GithubContributionHeatmap3d";
import { contentPanelClass } from "@/lib/panel";
import { cn } from "@/lib/utils";

type GithubIntroPanelProps = {
  className?: string;
};

function formatGithubActivityFetchedAt(fetchedAt: string | null): string | null {
  if (!fetchedAt) {
    return null;
  }

  const date = new Date(fetchedAt);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function GithubIntroPanel({ className }: GithubIntroPanelProps) {
  const [use2dFallback, setUse2dFallback] = useState(false);

  const handleUnavailable = useCallback(() => {
    setUse2dFallback(true);
  }, []);

  const hasActivity = githubActivity.weeks.length > 0;
  const lastSynced = formatGithubActivityFetchedAt(githubActivity.fetchedAt);

  if (!hasActivity) return null;

  return (
    <section
      aria-labelledby="github-intro-heading"
      className={cn(contentPanelClass, "relative overflow-hidden", className)}
    >
      <header className="relative z-10 mb-4 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <h2
            id="github-intro-heading"
            className="text-lg font-medium tracking-tight sm:text-xl"
          >
            GitHub
          </h2>
          <p className="mt-2 text-xs text-muted-foreground sm:text-sm">
            Synced every 12h
            {lastSynced ? (
              <span className="text-muted-foreground/80"> · Last sync: {lastSynced}</span>
            ) : null}
            {!use2dFallback ? (
              <span className="hidden text-muted-foreground/80 sm:inline"> · Drag to pan</span>
            ) : null}
          </p>
        </div>
        <div className="flex w-full shrink-0 flex-wrap items-center gap-2 sm:w-auto">
          <a
            href="#activity"
            className="rounded-md border border-border bg-secondary px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-primary/40 hover:text-primary"
          >
            Full activity
          </a>
          <a
            href={`https://github.com/${githubActivity.username}`}
            className="rounded-md border border-border bg-secondary px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-primary/40 hover:text-primary"
            rel="noopener noreferrer"
            target="_blank"
          >
            @{githubActivity.username}
          </a>
        </div>
      </header>

      <div className="relative min-h-[12rem] overflow-hidden border border-border bg-card sm:min-h-[16rem] lg:min-h-[18rem]">
        {use2dFallback ? (
          <div className="h-full min-h-[14rem] opacity-90 saturate-125 sm:min-h-[18rem] lg:min-h-[20rem]">
            <GithubContributionHeatmap activity={githubActivity} />
          </div>
        ) : (
          <GithubContributionHeatmap3d
            activity={githubActivity}
            variant="hero"
            className="h-full min-h-[14rem] cursor-grab active:cursor-grabbing sm:min-h-[18rem] lg:min-h-[20rem]"
            onUnavailable={handleUnavailable}
          />
        )}
      </div>
    </section>
  );
}
