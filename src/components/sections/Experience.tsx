import { ChevronRight } from "lucide-react";
import { useState } from "react";
import { siteContent } from "@/content/site";
import type { Experience } from "@/content/types";
import { formatPeriod } from "@/lib/format";
import { useScrollReveal } from "@/hooks/use-anime";
import { BentoCard, StatusPill, TechChip } from "@/components/bento";
import { Section } from "@/components/layout/Section";

const HIGHLIGHTS_PREVIEW = 2;

function ExperienceCard({ job }: { job: Experience }) {
  const [expanded, setExpanded] = useState(false);
  const hiddenHighlights = job.highlights.length - HIGHLIGHTS_PREVIEW;
  const visibleHighlights = expanded
    ? job.highlights
    : job.highlights.slice(0, HIGHLIGHTS_PREVIEW);

  return (
    <BentoCard
      hover
      padding="compact"
      breadcrumb={
        <>
          <span className="font-medium text-foreground">{job.company}</span>
          {job.location ? (
            <span className="text-muted-foreground"> · {job.location}</span>
          ) : null}
        </>
      }
      pills={
        <StatusPill variant="neutral">
          <time dateTime={`${job.start}/${job.end ?? "present"}`}>
            {formatPeriod(job.start, job.end)}
          </time>
        </StatusPill>
      }
      title={job.role}
      footer={
        <div className="flex flex-wrap gap-1.5">
          {job.tech.map((tech) => (
            <TechChip key={tech}>{tech}</TechChip>
          ))}
        </div>
      }
    >
      {job.summary ? (
        <p className="text-sm leading-relaxed text-muted-foreground">{job.summary}</p>
      ) : null}
      <ul className="mt-3 space-y-1.5 text-sm leading-relaxed text-muted-foreground">
        {visibleHighlights.map((highlight) => (
          <li key={highlight} className="flex gap-2">
            <ChevronRight
              className="mt-0.5 h-4 w-4 shrink-0 text-primary"
              aria-hidden="true"
            />
            <span>{highlight}</span>
          </li>
        ))}
        {hiddenHighlights > 0 ? (
          <li>
            <button
              type="button"
              aria-expanded={expanded}
              data-analytics-id={`experience-highlights-${job.company}`}
              onClick={() => setExpanded((open) => !open)}
              className="font-mono text-[11px] font-semibold text-primary transition-colors hover:text-primary/80"
            >
              {expanded
                ? "Show fewer highlights"
                : `+${hiddenHighlights} more highlights`}
            </button>
          </li>
        ) : null}
      </ul>
    </BentoCard>
  );
}

function careerSpanLabel(): string {
  const jobs = siteContent.experience;
  if (!jobs.length) return "";
  const first = jobs[jobs.length - 1]?.start;
  if (!first) return "";
  return `${first.slice(0, 4)} — PRESENT`;
}

export function Experience() {
  const listRef = useScrollReveal<HTMLOListElement>();

  return (
    <Section
      id="experience"
      eyebrow={`CAREER TELEMETRY · ${careerSpanLabel()}`}
      title="Experience"
      alt
    >
      <ol ref={listRef} className="space-y-3">
        {siteContent.experience.map((job) => (
          <li key={`${job.company}-${job.role}`}>
            <ExperienceCard job={job} />
          </li>
        ))}
      </ol>
    </Section>
  );
}
