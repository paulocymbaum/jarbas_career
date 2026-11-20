import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { applicationDirName, sanitizeDirName } from "../jd/lib/paths.js";
import { parseCvMarkdown } from "../jd/lib/markdown.js";
import { htmlToText } from "../jd/lib/html-text.js";
import { parseJd } from "../jd/lib/jd-parse.js";
import { extractKeywords } from "../jd/lib/keywords.js";
import { buildGateJson, headlineTerms, mergeJdKeywords, type GateJson } from "../jd/lib/gate.js";
import { scoreCvAgainstGate } from "../jd/lib/score.js";
import type { QualitativeJson } from "../jd/lib/qualitative.js";
import { cvMarkdownToHtml } from "../jd/lib/pdf.js";
import { firstHeadingTitle, renderQaPageHtml } from "../jd/lib/page-html.js";
import type { JdJson } from "../jd/lib/types.js";

const JD_TEXT = `Senior AI Engineer
Acme Corp — Remote

About the role
You will lead LLM features end to end.

Responsibilities
- Build RAG pipelines and AI agents in production
- Own REST APIs in Python

Requirements
- 5+ years of Python
- Experience with LangChain and Docker
- SQL and PostgreSQL data modeling

Nice to have
- Kubernetes experience
`;

function fixtureJd(): JdJson {
  const parsed = parseJd(JD_TEXT, { company: "Acme Corp" });
  return {
    version: 1,
    source: { type: "file", value: "fixture.txt" },
    role: parsed.role,
    company: parsed.company,
    location: parsed.location,
    dir: "Senior AI Engineer - Acme Corp",
    summary: "",
    requirements: parsed.sections.requirements,
    responsibilities: parsed.sections.responsibilities,
    niceToHave: parsed.sections.niceToHave,
    keywords: extractKeywords(parsed),
    extraKeywords: [],
  };
}

const PARTIAL_CV = `# Your Name
Alpha engineer

## Summary
alpha work

## Skills
gamma tool

## Experience
nothing notable

## Projects
delta project

## Education & Certifications
BSc
`;

const COMPLETE_CV = `# Your Name
Alpha | Beta engineer

## Summary
alpha and beta

## Skills
gamma

## Experience
alpha delivery

## Projects
delta

## Education & Certifications
BSc
`;

function fixtureGate(overrides?: Partial<GateJson["thresholds"]>): GateJson {
  const gate = buildGateJson({
    ...fixtureJd(),
    role: "Alpha",
    keywords: [],
    extraKeywords: [
      { term: "Alpha", weight: 3, aliases: ["alpha"] },
      { term: "Beta", weight: 3, aliases: ["beta"] },
      { term: "Gamma", weight: 2, aliases: ["gamma"] },
      { term: "Delta", weight: 1, aliases: ["delta"] },
    ],
  });
  return { ...gate, thresholds: { ...gate.thresholds, ...overrides } };
}

function qualitativeFixture(score: number): QualitativeJson {
  return {
    version: 1,
    reviewer: "tech-recruitment-manager",
    criteria: [
      { id: "truth-lock", score, evidence: "every claim traces to the fixture sources" },
      { id: "six-second-scan", score, evidence: "headline and summary yield role, level, stack, fit" },
      { id: "screen-out-check", score, evidence: "the JD musts are answered plainly" },
      { id: "jd-language", score, evidence: "uses the JD nouns for each concept" },
      { id: "star-bullets", score, evidence: "bullets carry action and measurable result" },
      { id: "seniority-signals", score, evidence: "scope and ownership match the claimed level" },
      { id: "red-flags", score, evidence: "no buzzword soup or template smell" },
      { id: "ats-format", score, evidence: "standard headings, single column, headline line" },
    ],
  };
}

describe("JD tailoring — paths", () => {
  it("sanitizes folder names", () => {
    assert.equal(sanitizeDirName("Senior AI Engineer — Acme Corp"), "Senior AI Engineer - Acme Corp");
    assert.equal(sanitizeDirName("Full-stack Dev at A/B Corp?"), "Full-stack Dev at A-B Corp");
    assert.equal(applicationDirName("AI Engineer", "Acme Corp"), "AI Engineer - Acme Corp");
  });
});

describe("JD tailoring — html-to-text", () => {
  it("strips chrome, scripts, and decodes entities", () => {
    const html =
      "<html><head><style>.x{color:red}</style></head><body><nav>Menu</nav>" +
      "<h1>AI Engineer</h1><script>evil()</script>" +
      "<p>Build&nbsp;RAG pipelines &amp; agents.</p><ul><li>Docker</li></ul></body></html>";
    const text = htmlToText(html);
    assert.equal(text, "AI Engineer\nBuild RAG pipelines & agents.\nDocker");
  });
});

describe("JD tailoring — parse", () => {
  it("detects role and buckets sections", () => {
    const parsed = parseJd(JD_TEXT, { company: "Acme Corp" });
    assert.equal(parsed.role, "Senior AI Engineer");
    assert.equal(parsed.company, "Acme Corp");
    assert.equal(parsed.sections.requirements.length, 3);
    assert.equal(parsed.sections.responsibilities.length, 3);
    assert.equal(parsed.sections.niceToHave.length, 1);
  });

  it("weights keywords: requirements 3, responsibilities 2", () => {
    const keywords = extractKeywords(parseJd(JD_TEXT, { company: "Acme Corp" }));
    const byTerm = new Map(keywords.map((keyword) => [keyword.term, keyword]));
    assert.equal(byTerm.get("Python")?.weight, 3);
    assert.equal(byTerm.get("LangChain / LangGraph")?.weight, 3);
    assert.equal(byTerm.get("PostgreSQL (PGVector)")?.weight, 3);
    assert.equal(byTerm.get("RAG (Retrieval-Augmented Gen)")?.weight, 2);
    assert.equal(byTerm.get("RESTful API / GraphQL")?.weight, 2);
    assert.equal(byTerm.get("Kubernetes (K8s)")?.weight, 2);
    assert.equal(byTerm.get("React / Next.js"), undefined);
  });
});

describe("JD tailoring — markdown segments", () => {
  it("maps headings to placement segments", () => {
    const parsed = parseCvMarkdown(PARTIAL_CV);
    assert.equal(parsed.title, "Your Name");
    assert.deepEqual(
      parsed.segments.map((segment) => segment.id),
      ["headline", "summary", "skills", "experience", "projects", "credentials"],
    );
    const headline = parsed.segments.find((segment) => segment.id === "headline");
    assert.ok(headline?.text.includes("Alpha engineer"));
    assert.ok(parsed.headings.includes("Education & Certifications"));
  });
});

describe("JD tailoring — gate", () => {
  it("derives headline terms from the role title", () => {
    assert.deepEqual(headlineTerms("Senior AI Engineer"), ["senior", "ai", "engineer"]);
  });

  it("merges curated extras without overriding dataset keywords", () => {
    const merged = mergeJdKeywords({
      ...fixtureJd(),
      keywords: [{ term: "Python", weight: 3, aliases: ["python"], origin: "must-have" }],
      extraKeywords: [
        { term: "python", weight: 1 },
        { term: "Payments", weight: 2, aliases: ["payment", "fintech"] },
      ],
    });
    const byTerm = new Map(merged.map((keyword) => [keyword.term, keyword]));
    assert.equal(merged.length, 2);
    assert.equal(byTerm.get("Python")?.weight, 3);
    assert.deepEqual(byTerm.get("Payments")?.aliases, ["payment", "fintech"]);
  });

  it("excludes honest gaps from the gate", () => {
    const gate = buildGateJson({
      ...fixtureJd(),
      role: "Alpha",
      keywords: [],
      extraKeywords: [
        { term: "Alpha", weight: 3, aliases: ["alpha"] },
        { term: "Gamma", weight: 2, aliases: ["gamma"] },
      ],
      gaps: [{ term: "Gamma", reason: "not in profile" }],
    });
    assert.deepEqual(gate.keywords.map((keyword) => keyword.term), ["Alpha"]);
  });
});

describe("JD tailoring — gate scoring", () => {
  it("hand-computes placement score, presence, and must-have coverage", () => {
    // Placement: Alpha 3×3 + Gamma 2×2 + Delta 1×1 = 14 / (3 × 9) → 51.9
    // Presence: Alpha+Gamma+Delta weights 3+2+1 of 9 → 66.7
    // Must-haves Alpha+Beta: only Alpha present → 3/6 → 50%
    const result = scoreCvAgainstGate(PARTIAL_CV, fixtureGate());
    assert.equal(result.score, 51.9);
    assert.equal(result.presenceScore, 66.7);
    assert.equal(result.mustHaveCoverage, 50);
    assert.equal(result.headlineRoleMatch, true);
    assert.equal(result.verdict, "FAIL");
    assert.ok(result.failures.some((failure) => failure.includes("Weighted presence")));
    assert.ok(result.failures.some((failure) => failure.includes("Must-have coverage")));
    assert.ok(result.improvements.some((improvement) => improvement.includes('"Beta"')));
  });

  it("passes a complete CV with optimal placements", () => {
    // Placement: Alpha 3×3 + Beta 3×3 + Gamma 2×2 + Delta 1×1 = 23 / 27 → 85.2
    // Presence: all keywords present → 100
    const result = scoreCvAgainstGate(COMPLETE_CV, fixtureGate(), qualitativeFixture(100));
    assert.equal(result.score, 85.2);
    assert.equal(result.presenceScore, 100);
    assert.equal(result.mustHaveCoverage, 100);
    // Overall: 0.7 × 85.2 + 0.3 × 100 = 89.64 → 89.6
    assert.equal(result.overallScore, 89.6);
    assert.equal(result.qualitative.status, "complete");
    assert.equal(result.qualitative.composite, 100);
    assert.equal(result.verdict, "PASS");
    assert.equal(result.improvements.length, 0);
  });

  it("withholds the overall nota while the qualitative layer is pending", () => {
    const result = scoreCvAgainstGate(COMPLETE_CV, fixtureGate());
    assert.equal(result.overallScore, null);
    assert.equal(result.qualitative.status, "pending");
    assert.equal(result.verdict, "PASS"); // quantitative gates only
    assert.ok(result.improvements.some((improvement) => improvement.includes("Qualitative review pending")));
  });

  it("fails headline role match below the ratio threshold", () => {
    const gate = fixtureGate();
    const result = scoreCvAgainstGate(
      PARTIAL_CV.replace("Alpha engineer", "Engineer"),
      { ...gate, thresholds: { ...gate.thresholds, presenceScore: 0, mustHaveCoverage: 0 } },
    );
    assert.equal(result.headlineRoleMatch, false);
    assert.ok(result.failures.some((failure) => failure.startsWith("Headline echoes")));
  });

  it("enforces the word limit", () => {
    const result = scoreCvAgainstGate(COMPLETE_CV, fixtureGate({ maxWords: 5 }));
    assert.equal(result.withinWordLimit, false);
    assert.equal(result.verdict, "FAIL");
    assert.ok(result.failures.some((failure) => failure.includes("words > 5 limit")));
  });
});

describe("JD tailoring — cv pdf html", () => {
  it("renders the constrained CV markdown subset safely", () => {
    const html = cvMarkdownToHtml(
      "# Name\nAI Engineer\n\n## Skills\n**Core:** alpha\n- bullet one\n- bullet two\n\nText with <tag> & \"quotes\".",
    );
    assert.ok(html.includes("<h1>Name</h1>"));
    assert.ok(html.includes("<h2>Skills</h2>"));
    assert.ok(html.includes("<p><strong>Core:</strong> alpha</p>"));
    assert.ok(html.includes("<li>bullet one</li>"));
    assert.ok(html.includes("<li>bullet two</li>"));
    assert.ok(html.includes("&lt;tag&gt; &amp; &quot;quotes&quot;."));
  });
});

describe("JD tailoring — qa page html", () => {
  it("renders a titled static page with escaped body", () => {
    const md = "# Profile Q&A\n\n**Yes** — text with <b>tags</b> & ampersands.";
    const html = renderQaPageHtml(md, "My Title");
    assert.ok(html.includes("<title>My Title</title>"));
    assert.ok(html.includes("<h1>Profile Q&amp;A</h1>"));
    assert.ok(
      html.includes("<p><strong>Yes</strong> — text with &lt;b&gt;tags&lt;/b&gt; &amp; ampersands.</p>"),
    );
    assert.equal(firstHeadingTitle("no heading here", "Fallback"), "Fallback");
  });
});


