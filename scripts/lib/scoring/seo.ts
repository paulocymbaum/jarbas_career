// Deterministic SEO scoring for the portfolio site: static <head> hygiene of index.html
// plus keyword coverage of the generated site copy against the market distribution.

import type { SiteContent } from "../../../src/content/types.js";
import {
  getPrevalence,
  MARKET_KEYWORDS,
  PROFILE_ROLE_TARGETS,
  type MarketRoleKey,
} from "./market-insights.js";
import { matchAliases } from "./keyword-match.js";

export type SeoCheck = {
  id: string;
  label: string;
  earned: number;
  max: number;
};

export type SeoReport = {
  /** Total SEO score, 0–100 (1 decimal). */
  score: number;
  staticScore: number;
  contentScore: number;
  checks: SeoCheck[];
};

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

type MetaTag = Record<string, string>;

function parseMetaTags(html: string): MetaTag[] {
  const tags: MetaTag[] = [];
  const tagPattern = /<meta\b[^>]*>/gi;
  const attrPattern = /([a-zA-Z:-]+)\s*=\s*"([^"]*)"|([a-zA-Z:-]+)\s*=\s*'([^']*)'/g;

  for (const match of html.matchAll(tagPattern)) {
    const attrs: MetaTag = {};
    for (const attr of match[0].matchAll(attrPattern)) {
      const key = (attr[1] ?? attr[3] ?? "").toLowerCase();
      const value = attr[2] ?? attr[4] ?? "";
      if (key) attrs[key] = value;
    }
    tags.push(attrs);
  }

  return tags;
}

function findMeta(tags: MetaTag[], key: string, value: string): MetaTag | undefined {
  return tags.find((tag) => (tag[key] ?? "").toLowerCase() === value.toLowerCase());
}

/** Raw (unrounded) prevalence-weighted presence ratio of a role's keywords in text. */
export function rawRoleCoverage(text: string, role: MarketRoleKey): number {
  let present = 0;
  let total = 0;

  for (const row of MARKET_KEYWORDS) {
    const prevalence = getPrevalence(row, role);
    total += prevalence;
    if (matchAliases(text, row.aliases).length > 0) {
      present += prevalence;
    }
  }

  return total === 0 ? 0 : present / total;
}

/** Score the static <head> portion of index.html. Max 45 points. */
export function scoreStaticHead(indexHtml: string): SeoCheck[] {
  const checks: SeoCheck[] = [];
  const metaTags = parseMetaTags(indexHtml);

  const titleMatch = /<title>([^<]*)<\/title>/i.exec(indexHtml);
  const title = titleMatch?.[1]?.trim() ?? "";
  const titleLength = title.length;
  checks.push({
    id: "title-present",
    label: "Title tag present",
    earned: titleLength > 0 ? 5 : 0,
    max: 5,
  });
  checks.push({
    id: "title-length",
    label: "Title length within 30–60 characters",
    earned: titleLength >= 30 && titleLength <= 60 ? 5 : titleLength > 0 ? 2 : 0,
    max: 5,
  });

  const description = findMeta(metaTags, "name", "description")?.content ?? "";
  const descriptionLength = description.trim().length;
  checks.push({
    id: "description-present",
    label: "Meta description present",
    earned: descriptionLength > 0 ? 5 : 0,
    max: 5,
  });
  checks.push({
    id: "description-length",
    label: "Meta description within 70–160 characters",
    earned:
      descriptionLength >= 70 && descriptionLength <= 160
        ? 5
        : descriptionLength > 0
          ? 2
          : 0,
    max: 5,
  });

  for (const property of ["og:title", "og:description", "og:type", "og:image"]) {
    const present = findMeta(metaTags, "property", property) !== undefined;
    checks.push({
      id: `og-${property}`,
      label: `Open Graph ${property}`,
      earned: present ? 2 : 0,
      max: 2,
    });
  }

  const twitterCard =
    findMeta(metaTags, "name", "twitter:card") !== undefined ||
    findMeta(metaTags, "property", "twitter:card") !== undefined;
  checks.push({
    id: "twitter-card",
    label: "Twitter card meta",
    earned: twitterCard ? 3 : 0,
    max: 3,
  });

  const jsonLdPattern =
    /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/i;
  const jsonLd = jsonLdPattern.exec(indexHtml);
  const hasPersonSchema = jsonLd !== null && /"@type"\s*:\s*"Person"/i.test(jsonLd[1]);
  checks.push({
    id: "jsonld-person",
    label: "JSON-LD Person structured data",
    earned: hasPersonSchema ? 6 : 0,
    max: 6,
  });

  const langMatch = /<html\b[^>]*\slang=["']([a-zA-Z-]+)["']/i.exec(indexHtml);
  checks.push({
    id: "html-lang",
    label: "html[lang] attribute",
    earned: langMatch ? 3 : 0,
    max: 3,
  });

  checks.push({
    id: "viewport",
    label: "Viewport meta",
    earned: findMeta(metaTags, "name", "viewport") !== undefined ? 3 : 0,
    max: 3,
  });

  checks.push({
    id: "favicon",
    label: "Favicon link",
    earned: /<link\b[^>]*rel=["'][^"']*icon[^"']*["']/i.test(indexHtml) ? 2 : 0,
    max: 2,
  });

  return checks;
}

/** Score the keyword coverage of the generated site copy. Max 55 points. */
export function scoreSiteCopy(site: SiteContent): SeoCheck[] {
  const checks: SeoCheck[] = [];

  for (const profile of site.professionalProfiles) {
    const role: MarketRoleKey = PROFILE_ROLE_TARGETS[profile.slug] ?? "overallAverage";
    const text = [
      profile.summary ?? "",
      profile.description ?? "",
      ...profile.stack,
      ...profile.skills,
    ].join(" ");
    checks.push({
      id: `profile-${profile.slug}`,
      label: `Profile copy coverage: ${profile.slug}`,
      earned: round1(rawRoleCoverage(text, role) * 10),
      max: 10,
    });
  }

  const storyText = [site.pitch, ...site.aboutParagraphs].join(" ");
  checks.push({
    id: "story-coverage",
    label: "Pitch + about coverage (overall average distribution)",
    earned: round1(rawRoleCoverage(storyText, "overallAverage") * 15),
    max: 15,
  });

  const experienceText = site.experience
    .flatMap((item) => [item.role, item.company, item.summary ?? "", ...item.highlights, ...item.tech])
    .join(" ");
  checks.push({
    id: "experience-coverage",
    label: "Experience copy coverage (overall average distribution)",
    earned: round1(rawRoleCoverage(experienceText, "overallAverage") * 10),
    max: 10,
  });

  return checks;
}

/** Full deterministic SEO report: static head (45) + site copy (55) = 100. */
export function scoreSiteSeo(input: { indexHtml: string; site: SiteContent }): SeoReport {
  const staticChecks = scoreStaticHead(input.indexHtml);
  const contentChecks = scoreSiteCopy(input.site);

  const staticScore = round1(staticChecks.reduce((sum, check) => sum + check.earned, 0));
  const contentScore = round1(contentChecks.reduce((sum, check) => sum + check.earned, 0));

  return {
    score: round1(staticScore + contentScore),
    staticScore,
    contentScore,
    checks: [...staticChecks, ...contentChecks],
  };
}
