import { ArrowRight, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { siteContent } from "@/content/site";
import type { Project } from "@/content/types";
import { TypographicCover } from "@/components/ProjectCard";
import { Button } from "@/components/ui/button";
import { useScrollReveal } from "@/hooks/use-anime";
import { pageShellClass } from "@/lib/panel";
import { cn } from "@/lib/utils";

type ShowcaseImage = { src: string; title: string; alt: string };
type ShowcaseItem =
  | ({ kind: "image" } & ShowcaseImage)
  | { kind: "typographic"; project: Project };

/**
 * Screenshot frames first (in site order); featured projects without any
 * screenshot join the strip as typographic cards so the marquee still
 * represents them.
 */
function collectShowcaseItems(): ShowcaseItem[] {
  return siteContent.projects.flatMap((project) => {
    const frames = (project.screenshots ?? []).map<ShowcaseItem>((src) => ({
      kind: "image",
      src,
      title: project.title,
      alt: `${project.title} screenshot`,
    }));
    if (frames.length > 0 || !project.featured) return frames;
    return [{ kind: "typographic", project }];
  });
}

type ProjectShowcaseCarouselProps = {
  /**
   * Narrow mode: compact strip designed to sit in the hero's right column
   * (no page shell wrapper, smaller frames).
   */
  narrow?: boolean;
  className?: string;
};

export function ProjectShowcaseCarousel({
  narrow = false,
  className,
}: ProjectShowcaseCarouselProps) {
  const revealRef = useScrollReveal<HTMLDivElement>();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [zoomImage, setZoomImage] = useState<ShowcaseImage | null>(null);
  const items = collectShowcaseItems();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (zoomImage) {
      if (!dialog.open) dialog.showModal();
    } else if (dialog.open) {
      dialog.close();
    }
  }, [zoomImage]);

  if (items.length === 0) {
    return null;
  }

  const looped = items.length > 3 ? [...items, ...items] : items;

  return (
    <section
      aria-labelledby="project-showcase-heading"
      className={cn(!narrow && "py-6 lg:py-10", className)}
    >
      <div className={cn(!narrow && pageShellClass)}>
        <header className="mb-3 flex items-center justify-between gap-3">
          <h2 id="project-showcase-heading" className="label-caps">
            Project showcase · Live builds
          </h2>
          <a
            href="#projects"
            className="inline-flex shrink-0 items-center gap-1.5 font-mono text-xs font-medium text-primary transition-colors hover:text-primary/80 sm:text-[13px]"
          >
            View projects
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </a>
        </header>
        <div ref={revealRef} className="project-marquee bento-panel overflow-hidden">
          <div
            className={cn(
              "project-marquee-track flex w-max items-center",
              narrow ? "py-3" : "py-4",
            )}
          >
            {looped.map((item, index) => {
              const interactive = index < items.length;

              if (item.kind === "typographic") {
                const cover = (
                  <TypographicCover
                    project={item.project}
                    className={cn(
                      "h-28 w-48 rounded-lg border border-border/60 sm:h-32 sm:w-56",
                    )}
                  />
                );
                return interactive ? (
                  <a
                    key={`${item.project.slug}-typo-${index}`}
                    href="#projects"
                    aria-label={`View ${item.project.title} in projects`}
                    className="group relative mr-4 block shrink-0"
                    data-analytics-id={`showcase-typographic-${item.project.slug}`}
                  >
                    {cover}
                    <span className="pointer-events-none absolute right-2 top-2 rounded-sm bg-background/80 px-1.5 py-0.5 text-[10px] font-medium text-foreground opacity-0 transition-opacity group-hover:opacity-100">
                      View
                    </span>
                  </a>
                ) : (
                  <div
                    key={`${item.project.slug}-typo-${index}`}
                    aria-hidden="true"
                    className="mr-4 shrink-0"
                  >
                    {cover}
                  </div>
                );
              }

              const image = item;
              return interactive ? (
                <button
                  key={`${image.src}-${index}`}
                  type="button"
                  onClick={() => setZoomImage(image)}
                  aria-label={`Zoom in: ${image.title} screenshot`}
                  className="group relative mr-4 block shrink-0 cursor-zoom-in"
                >
                  <img
                    src={image.src}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className={cn(
                      "h-auto w-auto max-w-[80vw] rounded-lg border border-border/60 object-cover transition-transform duration-200 group-hover:scale-[1.02]",
                      narrow ? "h-28 sm:h-32" : "h-44 sm:h-52",
                    )}
                  />
                  <span className="pointer-events-none absolute inset-x-0 bottom-0 rounded-b-lg bg-gradient-to-t from-background/90 via-background/50 to-transparent px-3 pb-2 pt-8 text-left text-xs font-semibold text-foreground">
                    {image.title}
                  </span>
                  <span className="pointer-events-none absolute right-2 top-2 rounded-sm bg-background/80 px-1.5 py-0.5 text-[10px] font-medium text-foreground opacity-0 transition-opacity group-hover:opacity-100">
                    Zoom
                  </span>
                </button>
              ) : (
                <div key={`${image.src}-${index}`} aria-hidden="true" className="mr-4 shrink-0">
                  <img
                    src={image.src}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className={cn(
                      "h-auto w-auto max-w-[80vw] rounded-lg border border-border/60 object-cover",
                      narrow ? "h-28 sm:h-32" : "h-44 sm:h-52",
                    )}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <dialog
        ref={dialogRef}
        onClose={() => setZoomImage(null)}
        onCancel={() => setZoomImage(null)}
        aria-labelledby="carousel-zoom-title"
        className="content-modal z-50 overflow-hidden border border-border bg-card text-card-foreground"
      >
        {zoomImage ? (
          <div className="p-4 sm:p-5">
            <div className="mb-3 flex items-start justify-between gap-4">
              <h2 id="carousel-zoom-title" className="text-lg font-medium tracking-tight">
                {zoomImage.title}
              </h2>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="shrink-0"
                aria-label="Close"
                onClick={() => setZoomImage(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <img
              src={zoomImage.src}
              alt={`${zoomImage.title} screenshot`}
              decoding="async"
              className="max-h-[78vh] w-auto max-w-full rounded-lg border border-border/60 object-contain"
            />
          </div>
        ) : null}
      </dialog>
    </section>
  );
}
