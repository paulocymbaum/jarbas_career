import { ExternalLink } from "lucide-react";
import { siteContent } from "@/content/site";
import { formatIssued } from "@/lib/format";
import { useScrollReveal } from "@/hooks/use-anime";
import { Section } from "@/components/layout/Section";

export function Certifications() {
  const listRef = useScrollReveal<HTMLUListElement>();

  return (
    <Section id="certifications" eyebrow="VERIFIED CREDENTIALS" title="Certifications" alt>
      <ul ref={listRef} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {siteContent.certifications.map((cert) => {
          const issuedLabel = cert.issuedDate ? formatIssued(cert.issuedDate) : null;
          const content = (
            <>
              <h3 className="text-sm font-semibold leading-5 tracking-[-0.01em] transition-colors group-hover:text-primary">
                {cert.name}
              </h3>
              <p className="mt-1 font-mono text-[11px] text-muted-foreground">{cert.issuer}</p>
              {issuedLabel ? (
                <p className="mt-1 font-mono text-[11px] text-muted-foreground/80">{issuedLabel}</p>
              ) : null}
              {cert.verifyUrl ? (
                <span className="mt-auto inline-flex items-center gap-1 pt-3 font-mono text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                  Verify
                  <ExternalLink className="h-3 w-3" aria-hidden="true" />
                </span>
              ) : null}
            </>
          );

          return (
            <li key={cert.name} className="h-full">
              {cert.verifyUrl ? (
                <a
                  href={cert.verifyUrl}
                  rel="noopener noreferrer"
                  target="_blank"
                  aria-label={`Verify ${cert.name}`}
                  className="bento-panel bento-panel-hover group flex h-full flex-col p-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  {content}
                </a>
              ) : (
                <div className="bento-panel flex h-full flex-col p-4">{content}</div>
              )}
            </li>
          );
        })}
      </ul>
    </Section>
  );
}
