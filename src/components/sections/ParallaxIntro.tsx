import { useMemo } from "react";
import { siteContent } from "@/content/site";
import { HeroContent } from "@/components/sections/Hero";
import { ProjectShowcaseCarousel } from "@/components/sections/ProjectShowcaseCarousel";
import { WritingShowcaseCarousel } from "@/components/sections/WritingShowcaseCarousel";
import { MetricCard } from "@/components/bento";
import { buildProofMetrics } from "@/lib/proof-metrics";
import { FEI_RANKING } from "@/lib/fei-ranking";
import { introSectionClass, pageShellClass } from "@/lib/panel";
import { cn } from "@/lib/utils";

/**
 * Hero band — two-column bento: identity + pitch on the left, the live
 * project showcase strip on the right, proof metrics full-width below.
 * Substitutes the former About section.
 */
export function ParallaxIntro() {
  const metrics = useMemo(buildProofMetrics, []);
  const hasShowcase = useMemo(
    () => siteContent.projects.some((project) => (project.screenshots ?? []).length > 0),
    [],
  );
  const hasWriting = siteContent.articles.length > 0;

  return (
    <div className={cn("relative", introSectionClass)}>
      <section
        className="relative z-10 pt-10 pb-8 lg:pt-12 lg:pb-8"
        aria-labelledby="hero-heading"
      >
        <div className={pageShellClass}>
          <div
            className={cn(
              "grid grid-cols-1 gap-8 lg:gap-10",
              hasShowcase && "lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start",
            )}
          >
            <HeroContent />
            {hasShowcase || hasWriting ? (
              <div className="flex min-w-0 flex-col gap-4">
                {hasShowcase ? (
                  <ProjectShowcaseCarousel narrow className="lg:pt-1" />
                ) : null}
                {hasWriting ? (
                  <WritingShowcaseCarousel className="lg:pt-1" />
                ) : null}
              </div>
            ) : null}
          </div>

          {metrics ? (
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <MetricCard
                label="Shipped systems"
                value={String(metrics.systemCount).padStart(2, "0")}
                suffix="systems"
                delta={`+${metrics.featuredCount} flagship builds`}
                description="Open-source repos & production platforms on GitHub."
              />
              <MetricCard
                label="Verified throughput"
                value={metrics.contributions.toLocaleString()}
                suffix="contributions"
                delta="12-month audited cadence"
                description="Full contribution matrix in the activity panel below."
                href="#activity"
                analyticsId="hero-metrics-activity"
              />
              <MetricCard
                label="Education · Ranking"
                value="#1"
                suffix="in ranked scope"
                delta="#6 among evaluated programs"
                description="B.E. Automation & Control Engineering — the deterministic foundation behind every role."
                href={FEI_RANKING.url}
                analyticsId="hero-metrics-fei-ranking"
                beacon
              />
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
