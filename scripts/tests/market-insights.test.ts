import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  getPrevalence,
  MARKET_KEYWORDS,
  PROFILE_ROLE_TARGETS,
  ROLE_LABELS,
} from "../lib/scoring/market-insights.js";

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

describe("market insights dataset", () => {
  it("has 48 rows with unique keywords and non-empty aliases", () => {
    assert.equal(MARKET_KEYWORDS.length, 48);
    const keywords = new Set(MARKET_KEYWORDS.map((row) => row.keyword));
    assert.equal(keywords.size, MARKET_KEYWORDS.length);
    for (const row of MARKET_KEYWORDS) {
      assert.ok(row.aliases.length > 0, `aliases for ${row.keyword}`);
      assert.ok(row.category.length > 0);
    }
  });

  it("keeps prevalences within 0–100", () => {
    for (const row of MARKET_KEYWORDS) {
      for (const value of Object.values(row.prevalence)) {
        assert.ok(value >= 0 && value <= 100, `${row.keyword}: ${value}`);
      }
    }
  });

  it("computes the overall average column as round(mean(roles), 1)", () => {
    for (const row of MARKET_KEYWORDS) {
      const mean =
        (row.prevalence.aiEngineer +
          row.prevalence.automationEngineer +
          row.prevalence.developerPlusAi) /
        3;
      assert.equal(
        getPrevalence(row, "overallAverage"),
        round1(mean),
        `overall average for ${row.keyword}`,
      );
    }
  });

  it("matches the study's core 18-row table (transcription check)", () => {
    const expectedOverall: Record<string, number> = {
      Python: 90.0,
      "Git / Version Control": 92.3,
      "Docker / Containerization": 70.3,
      "RESTful API / GraphQL": 70.7,
      "AWS (SageMaker/Bedrock/Lambda)": 61.7,
      "CI/CD (Jenkins/GitLab/Actions)": 66.7,
      SQL: 61.0,
      "FastAPI / Flask / Express": 57.7,
      "System Design & Architecture": 57.7,
      "PostgreSQL (PGVector)": 56.7,
      "OpenAI API / Claude / Gemini": 52.3,
      "RAG (Retrieval-Augmented Gen)": 43.3,
      "LangChain / LangGraph": 41.0,
      TypeScript: 37.3,
      "Pinecone / Qdrant / Weaviate": 37.7,
      PyTorch: 34.0,
      "Selenium WebDriver": 27.7,
      "API Testing (Postman/RestAssured)": 44.0,
    };

    for (const [keyword, overall] of Object.entries(expectedOverall)) {
      const row = MARKET_KEYWORDS.find((item) => item.keyword === keyword);
      assert.ok(row, `row exists for ${keyword}`);
      assert.equal(getPrevalence(row, "overallAverage"), overall, keyword);
    }
  });

  it("targets every portfolio profile slug", () => {
    assert.equal(PROFILE_ROLE_TARGETS["ai-engineer"], "aiEngineer");
    assert.equal(PROFILE_ROLE_TARGETS["fullstack-engineer"], "developerPlusAi");
    assert.equal(PROFILE_ROLE_TARGETS["product-engineer"], "overallAverage");
  });

  it("labels every role key", () => {
    for (const key of Object.keys(ROLE_LABELS)) {
      assert.ok(ROLE_LABELS[key as keyof typeof ROLE_LABELS].length > 0);
    }
  });
});
