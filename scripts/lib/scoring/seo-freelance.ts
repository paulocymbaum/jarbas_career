// Deterministic SEO scoring for the /freelance page (freelance.html).
//
// Deliberately different from the recruiter-facing site audit (seo.ts): a
// freelance services page is scored on static <head> hygiene, freelance
// positioning, and service/skill keyword coverage. The per-profile role
// coverage and pitch/experience blocks from scoreSiteCopy — plus the whole
// ATS pipeline — do NOT apply here and are intentionally absent.

import type { FreelanceContent } from "../../../src/content/types.js";
import { matchAliases } from "./keyword-match.js";
import { scoreStaticHead, type SeoCheck, type SeoReport } from "./seo.js";

export type FreelanceSeoReport = SeoReport;

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

/**
 * Service/skill keywords a freelance client landing on /freelance should find.
 * Flat weights (each row worth the same) — unlike the recruiter market study,
 * there is no prevalence dataset for freelance demand yet.
 */
const FREELANCE_KEYWORDS: { keyword: string; aliases: string[] }[] = [
  { keyword: "Freelance / for hire", aliases: ["freelance", "freelancer", "for hire", "hire"] },
  { keyword: "RAG", aliases: ["rag", "retrieval-augmented"] },
  { keyword: "AI agents", aliases: ["ai agent", "agents", "agentic"] },
  { keyword: "LangChain / LangGraph", aliases: ["langchain", "langgraph"] },
  { keyword: "Prompt engineering", aliases: ["prompt engineering", "prompting"] },
  { keyword: "Chatbots", aliases: ["chatbot", "chatbots"] },
  { keyword: "Semantic search / embeddings", aliases: ["semantic search", "embeddings", "vector"] },
  { keyword: "Evaluations & guardrails", aliases: ["evaluation", "evaluations", "evals", "guardrails"] },
  { keyword: "React", aliases: ["react"] },
  { keyword: "TypeScript / JavaScript", aliases: ["typescript", "javascript"] },
  {
    keyword: "Web apps / dashboards",
    aliases: ["web app", "web apps", "web application", "dashboard", "dashboards", "spa", "spas"],
  },
  { keyword: "Python", aliases: ["python"] },
  { keyword: "FastAPI / REST APIs", aliases: ["fastapi", "rest api", "api"] },
  { keyword: "PostgreSQL / Supabase", aliases: ["postgresql", "postgres", "supabase"] },
  { keyword: "ETL / data pipelines", aliases: ["etl", "data pipeline", "data engineering"] },
  { keyword: "Automation", aliases: ["automation", "automate"] },
  { keyword: "Docker", aliases: ["docker"] },
  { keyword: "CI/CD", aliases: ["ci/cd", "github actions"] },
  { keyword: "Test automation", aliases: ["test automation", "qa automation", "contract tests"] },
  { keyword: "LLM providers", aliases: ["openai", "claude", "gemini", "llm"] },
];

function parseJsonLdBlocks(html: string): string[] {
  const pattern =
    /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  return [...html.matchAll(pattern)].map((match) => match[1] ?? "");
}

/** Freelance positioning + offer schema checks. Max 20 points. */
export function scoreFreelancePositioning(freelanceHtml: string): SeoCheck[] {
  const checks: SeoCheck[] = [];

  const title = /<title>([^<]*)<\/title>/i.exec(freelanceHtml)?.[1]?.trim() ?? "";
  const freelancePattern = /\bfreelance\b|\bfor hire\b|\bfreelancer\b/i;
  checks.push({
    id: "freelance-title-positioning",
    label: "Title positions the page as freelance / for hire",
    earned: freelancePattern.test(title) ? 5 : 0,
    max: 5,
  });

  const metaTags = freelanceHtml.match(/<meta\b[^>]*name=["']description["'][^>]*>/gi) ?? [];
  const description = metaTags
    .map((tag) => /content=["']([^"']*)["']/i.exec(tag)?.[1] ?? "")
    .find((content) => content.length > 0) ?? "";
  checks.push({
    id: "freelance-description-positioning",
    label: "Meta description positions the page as freelance / for hire",
    earned: freelancePattern.test(description) ? 5 : 0,
    max: 5,
  });

  const jsonLd = parseJsonLdBlocks(freelanceHtml).join("\n");
  const hasOfferSchema =
    jsonLd.includes("makesOffer") ||
    jsonLd.includes("ProfessionalService") ||
    /"@type"\s*:\s*"Service"/i.test(jsonLd);
  checks.push({
    id: "freelance-jsonld-offer",
    label: "JSON-LD exposes freelance services (makesOffer / Service schema)",
    earned: hasOfferSchema ? 10 : 0,
    max: 10,
  });

  return checks;
}

/** Keyword coverage of the freelance page copy. Max 35 points. */
export function scoreFreelanceCopy(content: FreelanceContent): SeoCheck[] {
  const text = [
    content.hero.headline,
    content.hero.subheadline,
    ...content.services.flatMap((service) => [
      service.title,
      service.description,
      ...service.deliverables.flatMap((deliverable) =>
        typeof deliverable === "string"
          ? [deliverable]
          : [deliverable.label, ...(deliverable.outcome ? [deliverable.outcome] : [])],
      ),
      ...service.tech,
    ]),
    ...content.skillGroups.flatMap((group) => [group.name, group.blurb, ...group.items]),
    content.engagement.note,
    ...content.engagement.steps.flatMap((step) => [step.title, step.description]),
    content.cta.headline,
    content.cta.subheadline,
  ].join(" ");

  const present = FREELANCE_KEYWORDS.filter((row) => matchAliases(text, row.aliases).length > 0);
  const coverage = FREELANCE_KEYWORDS.length === 0 ? 0 : present.length / FREELANCE_KEYWORDS.length;

  return [
    {
      id: "freelance-services-coverage",
      label: `Freelance service & skill keyword coverage (${present.length}/${FREELANCE_KEYWORDS.length} keywords)`,
      earned: round1(coverage * 35),
      max: 35,
    },
  ];
}

/**
 * Full deterministic SEO report for the /freelance page:
 * static head (45) + freelance positioning (20) + copy coverage (35) = 100.
 */
export function scoreFreelancePageSeo(input: {
  freelanceHtml: string;
  content: FreelanceContent;
}): FreelanceSeoReport {
  const staticChecks = scoreStaticHead(input.freelanceHtml);
  const positioningChecks = scoreFreelancePositioning(input.freelanceHtml);
  const copyChecks = scoreFreelanceCopy(input.content);

  const staticScore = round1(staticChecks.reduce((sum, check) => sum + check.earned, 0));
  const contentScore = round1(
    [...positioningChecks, ...copyChecks].reduce((sum, check) => sum + check.earned, 0),
  );

  return {
    score: round1(staticScore + contentScore),
    staticScore,
    contentScore,
    checks: [...staticChecks, ...positioningChecks, ...copyChecks],
  };
}
