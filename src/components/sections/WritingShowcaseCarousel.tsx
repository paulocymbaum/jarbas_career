import { ArrowRight, ExternalLink } from "lucide-react";
import { siteContent } from "@/content/site";
import { StatusPill } from "@/components/bento";
import { trackArticleOpen } from "@/lib/analytics";
import { useScrollReveal } from "@/hooks/use-anime";

/**
 * Narrow animated marquee of Writing cards (LinkedIn articles), designed to
 * stack under the Project showcase strip in the hero's right column.
 * Cards use theme tokens (bg-card/border-border) so light mode stays clean.
 */
export function WritingShowcaseCarousel({ className }: { className?: string }) {
  const revealRef = useScrollReveal<HTMLDivElement>();
  const articles = siteContent.articles;

  if (!articles.length) return null;

  const looped = articles.length > 2 ? [...articles, ...articles] : articles;

  return (
    <section aria-labelledby="writing-showcase-heading" className={className}>
      <header className="mb-3 flex items-center justify-between gap-3">
        <h2 id="writing-showcase-heading" className="label-caps">
          Writing · On LinkedIn
        </h2>
        <a
          href="#writing"
          className="inline-flex shrink-0 items-center gap-1.5 font-mono text-xs font-medium text-primary transition-colors hover:text-primary/80 sm:text-[13px]"
        >
          View all
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </a>
      </header>

      <div ref={revealRef} className="project-marquee bento-panel overflow-hidden">
        <div className="project-marquee-track flex w-max items-stretch py-3">
          {looped.map((article, index) => {
            const interactive = index < articles.length;
            const card = (
              <article className="group/card flex h-full min-h-[7.25rem] w-64 shrink-0 flex-col rounded-lg border border-border/60 bg-card p-3 transition-colors duration-200 group-hover/card:border-primary/50">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-[10px] font-semibold text-primary">
                    {String((index % articles.length) + 1).padStart(2, "0")}
                  </span>
                  {article.featured ? (
                    <StatusPill variant="flagship">Featured</StatusPill>
                  ) : (
                    <span className="font-mono text-[9px] uppercase tracking-[0.06em] text-muted-foreground">
                      {article.readTime ?? "LinkedIn"}
                    </span>
                  )}
                </div>
                <h3 className="mt-2 line-clamp-3 text-xs font-semibold leading-snug text-foreground transition-colors duration-200 group-hover/card:text-primary">
                  {article.title}
                </h3>
                <span className="mt-auto inline-flex items-center gap-1 pt-2 font-mono text-[10px] font-medium text-primary">
                  Read on LinkedIn
                  <ExternalLink
                    className="h-3 w-3 transition-transform duration-200 group-hover/card:translate-x-0.5 group-hover/card:-translate-y-0.5"
                    aria-hidden="true"
                  />
                </span>
              </article>
            );

            return interactive ? (
              <a
                key={`${article.url}-${index}`}
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group/card mr-4 block shrink-0"
                data-analytics-id={`writing-carousel-${index}`}
                onClick={(event) => trackArticleOpen(article.title, article.url, event)}
              >
                {card}
              </a>
            ) : (
              <div key={`${article.url}-${index}`} aria-hidden="true" className="mr-4 shrink-0">
                {card}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}