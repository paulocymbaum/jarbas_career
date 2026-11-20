import { ExternalLink } from "lucide-react";
import { siteContent } from "@/content/site";
import { useScrollReveal } from "@/hooks/use-anime";
import { FEI_RANKING } from "@/lib/fei-ranking";
import { trackOutbound } from "@/lib/analytics";
import { Section } from "@/components/layout/Section";

export function Education() {
  const listRef = useScrollReveal<HTMLDivElement>();

  return (
    <Section id="education" eyebrow="FOUNDATIONS" title="Education">
      <div ref={listRef} className="grid gap-4 sm:grid-cols-2">
        {siteContent.education.map((item) => (
          <article key={`${item.institution}-${item.degree}`} className="bento-panel p-5">
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <h3 className="text-base font-semibold leading-6 tracking-[-0.01em]">
                {item.degree}
              </h3>
              {item.start && item.end ? (
                <p className="font-mono text-[11px] text-muted-foreground">
                  <time dateTime={`${item.start}/${item.end}`}>
                    {item.start} – {item.end}
                  </time>
                </p>
              ) : null}
            </div>
            <p className="mt-1 font-mono text-[13px] font-medium text-primary">
              {item.institution}
              {item.location ? (
                <span className="font-normal text-muted-foreground"> · {item.location}</span>
              ) : null}
            </p>
            {item.summary ? (
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.summary}</p>
            ) : null}
            {/your-university|automation|control/i.test(item.institution) ? (
              <a
                href={FEI_RANKING.url}
                target="_blank"
                rel="noopener noreferrer"
                data-analytics-id="education-fei-ranking"
                onClick={(event) => trackOutbound("fei-ranking", FEI_RANKING.url, event)}
                className="mt-3 inline-flex items-center gap-1.5 rounded-md border border-primary/30 bg-primary/5 px-2.5 py-1.5 font-mono text-[11px] font-medium text-primary transition-colors hover:border-primary/60"
              >
                Ranking: {FEI_RANKING.rankLabel}
                <ExternalLink className="h-3 w-3" aria-hidden="true" />
              </a>
            ) : null}
          </article>
        ))}
      </div>
    </Section>
  );
}
