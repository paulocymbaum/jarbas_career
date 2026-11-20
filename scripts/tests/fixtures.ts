// Synthetic CV documents and site content with hand-computed expected scores.
// Keyword rows referenced here: Python 95, RAG 88, LangChain 78, PostgreSQL 68,
// FastAPI 70, Docker 78, CI/CD 52 (AI Engineer column; dataset sum = 1842).

import type { ProfileCvDocument, SiteContent } from "../../src/content/types.js";

const NO_MATCH_TEXT = "Lorem ipsum dolor sit amet, consectetur adipiscing elit.";

export function makeDoc(overrides: Partial<ProfileCvDocument>): ProfileCvDocument {
  return {
    slug: "fixture",
    title: "Engineer",
    headline: NO_MATCH_TEXT,
    targetRole: "Engineer",
    summary: NO_MATCH_TEXT,
    keywords: [],
    skills: [],
    experience: [],
    projects: [],
    education: [],
    certifications: [],
    pdfPath: "/resumes/fixture.pdf",
    locale: "en",
    contentVersion: 1,
    ...overrides,
  };
}

/** Every dataset keyword present in the headline (placement weight 3) → perfect score. */
export const richHeadlineDoc: ProfileCvDocument = makeDoc({
  slug: "rich-fixture",
  headline:
    "Python SQL JavaScript TypeScript Bash Java C++ RAG PyTorch LangChain OpenAI MLOps " +
    "LlamaIndex Prompt Engineering Fine-Tuning Hugging Face CUDA PostgreSQL Pinecone Redis " +
    "MongoDB Docker CI/CD AWS Kubernetes Terraform PyTest Postman Selenium Playwright PLC " +
    "UiPath Git GraphQL FastAPI System Design Microservices React " +
    "Node.js Tailwind HTML & CSS State Management UI/UX Accessibility Web Performance " +
    "Agile Scrum Kanban Mentoring Onboarding OAuth Security",
});

/** No dataset keyword anywhere → zero score. */
export const sparseDoc: ProfileCvDocument = makeDoc({ slug: "sparse-fixture" });

/**
 * Mixed placement fixture (AI Engineer column):
 *   Python 95 ×3 (headline), RAG 88 ×2 (summary), PostgreSQL 68 ×2 (keywords),
 *   FastAPI 70 ×2 (skills), LangChain 78 ×1 (experience), Docker 78 ×1 + CI/CD 52 ×1 (projects).
 * Weighted score ≈ 945 / 6019 × 100 = 15.7 (dataset expanded 2026-11)
 * Coverage       ≈ 26.4
 * Must-have      = 51.1 (unchanged — new rows are below the 70 threshold for AI Engineer)
 */
export const midDoc: ProfileCvDocument = makeDoc({
  slug: "mid-fixture",
  headline: "Python",
  summary: "RAG pipelines",
  keywords: ["PostgreSQL"],
  skills: [{ name: "Backend", items: ["FastAPI"] }],
  experience: [
    {
      role: "Developer",
      company: "YourCompany",
      start: "2024-01",
      end: null,
      highlights: ["LangChain pipelines"],
      tech: [],
    },
  ],
  projects: [
    { title: "Infra", slug: "infra", description: "Docker CI/CD", tech: [] },
  ],
});

export function makeSite(overrides: Partial<SiteContent>): SiteContent {
  return {
    name: "Fixture Person",
    title: "Engineer",
    pitch: NO_MATCH_TEXT,
    aboutParagraphs: [],
    professionalProfiles: [],
    email: "fixture@example.com",
    city: "Your City",
    country: "Brazil",
    links: {},
    experience: [],
    education: [],
    projects: [],
    skills: [],
    certifications: [],
    articles: [],
    ...overrides,
  };
}

/** Static head mirroring the original index.html (no OG/Twitter/JSON-LD). */
export const minimalHeadHtml = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="I ship web apps end to end: React and Flutter on the client, APIs and data behind them, and LLM systems when the product needs them." />
    <title>Your Name — Full-stack · AI · Product</title>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>`;

/** Fully equipped head: OG, Twitter card, JSON-LD Person. */
export const enhancedHeadHtml = minimalHeadHtml
  .replace(
    '    <title>',
    `    <meta property="og:title" content="Fixture Person" />\n` +
      `    <meta property="og:description" content="Fixture description text for open graph." />\n` +
      `    <meta property="og:type" content="website" />\n` +
      `    <meta property="og:image" content="/images/fixture.webp" />\n` +
      `    <meta name="twitter:card" content="summary" />\n` +
      `    <script type="application/ld+json">{"@type":"Person","name":"Fixture Person"}</script>\n` +
      `    <title>`,
  );
