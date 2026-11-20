import { animate } from "animejs";
import {
  ArrowDown,
  ArrowUpRight,
  CalendarDays,
  Github,
  Linkedin,
  MapPin,
} from "lucide-react";
import { useEffect, useMemo, useRef } from "react";
import { siteContent } from "@/content/site";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { trackGithubNavigation, trackOutbound } from "@/lib/analytics";
import { SCHEDULE_LINK } from "@/lib/links";
import { Button } from "@/components/ui/button";
import { TechChip } from "@/components/bento";
import { copyLeadClass, pageShellClass } from "@/lib/panel";
import { cn } from "@/lib/utils";

/**
 * Hero chip selection — curated high-signal skills, validated against the
 * real profile data (stack + skills) and experience tech so no tag is
 * invented. Role stacks lead; delivery/platform skills (API, CI/CD…)
 * follow.
 */
const HERO_CHIP_PREFERENCE = [
  // Role stacks
  "Python",
  "TypeScript",
  "React",
  "LangChain",
  "FastAPI",
  "RAG",
  "PostgreSQL",
  // Delivery & platform
  "API Integration",
  "REST/GraphQL APIs",
  "CI/CD",
  "Docker",
  "DevOps",
];

function heroStackChips(): { label: string; tone: "ai" | "core" }[] {
  // Every skill token that exists anywhere in the profile data.
  const tokens = new Set<string>();
  for (const profile of siteContent.professionalProfiles) {
    for (const item of [...profile.stack, ...profile.skills]) {
      tokens.add(item.toLowerCase());
    }
  }
  for (const job of siteContent.experience) {
    for (const item of job.tech) {
      tokens.add(item.toLowerCase());
    }
  }

  const seen = new Set<string>();
  const chips: { label: string; tone: "ai" | "core" }[] = [];
  for (const label of HERO_CHIP_PREFERENCE) {
    if (tokens.has(label.toLowerCase()) && !seen.has(label.toLowerCase())) {
      seen.add(label.toLowerCase());
      chips.push({
        label,
        tone: chips.length % 2 === 0 ? "ai" : "core",
      });
    }
  }
  return chips.slice(0, 11);
}

export function HeroContent({
  className,
}: {
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const chips = useMemo(heroStackChips, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || reducedMotion) return;

    const items = container.querySelectorAll("[data-hero-item]");
    items.forEach((item) => {
      (item as HTMLElement).style.opacity = "0";
      (item as HTMLElement).style.transform = "translateY(16px)";
    });

    animate(items, {
      opacity: [0, 1],
      translateY: [16, 0],
      delay: (_el, i) => (i ?? 0) * 70 + 40,
      duration: 450,
      ease: "outCubic",
    });
  }, [reducedMotion]);

  return (
    <div ref={containerRef} className={cn("relative w-full min-w-0", className)}>
      {/* Ambient hero glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-28 left-1/2 h-72 w-[42rem] max-w-[120vw] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl"
      />

      {siteContent.photoUrl ? (
        <div data-hero-item className="relative mt-8 flex items-center gap-4">
          <div className="relative w-fit shrink-0">
            <img
              src={siteContent.photoUrl}
              alt={`Portrait of ${siteContent.name}`}
              width={64}
              height={64}
              loading="eager"
              decoding="async"
              className="h-14 w-14 rounded-xl border border-border object-cover lg:h-16 lg:w-16"
            />
            <span
              className="absolute -bottom-1.5 -right-2 inline-flex items-center gap-1 rounded-full border border-border/80 bg-background/90 px-1.5 py-0.5 backdrop-blur"
              aria-hidden="true"
            >
              <span className="status-dot !h-1.5 !w-1.5" />
              <span className="font-mono text-[9px] font-semibold text-muted-foreground">
                ONLINE
              </span>
            </span>
          </div>
          <div className="min-w-0">
            <p className="font-mono text-[13px] font-semibold uppercase tracking-[0.08em]">
              <span className="text-gradient-accent">{siteContent.title}</span>
            </p>
            <p className="mt-1 inline-flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              {siteContent.country}-based · {siteContent.footerNote}
            </p>
          </div>
        </div>
      ) : null}

      <h1
        id="hero-heading"
        data-hero-item
        className="relative mt-6 text-balance break-words text-4xl font-bold tracking-[-0.04em] sm:text-5xl sm:leading-[1.1] lg:text-[3.5rem] lg:leading-[1.05]"
      >
        {siteContent.name}
      </h1>
      <p
        data-hero-item
        className={cn(
          "relative mt-4 max-w-2xl text-base leading-7 text-muted-foreground lg:text-lg lg:leading-8",
          copyLeadClass,
        )}
      >
        {siteContent.pitch}
      </p>

      {chips.length ? (
        <div data-hero-item className="relative mt-6 flex flex-wrap gap-1.5">
          {chips.map((chip) => (
            <TechChip key={chip.label} tone={chip.tone}>
              {chip.label}
            </TechChip>
          ))}
        </div>
      ) : null}

      <div
        data-hero-item
        className="relative mt-8 flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center"
      >
        <Button asChild className="w-full sm:w-auto">
          <a href="#projects" data-analytics-id="hero-view-projects">
            Explore flagship projects
            <ArrowDown className="h-4 w-4" aria-hidden="true" />
          </a>
        </Button>
        <Button asChild variant="secondary" className="w-full sm:w-auto">
          <a
            href={SCHEDULE_LINK}
            target="_blank"
            rel="noopener noreferrer"
            title="Schedule a conversation about opportunities"
            data-analytics-id="hero-schedule"
            onClick={(event) => trackOutbound("calendly", SCHEDULE_LINK, event)}
          >
            <CalendarDays className="h-4 w-4" aria-hidden="true" />
            Schedule a call
          </a>
        </Button>
        <div className="flex flex-wrap items-center gap-2 sm:ml-1">
          {siteContent.links.github ? (
            <Button asChild variant="ghost" size="icon" aria-label="GitHub, opens in new tab">
              <a
                href={siteContent.links.github}
                data-analytics-id="hero-github"
                rel="noopener noreferrer"
                target="_blank"
                onClick={(event) =>
                  trackGithubNavigation(siteContent.links.github!, "hero", event)
                }
              >
                <Github className="h-5 w-5" />
              </a>
            </Button>
          ) : null}
          {siteContent.links.linkedin ? (
            <Button asChild variant="ghost" size="icon" aria-label="LinkedIn, opens in new tab">
              <a
                href={siteContent.links.linkedin}
                data-analytics-id="hero-linkedin"
                rel="noopener noreferrer"
                target="_blank"
                onClick={(event) => trackOutbound("linkedin", siteContent.links.linkedin!, event)}
              >
                <Linkedin className="h-5 w-5" />
              </a>
            </Button>
          ) : null}
          <span className="inline-flex items-center gap-1 font-mono text-[11px] text-muted-foreground">
            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
            Role-tailored resumes below
          </span>
        </div>
      </div>
    </div>
  );
}

export function Hero() {
  return (
    <section className="relative pt-16 pb-8 lg:pt-24 lg:pb-12" aria-labelledby="hero-heading">
      <div className={pageShellClass}>
        <HeroContent />
      </div>
    </section>
  );
}
