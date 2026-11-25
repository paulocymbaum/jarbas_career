import { useEffect, useMemo, useState, useCallback, useRef, type CSSProperties, type ReactNode, type RefObject } from "react";
import {
  ArrowUpRight,
  BarChart3,
  Building2,
  CalendarDays,
  Check,
  ChevronDown,
  Database,
  Linkedin,
  Mail,
  Menu,
  Moon,
  PanelsTopLeft,
  Sparkles,
  Sun,
  Workflow,
  X,
  type LucideIcon,
} from "lucide-react";
import { freelanceContent } from "@/content/freelance";
import { siteContent } from "@/content/site";
import type { FreelanceDeliverable } from "@/content/types";
import { Footer } from "@/components/layout/Footer";
import { TypographicCover } from "@/components/ProjectCard";
import type { Project } from "@/content/types";

const SHOWCASE_INTERVAL = 3400;

function ShowcaseStage({
  project,
  mediaIndex,
  onPrev,
  onNext,
  reduced,
}: {
  project: Project;
  mediaIndex: number;
  onPrev: () => void;
  onNext: () => void;
  reduced: boolean;
}) {
  const shots = project.screenshots ?? (project.imageUrl ? [project.imageUrl] : []);
  const hasMedia = shots.length > 0;
  return (
    <div className="lg:sticky lg:top-24 lg:self-start">
      <div className="relative aspect-[16/10] overflow-hidden rounded-3xl border border-border/60 bg-card shadow-[0_24px_80px_-32px] shadow-primary/30">
        {hasMedia ? (
          shots.map((src, shotIndex) => (
            <img
              key={src}
              src={src}
              alt=""
              loading={shotIndex === 0 ? "eager" : "lazy"}
              decoding="async"
              className={cn(
                "absolute inset-0 h-full w-full object-cover",
                reduced
                  ? shotIndex === mediaIndex
                    ? "opacity-100"
                    : "opacity-0"
                  : cn(
                      "transition-[opacity,transform] duration-700 [transition-timing-function:var(--fx-in)]",
                      shotIndex === mediaIndex ? "opacity-100 scale-100" : "opacity-0 scale-[1.04]",
                    ),
              )}
            />
          ))
        ) : (
          <div className="absolute inset-0">
            <TypographicCover project={project} />
          </div>
        )}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-background/90 via-background/35 to-transparent"
        />
        <div
          key={project.slug}
          className="fx-caption-in absolute inset-x-0 bottom-0 p-5 sm:p-6"
        >
          <div className="flex items-center justify-between gap-3">
            <h4 className="text-lg font-semibold tracking-[-0.01em] text-foreground">
              {project.title}
            </h4>
            <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
              {project.featured ? "Featured" : "Project"}
            </span>
          </div>
          <p className="mt-1 line-clamp-2 max-w-prose text-xs leading-relaxed text-muted-foreground">
            {project.description}
          </p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {project.tech.slice(0, 4).map((tech) => (
              <span
                key={tech}
                className="rounded-md border border-border/60 bg-background/60 px-1.5 py-0.5 font-mono text-[10px] text-foreground/80 backdrop-blur"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
        {hasMedia && shots.length > 1 ? (
          <div className="absolute right-4 top-4 flex items-center gap-1 rounded-full border border-border/60 bg-background/70 p-1 backdrop-blur">
            <button
              type="button"
              aria-label="Previous shot"
              data-analytics-id={`freelance-showcase-prev-${project.slug}`}
              onClick={onPrev}
              className="rounded-full px-2 py-0.5 font-mono text-xs text-foreground transition-colors hover:bg-muted/60"
            >
              ‹
            </button>
            <span className="px-1 font-mono text-[10px] text-muted-foreground">
              {mediaIndex + 1}/{shots.length}
            </span>
            <button
              type="button"
              aria-label="Next shot"
              data-analytics-id={`freelance-showcase-next-${project.slug}`}
              onClick={onNext}
              className="rounded-full px-2 py-0.5 font-mono text-xs text-foreground transition-colors hover:bg-muted/60"
            >
              ›
            </button>
          </div>
        ) : null}
        {hasMedia && shots.length > 1 ? (
          <div className="absolute bottom-3 right-4 flex gap-1.5">
            {shots.map((_, shotIndex) => (
              <span
                key={shotIndex}
                aria-hidden="true"
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  shotIndex === mediaIndex ? "w-5 bg-primary" : "w-1.5 bg-background/60",
                )}
              />
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function ShowcaseRow({
  project,
  index,
  active,
  onSelect,
}: {
  project: Project;
  index: number;
  active: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={active}
      data-analytics-id={`freelance-showcase-${project.slug}`}
      className={cn(
        "group flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition-all duration-200",
        active
          ? "border-primary/50 bg-card shadow-[0_12px_40px_-16px] shadow-primary/25"
          : "border-border/60 hover:border-primary/30 hover:bg-muted/40",
      )}
    >
      <span
        className={cn(
          "font-mono text-xs font-semibold",
          active ? "text-primary" : "text-muted-foreground/60",
        )}
      >
        {String(index + 1).padStart(2, "0")}
      </span>
      <span className="min-w-0 flex-1">
        <span
          className={cn(
            "block truncate text-sm font-semibold transition-colors",
            active ? "text-foreground" : "text-foreground/80",
          )}
        >
          {project.title}
        </span>
        <span className="block truncate text-xs text-muted-foreground">{project.description}</span>
      </span>
      <ArrowUpRight
        className={cn(
          "h-4 w-4 shrink-0 transition-all",
          active ? "text-primary" : "text-muted-foreground/40 group-hover:text-foreground",
        )}
        aria-hidden="true"
      />
    </button>
  );
}

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/use-theme";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { useSectionProgress } from "@/hooks/scroll/use-section-progress";
import { useReveal } from "@/hooks/scroll/use-reveal";
import { useCountUp } from "@/hooks/scroll/use-count-up";
import { useParallax } from "@/hooks/scroll/use-parallax";
import { useHorizontalPin } from "@/hooks/scroll/use-horizontal-pin";
import { useMagnetic } from "@/hooks/scroll/use-magnetic";
import { ProgressRail } from "@/components/freelance/ProgressRail";
import { trackOutbound } from "@/lib/analytics";
import { SCHEDULE_LINK } from "@/lib/links";
import { pageShellClass } from "@/lib/panel";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { id: "services", label: "Services" },
  { id: "work", label: "Work" },
  { id: "process", label: "Process" },
  { id: "faq", label: "FAQ" },
  { id: "contact", label: "Contact" },
] as const;

const FEATURED_WORK_LIMIT = 4;

const SERVICE_ICONS: Record<string, LucideIcon> = {
  "ai-llm": Sparkles,
  "web-apps": PanelsTopLeft,
  "apis-data": Database,
  automation: Workflow,
  "data-engineering": BarChart3,
};

function FreelanceNav() {
  const { theme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const scheduleMagneticRef = useRef<HTMLDivElement>(null);
  useMagnetic(scheduleMagneticRef, 6);

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/70 backdrop-blur-xl backdrop-saturate-150">
      <div className={cn(pageShellClass, "flex h-16 items-center gap-3")}>
        <a
          href="/"
          className="flex min-w-0 items-center gap-2.5"
          data-analytics-id="freelance-header-home"
          title="Back to portfolio"
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-card font-mono text-xs font-bold text-primary">
            PC
          </span>
          <span className="hidden min-w-0 flex-col leading-tight sm:flex">
            <span className="truncate text-sm font-semibold tracking-[-0.01em]">
              {siteContent.name}
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
              Freelance
            </span>
          </span>
        </a>

        <nav aria-label="Freelance" className="ml-auto hidden items-center lg:flex">
          <ul className="flex items-center">
            {NAV_ITEMS.map((item) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  data-analytics-id={`freelance-nav-${item.id}`}
                  className="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-2 lg:ml-3">
          <div ref={scheduleMagneticRef} className="inline-flex">
            <Button asChild size="sm">
              <a
                href={SCHEDULE_LINK}
                target="_blank"
                rel="noopener noreferrer"
                data-analytics-id="freelance-header-schedule"
                onClick={(event) => trackOutbound("schedule", SCHEDULE_LINK, event)}
              >
                <CalendarDays className="h-4 w-4" aria-hidden="true" />
                Schedule a call
              </a>
            </Button>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="hidden lg:inline-flex"
            data-analytics-id="freelance-header-theme-toggle"
            onClick={toggleTheme}
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="lg:hidden"
            aria-expanded={menuOpen}
            aria-controls="freelance-nav-mobile"
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            <span className="sr-only">Toggle navigation</span>
          </Button>
        </div>
      </div>

      {menuOpen ? (
        <nav
          id="freelance-nav-mobile"
          aria-label="Freelance"
          className="border-t border-border bg-background p-5 lg:hidden"
        >
          <ul className="flex flex-col gap-1">
            {NAV_ITEMS.map((item) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  className="block rounded-md px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
                  onClick={() => setMenuOpen(false)}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex items-center gap-2 border-t border-border/60 pt-3">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            >
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
              {theme} mode
            </span>
          </div>
        </nav>
      ) : null}
    </header>
  );
}

function SectionHeader({
  headingId,
  eyebrow,
  title,
  subtitle,
  action,
}: {
  headingId: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
      <div className="max-w-2xl">
        <span className="label-caps text-primary">{eyebrow}</span>
        <h2
          id={headingId}
          className="mt-3 text-3xl font-bold tracking-[-0.03em] text-foreground sm:text-4xl"
        >
          {title}
        </h2>
        <p className="mt-3 max-w-prose text-pretty text-base leading-relaxed text-muted-foreground">
          {subtitle}
        </p>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

function ProofValue({ value }: { value: string }) {
  const match = /^(\d+)(.*)$/.exec(value);
  const numberRef = useRef<HTMLSpanElement>(null);
  useCountUp(numberRef, match ? Number(match[1]) : null, { suffix: match?.[2] ?? "" });
  if (!match) return <>{value}</>;
  return (
    <>
      <span ref={numberRef}>0</span>
      {match[2]}
    </>
  );
}

function ProofCell({ value, label, index }: { value: string; label: string; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useParallax(ref, index % 2 === 0 ? 0.35 : 0.6);
  return (
    <div ref={ref} className="bg-card p-5">
      <p className="text-xl font-bold tracking-[-0.02em] text-primary">
        <ProofValue value={value} />
      </p>
      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{label}</p>
    </div>
  );
}

function FreelanceHero({ briefMailto }: { briefMailto: string }) {
  const reduced = useReducedMotion();
  const sectionRef = useRef<HTMLElement | null>(null);
  const contentRef = useReveal<HTMLDivElement>();
  const imgRef = useRef<HTMLImageElement>(null);
  const proofRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const glowNearRef = useRef<HTMLDivElement>(null);
  const glowFarRef = useRef<HTMLDivElement>(null);
  const magneticRef = useRef<HTMLDivElement>(null);
  useMagnetic(magneticRef, 8);
  useParallax(gridRef, 0.35);
  useParallax(glowNearRef, 0.6);
  useParallax(glowFarRef, 0.35);

  useSectionProgress(
    sectionRef,
    useCallback(
      (progress) => {
        // Photo recedes on exit: scale up + slight blur (depth cue).
        if (imgRef.current) {
          imgRef.current.style.transform = `scale(${(1 + progress * 0.04).toFixed(3)})`;
          imgRef.current.style.filter = reduced ? "" : `blur(${(progress * 6).toFixed(1)}px)`;
        }
        // Content parallaxes out at 0.6 depth.
        if (contentRef.current) {
          contentRef.current.style.transform = reduced
            ? ""
            : `translate3d(0, ${(-progress * 40).toFixed(1)}px, 0)`;
        }
        // Proof strip fades/blurs back as the pinned gallery approaches.
        if (proofRef.current) {
          const fade = Math.min(1, Math.max(0, (progress - 0.5) / 0.4));
          proofRef.current.style.opacity = String(1 - fade * 0.85);
          proofRef.current.style.filter = `blur(${(fade * 4).toFixed(1)}px)`;
        }
      },
      [reduced, contentRef],
    ),
    { mode: "exit" },
  );

  return (
    <section
      ref={sectionRef}
      aria-labelledby="freelance-hero-heading"
      className="relative overflow-hidden"
    >
      {/* Ambient background: fading grid + soft primary glows (parallax layers). */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div
          ref={gridRef}
          className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.35)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.35)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_75%_65%_at_50%_0%,black,transparent)]"
        />
        <div
          ref={glowNearRef}
          className="absolute -top-24 left-1/5 h-72 w-72 rounded-full bg-primary/10 blur-3xl"
        />
        <div
          ref={glowFarRef}
          className="absolute right-0 top-40 h-72 w-72 rounded-full bg-primary/10 blur-3xl"
        />
      </div>

      <div className={cn(pageShellClass, "relative py-16 lg:py-24")}>
        <div
          ref={contentRef}
          className="grid items-center gap-12 lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-16"
        >
          <div>
            <p
              className="fx-reveal inline-flex items-center gap-2.5 rounded-full border border-border/60 bg-card/80 py-1.5 pl-3 pr-4 text-xs font-medium text-muted-foreground"
              style={{ "--fx-i": 0 } as CSSProperties}
            >
              <span className="status-dot" aria-hidden="true" />
              {freelanceContent.hero.eyebrow.charAt(0) +
                freelanceContent.hero.eyebrow.slice(1).toLowerCase()}
            </p>
            <h1
              id="freelance-hero-heading"
              className="fx-reveal mt-6 max-w-3xl text-balance text-5xl font-bold leading-[1.04] tracking-[-0.04em] text-foreground sm:text-6xl xl:text-7xl"
              style={{ "--fx-i": 1 } as CSSProperties}
            >
              {freelanceContent.hero.headline.split(",").length > 1 ? (
                <>
                  {freelanceContent.hero.headline.split(",")[0]},
                  <span className="text-primary">
                    {freelanceContent.hero.headline.split(",").slice(1).join(",")}
                  </span>
                </>
              ) : (
                freelanceContent.hero.headline
              )}
            </h1>
            <p
              className="fx-reveal mt-6 max-w-prose text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg"
              style={{ "--fx-i": 2 } as CSSProperties}
            >
              {freelanceContent.hero.subheadline}
            </p>
            <div
              className="fx-reveal mt-9 flex flex-wrap items-center gap-3"
              style={{ "--fx-i": 3 } as CSSProperties}
            >
              <div ref={magneticRef} className="inline-flex">
                <Button asChild size="lg" className="h-12 px-6 text-base">
                  <a
                    href={SCHEDULE_LINK}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-analytics-id="freelance-hero-schedule"
                    onClick={(event) => trackOutbound("schedule", SCHEDULE_LINK, event)}
                  >
                    <CalendarDays className="h-4 w-4" aria-hidden="true" />
                    Schedule a call
                  </a>
                </Button>
              </div>
              <Button asChild size="lg" variant="secondary" className="h-12 px-6 text-base">
                <a
                  href={briefMailto}
                  data-analytics-id="freelance-hero-brief"
                  onClick={(event) => trackOutbound("brief", briefMailto, event)}
                >
                  <Mail className="h-4 w-4" aria-hidden="true" />
                  Start the brief
                </a>
              </Button>
            </div>
            <p
              className="fx-reveal mt-5 text-sm text-muted-foreground"
              style={{ "--fx-i": 4 } as CSSProperties}
            >
              Built for founders who need it shipped, and CTOs who need it to survive their review.
            </p>
            <p
              className="fx-reveal mt-4 font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground"
              style={{ "--fx-i": 5 } as CSSProperties}
            >
              Trusted by teams like yours
            </p>
          </div>

          <div
            className="fx-reveal fx-reveal-photo relative mx-auto w-56 shrink-0 sm:w-64 lg:w-72 xl:w-80"
            style={{ "--fx-i": 2 } as CSSProperties}
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -inset-6 rounded-[2.5rem] bg-primary/10 blur-2xl"
            />
            <img
              ref={imgRef}
              src={siteContent.photoUrl}
              alt={`Portrait of ${siteContent.name}`}
              width={384}
              height={384}
              loading="eager"
              decoding="async"
              className="relative aspect-square w-full rounded-[2rem] border border-border/60 object-cover shadow-[0_24px_80px_-24px] shadow-primary/40"
            />
            <p className="absolute -left-4 top-8 rounded-xl border border-border/60 bg-card/90 px-3 py-2 font-mono text-[11px] font-semibold text-foreground shadow-lg backdrop-blur sm:-left-8">
              Senior Software Engineer · Freelance Dev
            </p>
            <p className="absolute -bottom-4 right-2 rounded-xl border border-border/60 bg-card/90 px-3 py-2 font-mono text-[11px] font-semibold text-foreground shadow-lg backdrop-blur sm:-right-4">
              {freelanceContent.proofPoints[3]?.value} · Your City
            </p>
          </div>
        </div>

        <div
          ref={proofRef}
          className="relative z-10 -mt-4 grid gap-px overflow-hidden rounded-2xl border border-border/60 bg-border/40 shadow-xl sm:grid-cols-2 lg:grid-cols-4"
        >
          {freelanceContent.proofPoints.map((point, index) => (
            <ProofCell key={point.value} value={point.value} label={point.label} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ServiceCard({
  icon: Icon,
  index,
  title,
  description,
  deliverables,
  tech,
  wide = false,
  dense = false,
  className,
}: {
  icon: LucideIcon;
  index: number;
  title: string;
  description: string;
  deliverables: (string | FreelanceDeliverable)[];
  tech: string[];
  wide?: boolean;
  dense?: boolean;
  className?: string;
}) {
  return (
    <article
      className={cn(
        "group relative flex h-full flex-col rounded-2xl border bg-card transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[0_16px_48px_-16px] hover:shadow-primary/20",
        dense ? "p-5 border-border/60" : "p-6 border-border/60",
        wide &&
          "border-primary/30 bg-gradient-to-br from-primary/[0.06] to-transparent lg:col-span-2",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-4">
        <span
          className={cn(
            "flex items-center justify-center rounded-xl border border-border/60 bg-muted/40 text-primary transition-colors group-hover:border-primary/40",
            dense ? "h-8 w-8" : "h-10 w-10",
          )}
        >
          <Icon className={cn(dense ? "h-4 w-4" : "h-5 w-5")} aria-hidden="true" />
        </span>
        <span
          aria-hidden="true"
          className="font-mono text-sm font-semibold text-muted-foreground/60"
        >
          {String(index + 1).padStart(2, "0")}
        </span>
      </div>
      <h3
        className={cn("mt-4 font-semibold tracking-[-0.01em]", dense ? "text-sm" : "text-lg")}
      >
        {title}
      </h3>
      <p
        className={cn(
          "mt-2 max-w-prose leading-relaxed text-muted-foreground",
          dense ? "text-xs line-clamp-2" : "text-sm",
        )}
      >
        {description}
      </p>
      <ul
        className={cn(
          dense ? "mt-3 space-y-1.5" : "mt-5 space-y-2",
          wide ? "lg:grid lg:grid-cols-2 lg:gap-x-8 lg:space-y-0" : "",
        )}
      >
        {deliverables.map((deliverable) => {
          const { label, outcome } =
            typeof deliverable === "string"
              ? { label: deliverable, outcome: undefined }
              : { label: deliverable.label, outcome: deliverable.outcome };
          return (
            <li
              key={label}
              className={cn(
                "flex items-start gap-2.5 text-foreground/90",
                dense ? "text-xs" : "text-sm",
              )}
            >
              <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" aria-hidden="true" />
              <span>
                {label}
                {outcome ? (
                  dense ? (
                    <span className="text-muted-foreground"> — {outcome}</span>
                  ) : (
                    <span className="block text-xs leading-relaxed text-muted-foreground">
                      {outcome}
                    </span>
                  )
                ) : null}
              </span>
            </li>
          );
        })}
      </ul>
      <div className={cn("mt-auto flex flex-wrap gap-1.5", dense ? "pt-4" : "pt-5")}>
        {tech.map((item) => (
          <Badge key={item}>{item}</Badge>
        ))}
      </div>
    </article>
  );
}

function ServicesSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const gridRef = useReveal<HTMLDivElement>();
  const [pinEnabled, setPinEnabled] = useState(false);
  useHorizontalPin(sectionRef, trackRef, pinEnabled);

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 1024px)");
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setPinEnabled(desktop.matches && !motion.matches);
    update();
    desktop.addEventListener("change", update);
    motion.addEventListener("change", update);
    return () => {
      desktop.removeEventListener("change", update);
      motion.removeEventListener("change", update);
    };
  }, []);

  const header = (
    <SectionHeader
      headingId="services-heading"
      eyebrow="SERVICES"
      title="What I deliver"
      subtitle="Five focused engagements — fixed scope, weekly demos, production quality on every handoff."
    />
  );

  if (pinEnabled) {
    return (
      <section
        ref={sectionRef}
        id="services"
        aria-labelledby="services-heading"
        className="relative z-10 -mt-6 h-[260vh] rounded-t-[2.5rem] bg-muted/30"
      >
        <div className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden pb-6 pt-14">
          <div className={pageShellClass}>
            <div className="flex items-end justify-between gap-6">
              <div>
                <span className="label-caps text-primary">SERVICES</span>
                <h2
                  id="services-heading"
                  className="mt-2 text-2xl font-bold tracking-[-0.02em] text-foreground"
                >
                  What I deliver
                </h2>
              </div>
              <div className="flex min-w-0 flex-1 items-center gap-3 pb-1">
                <p className="fx-pin-readout shrink-0 font-mono text-xs font-semibold text-muted-foreground">
                  01 — 05
                </p>
                <div className="h-1 flex-1 overflow-hidden rounded-full bg-border/40">
                  <div
                    className="fx-pin-bar h-full w-full origin-left bg-primary/80"
                    style={{ transform: "scaleX(0)" }}
                  />
                </div>
              </div>
            </div>
          </div>
          <div
            ref={trackRef}
            className="fx-will-transform mt-5 flex items-start gap-5 pl-[max(1.25rem,calc((100vw-72rem)/2+1.5rem))] pr-12"
          >
            {freelanceContent.services.map((service, index) => (
              <ServiceCard
                key={service.id}
                icon={SERVICE_ICONS[service.id] ?? Sparkles}
                index={index}
                title={service.title}
                description={service.description}
                deliverables={service.deliverables}
                tech={service.tech}
                wide={service.id === "ai-llm"}
                dense
                className="w-[400px] max-w-[82vw] shrink-0"
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      id="services"
      aria-labelledby="services-heading"
      className="relative z-10 -mt-4 scroll-mt-24 rounded-t-[2.5rem] bg-muted/30 py-16 lg:py-24"
    >
      <div className={pageShellClass}>
        {header}
        <div ref={gridRef} className="grid gap-4 lg:grid-cols-2">
          {freelanceContent.services.map((service, index) => (
            <div
              key={service.id}
              className={cn("fx-reveal", service.id === "ai-llm" && "lg:col-span-2")}
              style={{ "--fx-i": index } as CSSProperties}
            >
              <ServiceCard
                icon={SERVICE_ICONS[service.id] ?? Sparkles}
                index={index}
                title={service.title}
                description={service.description}
                deliverables={service.deliverables}
                tech={service.tech}
                wide={service.id === "ai-llm"}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SkillGroupCard({
  name,
  blurb,
  items,
  index,
}: {
  name: string;
  blurb: string;
  items: string[];
  index: number;
}) {
  const driftRef = useRef<HTMLDivElement>(null);
  const revealRef = useReveal<HTMLDivElement>();
  useParallax(driftRef, index % 2 === 0 ? 0.35 : 0.6);
  return (
    <div ref={driftRef}>
      <div ref={revealRef} className="rounded-2xl border border-border/60 bg-card p-5">
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-mono text-xs font-semibold uppercase tracking-[0.12em] text-foreground">
            {name}
          </h3>
          <span className="font-mono text-[11px] text-muted-foreground">
            {String(items.length).padStart(2, "0")}
          </span>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">{blurb}</p>
        <div className="mt-4 flex flex-wrap gap-1.5">
          {items.map((item, itemIndex) => (
            <span
              key={item}
              className="fx-reveal inline-flex"
              style={{ "--fx-i": itemIndex } as CSSProperties}
            >
              <Badge>{item}</Badge>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function SkillsSection() {
  return (
    <section
      id="skills"
      className="cv-auto scroll-mt-24 border-y border-border/60 bg-muted/30 py-16 lg:py-24"
      aria-labelledby="skills-heading"
    >
      <div className={pageShellClass}>
        <SectionHeader
          headingId="skills-heading"
          eyebrow="STACK"
          title="The stack behind the work"
          subtitle="Grouped by the outcome it ships — not by job ad categories."
        />
        <div className="grid gap-4 md:grid-cols-2">
          {freelanceContent.skillGroups.map((group, index) => (
            <SkillGroupCard
              key={group.name}
              name={group.name}
              blurb={group.blurb}
              items={group.items}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function ObjectionSection() {
  const { objections } = freelanceContent;
  const reduced = useReducedMotion();
  const sectionRef = useRef<HTMLElement | null>(null);
  const dividerRef = useRef<HTMLDivElement>(null);
  const panelRef = useReveal<HTMLDivElement>();
  useSectionProgress(
    sectionRef,
    useCallback(
      (progress) => {
        if (reduced) return;
        if (dividerRef.current) {
          dividerRef.current.style.transform = `scaleX(${progress.toFixed(3)})`;
        }
      },
      [reduced],
    ),
  );
  return (
    <section
      ref={sectionRef}
      id="objections"
      aria-labelledby="objections-heading"
      className="cv-auto py-16 lg:py-20"
    >
      <div className={pageShellClass}>
        <div
          ref={panelRef}
          className="fx-reveal fx-rise-scale relative mx-auto max-w-3xl overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary/90 to-violet-600 p-6 text-white shadow-[0_32px_90px_-30px] shadow-primary/60 sm:p-10"
        >
          <div aria-hidden="true" className="pointer-events-none absolute inset-0">
            <div className="absolute -right-10 -top-12 h-44 w-44 rounded-full bg-white/15 blur-2xl" />
            <div className="absolute -bottom-14 -left-10 h-44 w-44 rounded-full bg-fuchsia-400/30 blur-2xl" />
          </div>
          <div className="relative">
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/70">
              Reality check
            </p>
            <h2
              id="objections-heading"
              className="mt-3 text-xl font-semibold tracking-[-0.01em] text-white sm:text-2xl"
            >
              {objections.title}
            </h2>
            <ul className="mt-6 space-y-3">
              {objections.pains.map((pain, index) => (
                <li
                  key={pain}
                  className="fx-reveal fx-strike flex items-start gap-3 text-sm text-white/85"
                  style={{ "--fx-i": index } as CSSProperties}
                >
                  <X className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" aria-hidden="true" />
                  {pain}
                </li>
              ))}
            </ul>
            <div aria-hidden="true" className="mt-8 h-px bg-white/20">
              <div
                ref={dividerRef}
                className="h-full w-full origin-left bg-amber-300"
                style={{ transform: "scaleX(0)" }}
              />
            </div>
            <p className="mt-6 text-sm font-medium leading-relaxed text-white/95">
              {objections.reassurance}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function WorkSection() {
  const engagementRef = useReveal<HTMLDivElement>();
  const reduced = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState(0);
  const [mediaIndex, setMediaIndex] = useState(0);
  const workProjects = useMemo(() => {
    const bySlug = new Map(siteContent.projects.map((project) => [project.slug, project]));
    const curated = freelanceContent.workProjectSlugs
      .map((slug) => bySlug.get(slug))
      .filter((project) => project !== undefined);
    if (curated.length > 0) {
      return curated;
    }
    return siteContent.projects.filter((project) => project.featured).slice(0, FEATURED_WORK_LIMIT);
  }, []);
  const activeProject = workProjects[activeIndex] ?? workProjects[0];
  const activeShots =
    activeProject?.screenshots ?? (activeProject?.imageUrl ? [activeProject.imageUrl] : []);

  useEffect(() => {
    setMediaIndex(0);
  }, [activeIndex]);

  useEffect(() => {
    if (reduced || activeShots.length < 2) return;
    const timer = setInterval(
      () => setMediaIndex((current) => (current + 1) % activeShots.length),
      SHOWCASE_INTERVAL,
    );
    return () => clearInterval(timer);
  }, [reduced, activeShots.length]);

  const prevShot = () =>
    setMediaIndex((current) =>
      activeShots.length ? (current - 1 + activeShots.length) % activeShots.length : 0,
    );
  const nextShot = () =>
    setMediaIndex((current) => (activeShots.length ? (current + 1) % activeShots.length : 0));
  return (
    <section
      id="work"
      className="cv-auto scroll-mt-24 py-16 lg:py-24"
      aria-labelledby="work-heading"
    >
      <div className={pageShellClass}>
        <SectionHeader
          headingId="work-heading"
          eyebrow="PROOF OF WORK"
          title="Selected work"
          subtitle="Commercial products and production systems — from the EdTech SaaS I co-founded to banking-scale AI work."
          action={
            <Button asChild variant="secondary">
              <a href="/#projects" data-analytics-id="freelance-work-portfolio">
                Full portfolio
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </a>
            </Button>
          }
        />

        <div ref={engagementRef}>
          <p className="label-caps mb-4 text-muted-foreground">Commercial engagements</p>
          <div className="mb-14 grid gap-4 md:grid-cols-3">
            {freelanceContent.commercialEngagements.map((item, index) => (
              <div
                key={item.title}
                className="fx-reveal rounded-2xl border border-border/60 bg-card p-5 transition-colors hover:border-primary/40"
                style={{ "--fx-i": index } as CSSProperties}
              >
                <Building2 className="h-5 w-5 text-primary" aria-hidden="true" />
                <h4 className="mt-3 text-sm font-semibold tracking-[-0.01em] text-foreground">
                  {item.title}
                </h4>
                <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-primary">
                  {item.org}
                </p>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        <p className="label-caps mb-4 text-muted-foreground">Products &amp; open source</p>
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-10">
          {activeProject ? (
            <ShowcaseStage
              project={activeProject}
              mediaIndex={mediaIndex}
              onPrev={prevShot}
              onNext={nextShot}
              reduced={reduced}
            />
          ) : null}
          <div className="flex flex-col gap-3 lg:pt-2">
            {workProjects.map((project, index) => (
              <ShowcaseRow
                key={project.slug}
                project={project}
                index={index}
                active={index === activeIndex}
                onSelect={() => setActiveIndex(index)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function ProcessSection() {
  const reduced = useReducedMotion();
  const sectionRef = useRef<HTMLElement | null>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const verticalRef = useRef<HTMLDivElement>(null);
  const stepRefs = useRef<(HTMLLIElement | null)[]>([]);

  useSectionProgress(
    sectionRef,
    useCallback(
      (progress) => {
        if (reduced) return;
        if (lineRef.current) {
          lineRef.current.style.transform = `scaleX(${progress.toFixed(3)})`;
        }
        if (verticalRef.current) {
          verticalRef.current.style.transform = `scaleY(${progress.toFixed(3)})`;
        }
        freelanceContent.engagement.steps.forEach((_, index) => {
          const el = stepRefs.current[index];
          if (!el) return;
          const threshold = (index + 0.9) / freelanceContent.engagement.steps.length;
          el.classList.toggle("fx-step-active", progress >= threshold);
        });
      },
      [reduced],
    ),
  );

  useEffect(() => {
    if (!reduced) return;
    if (lineRef.current) lineRef.current.style.transform = "scaleX(1)";
    if (verticalRef.current) verticalRef.current.style.transform = "scaleY(1)";
    stepRefs.current.forEach((el) => el?.classList.add("fx-step-active"));
  }, [reduced]);

  return (
    <section
      ref={sectionRef}
      id="process"
      className="cv-auto scroll-mt-24 border-y border-border/60 bg-muted/30 py-16 lg:py-24"
      aria-labelledby="process-heading"
    >
      <div className={cn(pageShellClass, "relative")}>
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-0 hidden h-px bg-border/60 lg:block"
        >
          <div
            ref={lineRef}
            className="h-full w-full origin-left bg-primary/60"
            style={{ transform: "scaleX(0)" }}
          />
        </div>
        <div
          aria-hidden="true"
          className="absolute bottom-0 left-0 top-0 hidden w-px bg-border/60 sm:block lg:hidden"
        >
          <div
            ref={verticalRef}
            className="h-full w-full origin-top bg-primary/60"
            style={{ transform: "scaleY(0)" }}
          />
        </div>
        <SectionHeader
          headingId="process-heading"
          eyebrow="ENGAGEMENT"
          title="How we'll work together"
          subtitle={freelanceContent.engagement.note}
        />
        <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {freelanceContent.engagement.steps.map((step, index) => (
            <li
              key={step.title}
              ref={(el) => {
                stepRefs.current[index] = el;
              }}
              className="fx-step rounded-2xl border bg-card p-5"
            >
              <span aria-hidden="true" className="fx-step-num font-mono text-2xl font-bold">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-3 text-base font-semibold tracking-[-0.01em]">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {step.description}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const listRef = useReveal<HTMLDivElement>();
  return (
    <section
      id="faq"
      className="cv-auto scroll-mt-24 py-16 lg:py-24"
      aria-labelledby="faq-heading"
    >
      <div className={cn(pageShellClass, "max-w-3xl")}>
        <SectionHeader
          headingId="faq-heading"
          eyebrow="FAQ"
          title="Questions clients ask"
          subtitle="Short answers to the things that come up on every first call."
        />
        <div ref={listRef} className="flex flex-col gap-3">
          {freelanceContent.faq.map((item, index) => {
            const open = openIndex === index;
            return (
              <div
                key={item.question}
                className={cn(
                  "fx-reveal rounded-2xl border bg-card px-5 py-4 transition-colors",
                  open ? "border-primary/40" : "border-border/60",
                )}
                style={{ "--fx-i": index } as CSSProperties}
              >
                <button
                  type="button"
                  className="flex w-full items-center justify-between gap-4 text-left text-sm font-semibold text-foreground"
                  aria-expanded={open}
                  aria-controls={`faq-panel-${index}`}
                  onClick={() => setOpenIndex((current) => (current === index ? null : index))}
                >
                  {item.question}
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200",
                      open && "rotate-180",
                    )}
                    aria-hidden="true"
                  />
                </button>
                <div id={`faq-panel-${index}`} className="fx-disclosure mt-3" data-open={open}>
                  <div>
                    <p className="text-sm leading-relaxed text-muted-foreground">{item.answer}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function LetterFade({ text }: { text: string }) {
  const ref = useReveal<HTMLSpanElement>();
  return (
    <span ref={ref} className="inline-block">
      {text.split("").map((char, index) => (
        <span
          key={`${char}-${index}`}
          className="fx-reveal fx-reveal-fade inline-block"
          style={{ "--fx-i": index * 0.4 } as CSSProperties}
        >
          {char === " " ? "\u00A0" : char}
        </span>
      ))}
    </span>
  );
}

function ContactSection({ briefMailto }: { briefMailto: string }) {
  const panelRef = useReveal<HTMLDivElement>();
  return (
    <section
      id="contact"
      className="cv-auto scroll-mt-24 pb-16 pt-4 lg:pb-24"
      aria-labelledby="contact-heading"
    >
      <div className={pageShellClass}>
        <div
          ref={panelRef}
          className="fx-reveal fx-rise-scale relative overflow-hidden rounded-3xl border border-border/60 bg-card px-6 py-14 text-center sm:px-12 lg:py-20"
        >
          <div aria-hidden="true" className="pointer-events-none absolute inset-0">
            <div className="fx-orb absolute -left-16 -top-16 h-56 w-56 rounded-full bg-primary/15 blur-3xl" />
            <div className="fx-orb absolute -bottom-16 -right-16 h-56 w-56 rounded-full bg-primary/15 blur-3xl" />
          </div>
          <div className="relative">
            <span
              className="fx-reveal label-caps text-primary"
              style={{ "--fx-i": 0 } as CSSProperties}
            >
              NEXT STEP
            </span>
            <h2
              id="contact-heading"
              className="fx-reveal mx-auto mt-4 max-w-2xl text-balance text-3xl font-bold tracking-[-0.03em] text-foreground sm:text-5xl"
              style={{ "--fx-i": 1 } as CSSProperties}
            >
              {freelanceContent.cta.headline}
            </h2>
            <p
              className="fx-reveal mx-auto mt-4 max-w-prose text-pretty text-base leading-relaxed text-muted-foreground"
              style={{ "--fx-i": 2 } as CSSProperties}
            >
              {freelanceContent.cta.subheadline}
            </p>
            <p
              className="fx-reveal mx-auto mt-3 max-w-prose text-sm text-muted-foreground"
              style={{ "--fx-i": 3 } as CSSProperties}
            >
              Three questions, one email — and a straight answer on whether this is a fit.
            </p>
            <a
              href={briefMailto}
              data-analytics-id="freelance-contact-brief"
              className="fx-reveal fx-reveal-fade relative mt-6 inline-block break-all text-xl font-semibold tracking-[-0.02em] text-foreground underline-offset-4 transition-colors hover:text-primary hover:underline sm:text-2xl"
              style={{ "--fx-i": 4 } as CSSProperties}
              onClick={(event) => trackOutbound("brief", briefMailto, event)}
            >
              <LetterFade text={siteContent.email} />
            </a>
            <div
              className="fx-reveal relative mt-9 flex flex-wrap items-center justify-center gap-3"
              style={{ "--fx-i": 5 } as CSSProperties}
            >
              <Button asChild size="lg" className="h-12 px-6">
                <a
                  href={SCHEDULE_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-analytics-id="freelance-contact-schedule"
                  onClick={(event) => trackOutbound("schedule", SCHEDULE_LINK, event)}
                >
                  <CalendarDays className="h-4 w-4" aria-hidden="true" />
                  Schedule a call
                </a>
              </Button>
              <Button asChild size="lg" variant="secondary" className="h-12 px-6">
                <a
                  href={briefMailto}
                  data-analytics-id="freelance-contact-brief-button"
                  onClick={(event) => trackOutbound("brief", briefMailto, event)}
                >
                  <Mail className="h-4 w-4" aria-hidden="true" />
                  Start the brief
                </a>
              </Button>
              {siteContent.links.linkedin ? (
                <Button asChild size="lg" variant="ghost" className="h-12 px-6">
                  <a
                    href={siteContent.links.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-analytics-id="freelance-contact-linkedin"
                    onClick={(event) =>
                      trackOutbound("linkedin", siteContent.links.linkedin!, event)
                    }
                  >
                    <Linkedin className="h-4 w-4" aria-hidden="true" />
                    LinkedIn
                  </a>
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const BRIEF_SUBJECT = "Freelance project — what does done look like?";
const BRIEF_BODY = `1) What are you building, and for whom?
2) What does "done" look like in 8 weeks?
3) What does it cost you if it ships late?

— `;

function useMeshScrub(
  aRef: RefObject<HTMLDivElement | null>,
  bRef: RefObject<HTMLDivElement | null>,
): void {
  const reduced = useReducedMotion();
  useEffect(() => {
    if (reduced) return;
    let raf = 0;
    let queued = false;
    const update = () => {
      queued = false;
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      const progress = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      if (aRef.current) {
        aRef.current.style.transform = `translate3d(0, ${(progress * 40).toFixed(1)}px, 0)`;
        aRef.current.style.opacity = (0.6 + progress * 0.4).toFixed(2);
      }
      if (bRef.current) {
        bRef.current.style.transform = `translate3d(0, ${(-progress * 60).toFixed(1)}px, 0)`;
        bRef.current.style.opacity = (0.5 + progress * 0.5).toFixed(2);
      }
    };
    const onScroll = () => {
      if (!queued) {
        queued = true;
        raf = requestAnimationFrame(() => {
          update();
          queued = false;
        });
      }
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, [aRef, bRef, reduced]);
}

export function FreelancePage() {
  const meshARef = useRef<HTMLDivElement>(null);
  const meshBRef = useRef<HTMLDivElement>(null);
  useMeshScrub(meshARef, meshBRef);
  const briefMailto = `mailto:${siteContent.email}?subject=${encodeURIComponent(
    BRIEF_SUBJECT,
  )}&body=${encodeURIComponent(BRIEF_BODY)}`;

  return (
    <div className="scroll-smooth relative min-h-screen text-foreground">
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0">
        <div
          ref={meshARef}
          className="absolute -left-24 top-1/4 h-72 w-72 rounded-full bg-primary/10 blur-3xl"
        />
        <div
          ref={meshBRef}
          className="absolute -right-24 top-2/3 h-72 w-72 rounded-full bg-primary/10 blur-3xl"
        />
      </div>
      <div className="relative z-10">
        <a
          href="#freelance-main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
        >
          Skip to main content
        </a>
        <ProgressRail />
        <FreelanceNav />
        <main id="freelance-main">
          <FreelanceHero briefMailto={briefMailto} />
          <ServicesSection />
          <ObjectionSection />
          <SkillsSection />
          <WorkSection />
          <ProcessSection />
          <FaqSection />
          <ContactSection briefMailto={briefMailto} />
        </main>
        <Footer />
      </div>
    </div>
  );
}




