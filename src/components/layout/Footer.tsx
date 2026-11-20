import { Briefcase, Github, Linkedin, Mail } from "lucide-react";
import { siteContent } from "@/content/site";
import { trackGithubNavigation, trackOutbound } from "@/lib/analytics";
import { isLocalAdminEnabled } from "@/lib/is-local-admin-enabled";
import { isLocalRecruitmentEnabled } from "@/lib/is-local-recruitment-enabled";
import { pageShellClass } from "@/lib/panel";
import { cn } from "@/lib/utils";

export function Footer() {
  return (
    <footer className="border-t border-border/60 py-8">
      <div
        className={cn(
          pageShellClass,
          "flex flex-col gap-4 font-mono text-xs text-muted-foreground sm:flex-row sm:flex-wrap sm:items-center sm:justify-between",
        )}
      >
        <p className="flex items-center gap-2">
          <span className="status-dot" aria-hidden="true" />
          <span className="font-semibold text-foreground">&copy; {new Date().getFullYear()} {siteContent.name}</span>
        </p>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <a
            href={`mailto:${siteContent.email}`}
            className="inline-flex items-center gap-1.5 transition-colors hover:text-primary"
            data-analytics-id="footer-email"
            onClick={(event) => trackOutbound("email", `mailto:${siteContent.email}`, event)}
          >
            <Mail className="h-3.5 w-3.5" aria-hidden="true" />
            Email
          </a>
          {siteContent.links.github ? (
            <a
              href={siteContent.links.github}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 transition-colors hover:text-primary"
              data-analytics-id="footer-github"
              onClick={(event) =>
                trackGithubNavigation(siteContent.links.github!, "footer", event)
              }
            >
              <Github className="h-3.5 w-3.5" aria-hidden="true" />
              GitHub
            </a>
          ) : null}
          {siteContent.links.linkedin ? (
            <a
              href={siteContent.links.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 transition-colors hover:text-primary"
              data-analytics-id="footer-linkedin"
              onClick={(event) => trackOutbound("linkedin", siteContent.links.linkedin!, event)}
            >
              <Linkedin className="h-3.5 w-3.5" aria-hidden="true" />
              LinkedIn
            </a>
          ) : null}
          <a
            href="/freelance"
            className="inline-flex items-center gap-1.5 transition-colors hover:text-primary"
            data-analytics-id="footer-freelance"
          >
            <Briefcase className="h-3.5 w-3.5" aria-hidden="true" />
            Freelance
          </a>
        </div>
        {siteContent.footerNote ? (
          <p className="uppercase tracking-[0.08em]">{siteContent.footerNote}</p>
        ) : null}
      </div>

      {/* Local-only tools — discreet dev-builds-only strip. */}
      {isLocalRecruitmentEnabled || isLocalAdminEnabled ? (
        <div
          className={cn(
            pageShellClass,
            "mt-4 flex flex-wrap items-center gap-x-5 gap-y-1.5 border-t border-border/40 pt-3",
          )}
        >
          <span className="label-caps !text-[9px]">Local tools</span>
          {isLocalRecruitmentEnabled ? (
            <a
              href="#recruitment"
              className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground/70 transition-colors hover:text-foreground"
            >
              Recruitment
            </a>
          ) : null}
          {isLocalAdminEnabled ? (
            <a
              href="#admin/projects"
              className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground/70 transition-colors hover:text-foreground"
            >
              Admin
            </a>
          ) : null}
        </div>
      ) : null}
    </footer>
  );
}
