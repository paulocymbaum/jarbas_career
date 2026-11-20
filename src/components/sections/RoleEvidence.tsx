import { useMemo, useState } from "react";
import { ExternalLink } from "lucide-react";
import { siteContent } from "@/content/site";
import type { ProfessionalProfile } from "@/content/types";
import { isDisplayableProject } from "@/lib/projects";
import { formatPeriod } from "@/lib/format";
import { FEI_RANKING } from "@/lib/fei-ranking";
import { trackOutbound } from "@/lib/analytics";
import { useScrollReveal } from "@/hooks/use-anime";
import { BentoCard, StatusPill, TechChip } from "@/components/bento";
import { Button } from "@/components/ui/button";

/** Skills shown before the "+N more" toggle — keeps the evidence card small. */
const SKILLS_PREVIEW = 12;

/**
 * Role evidence — authority cards shown under the selected resume variant.
 * Grounded in real site data (experience + projects) and always includes
 * the Automation & Control Engineering foundation (Your University) on every role.
 *
 * Relevance = overlap between each item's tech and the selected profile's
 * own stack + skills, so each role surfaces genuinely different proof.
 */

export function RoleEvidence({ profile }: { profile: ProfessionalProfile }) {
  const revealRef = useScrollReveal<HTMLDivElement>();
  const [showAllSkills, setShowAllSkills] = useState(false);

  const evidence = useMemo(() => {
    // Role-specific relevance: overlap between each item's tech and the
    // selected profile's own stack + skills (case-insensitive).
    const stackTokens = new Set(
      [...profile.stack, ...profile.skills].map((item) => item.toLowerCase()),
    );
    const scoreTech = (tech: string[]) =>
      tech.reduce(
        (score, item) => score + (stackTokens.has(item.toLowerCase()) ? 1 : 0),
        0,
      );

    const jobs = siteContent.experience
      .map((job, index) => ({ job, index, score: scoreTech(job.tech) }))
      .sort((a, b) => b.score - a.score || a.index - b.index)
      .filter((entry) => entry.score > 0)
      // One entry per company — the strongest role per employer.
      .filter(
        (entry, _index, list) =>
          list.findIndex((other) => other.job.company === entry.job.company) ===
          _index,
      )
      .slice(0, 3)
      .map((entry) => entry.job);

    // Fallback: most recent roles if tech-overlap scoring comes up empty.
    const proofJobs = jobs.length ? jobs : siteContent.experience.slice(0, 3);

    const projects = siteContent.projects
      .filter(isDisplayableProject)
      .map((project, index) => ({
        project,
        index,
        score: scoreTech(project.tech) * 2 + (project.featured ? 1 : 0),
      }))
      .sort((a, b) => b.score - a.score || a.index - b.index)
      .filter((entry) => entry.score > 0)
      .slice(0, 3)
      .map((entry) => entry.project);

    // Fallback: featured projects if tech-overlap scoring comes up empty.
    const proofProjects = projects.length
      ? projects
      : siteContent.projects
          .filter(isDisplayableProject)
          .sort((a, b) => Number(b.featured) - Number(a.featured))
          .slice(0, 3);

    const foundation = siteContent.education.find((item) =>
      /your-university|automation|control/i.test(`${item.institution} ${item.degree}`),
    );

    // Engineering credentials earned during the degree (period overlap) —
    // e.g. the university automation lab tutorship and the engineering
    // internship. Grounds the foundation card in concrete proof.
    const degreeStart = foundation?.start ?? null;
    const degreeEnd = foundation?.end ?? null;
    // Only engineering-flavored roles qualify (excludes parallel teaching jobs).
    const ENGINEERING_SIGNAL =
      /pid|c\+\+|robot\w*|iot|automation|control|sensor|calibrat\w*|electronic|specwin|vex|panel switch/i;
    const degreeEraJobs =
      degreeStart && degreeEnd
        ? siteContent.experience
            .filter(
              (job) =>
                job.start <= degreeEnd &&
                (job.end === null || job.end >= degreeStart) &&
                ENGINEERING_SIGNAL.test(`${job.role} ${job.tech.join(" ")}`),
            )
            .sort((a, b) => b.start.localeCompare(a.start))
        : [];
    const eraTech = [...new Set(degreeEraJobs.flatMap((job) => job.tech))];

    // All role skills, ordered by evidence: how many matched jobs' tech
    // actually use each skill. Evidenced skills lead the list.
    const skillEvidence = profile.skills
      .map((skill) => ({
        skill,
        score: proofJobs.reduce(
          (acc, job) =>
            acc +
            (job.tech.some((tech) => tech.toLowerCase() === skill.toLowerCase())
              ? 1
              : 0),
          0,
        ),
      }))
      .sort((a, b) => b.score - a.score || a.skill.localeCompare(b.skill));

    // Business domains — derived from the selected profile's own description
    // (role-authored text), so the industries always align with the role.
    // Each row pairs a domain with the employer where it was practiced.
    const description = (profile.description ?? "").toLowerCase();
    const DOMAIN_ROWS: {
      pattern: RegExp;
      domain: string;
      employer: string;
    }[] = [
      {
        pattern: /your-industry|example/,
        domain: "Business Domain",
        employer: "Your Company",
      },
      {
        pattern: /your-industry|example/,
        domain: "Business Domain",
        employer: "Your Company",
      },
    ];
    const domainRows = DOMAIN_ROWS.filter(({ pattern }) => pattern.test(description))
      // Current banking work leads when present.
      .sort((a, b) =>
        a.domain.startsWith("Banking") ? -1 : b.domain.startsWith("Banking") ? 1 : 0,
      );
    const hasBanking = domainRows.some((row) =>
      row.domain.startsWith("Banking"),
    );

    return {
      proofJobs,
      proofProjects,
      foundation,
      degreeEraJobs,
      eraTech,
      domainRows,
      hasBanking,
      skillEvidence,
    };
  }, [profile.description, profile.skills, profile.stack]);

  const foundationPeriod = evidence.foundation?.start
    ? `${evidence.foundation.start.slice(0, 4)} — ${evidence.foundation.end?.slice(0, 4) ?? "present"}`
    : null;

  return (
    <div ref={revealRef} data-analytics-id={`role-evidence-${profile.slug}`} className="mt-6">
      <p className="label-caps">
        ROLE EVIDENCE · {profile.title} · SOURCED FROM WORK & SHIPPING
      </p>
      <div className="mt-4 grid items-start gap-4 md:grid-cols-2">
        {/* Professional proof — matched experience entries */}
        <BentoCard
          breadcrumb={`EXPERIENCE · ${evidence.proofJobs.length} MATCHES`}
          pills={<StatusPill variant="primary">Proof</StatusPill>}
          title="Professional track record"
          padding="compact"
          className="min-w-0"
        >
          <ul className="space-y-3">
            {evidence.proofJobs.map((job) => (
              <li
                key={`${job.company}-${job.role}`}
                className="border-b border-border/40 pb-3 last:border-0 last:pb-0"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-x-2">
                  <p className="font-mono text-[12px] font-medium text-foreground">
                    {job.company}
                  </p>
                  <time
                    dateTime={`${job.start}/${job.end ?? "present"}`}
                    className="font-mono text-[10px] text-muted-foreground"
                  >
                    {formatPeriod(job.start, job.end)}
                  </time>
                </div>
                <p className="mt-0.5 text-sm font-semibold leading-snug">{job.role}</p>
                <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                  {job.highlights[0]}
                </p>
              </li>
            ))}
          </ul>
        </BentoCard>

        {/* Flagship projects — matched builds */}
        <BentoCard
          breadcrumb="OPEN SOURCE & PRODUCTION"
          pills={<StatusPill variant="open">Matched builds</StatusPill>}
          title="Flagship projects"
          padding="compact"
          className="min-w-0"
        >
          <ul className="space-y-3">
            {evidence.proofProjects.map((project) => (
              <li
                key={project.slug}
                className="border-b border-border/40 pb-3 last:border-0 last:pb-0"
              >
                <p className="truncate font-mono text-[10px] text-muted-foreground/80">
                  {project.slug}
                </p>
                <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
                  <p className="text-sm font-semibold leading-snug">{project.title}</p>
                  {project.featured ? (
                    <StatusPill variant="flagship">Featured</StatusPill>
                  ) : null}
                </div>
                <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                  {project.description}
                </p>
              </li>
            ))}
          </ul>
        </BentoCard>

        {/* Skills & domains — industry context + the role's full skill matrix */}
        <BentoCard
          breadcrumb="BUSINESS DOMAINS · SKILL MATRIX"
          pills={
            <StatusPill variant="neutral">
              {String(evidence.domainRows.length).padStart(2, "0")} domains ·{" "}
              {String(profile.skills.length).padStart(2, "0")} skills
            </StatusPill>
          }
          title="Skills & domains"
          padding="compact"
          className="min-w-0"
        >
          {evidence.hasBanking ? (
            <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-2.5">
              <StatusPill variant="flagship">Business domain · current</StatusPill>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                Core delivery at{" "}
                <span className="font-medium text-foreground">Your Company</span> —{" "}
                <span className="font-medium text-foreground">your project</span>.
              </p>
            </div>
          ) : null}

          <div className="mt-3">
            <p className="label-caps">INDUSTRY CONTEXT</p>
            <ul className="mt-2 space-y-2.5">
              {evidence.domainRows.map((row) => (
                <li
                  key={row.domain}
                  className="border-b border-border/40 pb-2.5 last:border-0 last:pb-0"
                >
                  <p className="text-sm font-semibold leading-snug">{row.domain}</p>
                  <p className="mt-0.5 font-mono text-[11px] text-muted-foreground">
                    {row.employer}
                  </p>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-3">
            <p className="label-caps">CORE STACK</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {profile.stack.map((item) => (
                <TechChip key={item} tone="core">
                  {item}
                </TechChip>
              ))}
            </div>
          </div>

          <div className="mt-3">
            <p className="label-caps">ALL SKILLS · EVIDENCE-ORDERED</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {(showAllSkills
                ? evidence.skillEvidence
                : evidence.skillEvidence.slice(0, SKILLS_PREVIEW)
              ).map(({ skill, score }) => (
                <TechChip key={skill} tone={score > 0 ? "ai" : "default"}>
                  {skill}
                </TechChip>
              ))}
            </div>
            {evidence.skillEvidence.length > SKILLS_PREVIEW ? (
              <Button
                type="button"
                variant="link"
                size="sm"
                className="mt-1 h-auto px-0 text-xs"
                onClick={() => setShowAllSkills((open) => !open)}
              >
                {showAllSkills
                  ? "Show less"
                  : `Show all ${evidence.skillEvidence.length} skills`}
              </Button>
            ) : null}
            <p className="mt-1 text-[10px] leading-relaxed text-muted-foreground">
              Cyan chips are exercised directly in the matched roles & builds above.
            </p>
          </div>
        </BentoCard>

        {/* Shared foundation — Automation & Control Engineering (Your University), on every role */}
        <BentoCard
          breadcrumb={`FOUNDATIONS · YOUR${foundationPeriod ? ` · ${foundationPeriod}` : ""}`}
          pills={
            <StatusPill variant="flagship" beacon>
              All roles
            </StatusPill>
          }
          title="Automation & Control Engineering"
          padding="compact"
          className="min-w-0"
        >
          <p className="font-mono text-[12px] font-medium text-foreground">
            B.E. — {evidence.foundation?.institution ?? "Your University"}
            {evidence.foundation?.location ? (
              <span className="font-normal text-muted-foreground">
                {" "}
                · {evidence.foundation.location}
              </span>
            ) : null}
          </p>

          {/* RUF / Folha 2025 ranking credential. */}
          <a
            href={FEI_RANKING.url}
            target="_blank"
            rel="noopener noreferrer"
            data-analytics-id="fei-ranking"
            onClick={(event) => trackOutbound("fei-ranking", FEI_RANKING.url, event)}
            className="mt-2 block rounded-lg border border-primary/30 bg-primary/5 p-2.5 transition-colors hover:border-primary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <div className="flex items-center gap-2">
              <StatusPill variant="primary">Ranked · #1</StatusPill>
              <ExternalLink
                className="ml-auto h-3.5 w-3.5 shrink-0 text-muted-foreground"
                aria-hidden="true"
              />
            </div>
            <p className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground">
              <span className="font-medium text-foreground">#1 in ranked scope</span> and{" "}
              <span className="font-medium text-foreground">#6 among evaluated programs</span>{" "}
              in {FEI_RANKING.course}.
            </p>
          </a>
          {evidence.foundation?.summary ? (
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              {evidence.foundation.summary}
            </p>
          ) : null}

          {evidence.degreeEraJobs.length ? (
            <div className="mt-3">
              <p className="label-caps">CREDENTIALS DURING THE DEGREE</p>
              <ul className="mt-2 space-y-2.5">
                {evidence.degreeEraJobs.map((job) => (
                  <li
                    key={`${job.company}-${job.role}`}
                    className="border-b border-border/40 pb-2.5 last:border-0 last:pb-0"
                  >
                    <div className="flex flex-wrap items-baseline justify-between gap-x-2">
                      <p className="font-mono text-[11px] font-medium text-foreground">
                        {job.company}
                      </p>
                      <time
                        dateTime={`${job.start}/${job.end ?? "present"}`}
                        className="font-mono text-[10px] text-muted-foreground"
                      >
                        {formatPeriod(job.start, job.end)}
                      </time>
                    </div>
                    <p className="mt-0.5 text-xs font-semibold leading-snug">{job.role}</p>
                    <p className="mt-0.5 line-clamp-2 text-[11px] leading-relaxed text-muted-foreground">
                      {job.summary}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {evidence.eraTech.length ? (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {evidence.eraTech.map((tech) => (
                <TechChip key={tech}>{tech}</TechChip>
              ))}
            </div>
          ) : null}

          <p className="mt-3 border-t border-border/40 pt-3 text-xs leading-relaxed text-muted-foreground">
            Deterministic control-loop rigor carried into every{" "}
            <span className="font-medium text-foreground">{profile.title}</span>{" "}
            engagement.
          </p>
        </BentoCard>
      </div>
    </div>
  );
}