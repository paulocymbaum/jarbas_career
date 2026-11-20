import { CalendarDays, Github, Linkedin } from "lucide-react";
import { siteContent } from "@/content/site";
import { useScrollReveal } from "@/hooks/use-anime";
import { trackGithubNavigation, trackOutbound } from "@/lib/analytics";
import { SCHEDULE_LINK } from "@/lib/links";
import { Section } from "@/components/layout/Section";
import { Button } from "@/components/ui/button";

export function Contact() {
  const blockRef = useScrollReveal<HTMLDivElement>();

  return (
    <Section
      id="contact"
      eyebrow="DIRECT CHANNELS"
      title="Contact"
      subtitle="Email, LinkedIn, or GitHub. I usually reply within a day."
    >
      <div
        ref={blockRef}
        className="bento-panel relative overflow-hidden p-6 sm:p-8"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-primary/15 blur-3xl"
        />
        <p className="label-caps relative">OPERATIONAL · OPEN TO NEW PROJECTS</p>
        <a
          href={`mailto:${siteContent.email}`}
          data-analytics-id="contact-email"
          className="relative mt-3 inline-block break-all text-xl font-semibold tracking-[-0.02em] text-foreground underline-offset-4 transition-colors hover:text-primary hover:underline sm:text-2xl"
          onClick={(event) => trackOutbound("email", `mailto:${siteContent.email}`, event)}
        >
          {siteContent.email}
        </a>
        <div className="relative mt-6 flex flex-wrap gap-3">
          {siteContent.links.github ? (
            <Button asChild variant="secondary" aria-label="GitHub, opens in new tab">
              <a
                href={siteContent.links.github}
                data-analytics-id="contact-github"
                rel="noopener noreferrer"
                onClick={(event) =>
                  trackGithubNavigation(siteContent.links.github!, "contact", event)
                }
              >
                <Github className="h-4 w-4" />
                GitHub
              </a>
            </Button>
          ) : null}
          {siteContent.links.linkedin ? (
            <Button asChild variant="secondary" aria-label="LinkedIn, opens in new tab">
              <a
                href={siteContent.links.linkedin}
                data-analytics-id="contact-linkedin"
                rel="noopener noreferrer"
                onClick={(event) => trackOutbound("linkedin", siteContent.links.linkedin!, event)}
              >
                <Linkedin className="h-4 w-4" />
                LinkedIn
              </a>
            </Button>
          ) : null}
          <Button asChild>
            <a
              href={SCHEDULE_LINK}
              target="_blank"
              rel="noopener noreferrer"
              data-analytics-id="contact-schedule"
              onClick={(event) => trackOutbound("calendly", SCHEDULE_LINK, event)}
            >
              <CalendarDays className="h-4 w-4" />
              Schedule a conversation
            </a>
          </Button>
        </div>
      </div>
    </Section>
  );
}
