import { ArrowUpRight } from "lucide-react";
import { githubActivity } from "@/content/github-activity";
import { GithubContributionHeatmap } from "@/components/GithubContributionHeatmap";
import { useScrollReveal } from "@/hooks/use-anime";
import { trackGithubNavigation } from "@/lib/analytics";
import { Section } from "@/components/layout/Section";

export function GithubActivity() {
  const contentRef = useScrollReveal<HTMLDivElement>();

  return (
    <Section
      id="activity"
      eyebrow="TELEMETRY & AUDIT TRAIL"
      title="GitHub Activity"
      alt
    >
      <div ref={contentRef} className="bento-panel p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="metric-display text-foreground">
              {githubActivity.totalContributions.toLocaleString()}
              <span className="ml-2 align-middle font-sans text-base font-medium tracking-normal text-muted-foreground">
                verified contributions
              </span>
            </p>
            {githubActivity.from && githubActivity.to ? (
              <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
                {githubActivity.from} → {githubActivity.to}
                {githubActivity.includesPrivateContributions ? " · includes private repos" : null}
              </p>
            ) : null}
          </div>
          <a
            href={`https://github.com/${githubActivity.username}`}
            className="inline-flex shrink-0 items-center gap-1 font-mono text-[13px] font-medium text-primary transition-colors hover:text-primary/80"
            rel="noopener noreferrer"
            target="_blank"
            data-analytics-id="activity-heatmap-github-profile"
            onClick={(event) =>
              trackGithubNavigation(
                `https://github.com/${githubActivity.username}`,
                "activity_heatmap",
                event,
              )
            }
          >
            github.com/{githubActivity.username}
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </a>
        </div>
        <div className="mt-5 border-t border-border/60 pt-5">
          <GithubContributionHeatmap activity={githubActivity} hideSummary />
        </div>
      </div>
    </Section>
  );
}
