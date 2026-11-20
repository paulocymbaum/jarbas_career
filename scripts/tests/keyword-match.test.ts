import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { matchAliases } from "../lib/scoring/keyword-match.js";

describe("keyword matcher", () => {
  it("is case-insensitive", () => {
    assert.deepEqual(matchAliases("FastAPI services", ["fastapi"]), ["fastapi"]);
    assert.deepEqual(matchAliases("LANGCHAIN agents", ["langchain"]), ["langchain"]);
  });

  it("never matches a word inside a longer word (git vs github)", () => {
    assert.deepEqual(matchAliases("pushed to github", ["git"]), []);
    assert.deepEqual(matchAliases("git push to origin", ["git"]), ["git"]);
    assert.deepEqual(matchAliases("digital and transpose", ["git"]), []);
  });

  it("matches phrase aliases across separators", () => {
    const restAliases = ["rest api", "rest apis", "restful", "graphql"];
    assert.deepEqual(matchAliases("REST/GraphQL APIs", restAliases), ["graphql"]);
    assert.deepEqual(matchAliases("built REST APIs", restAliases), ["rest apis"]);
    assert.deepEqual(matchAliases("a restful interface", restAliases), ["restful"]);
  });

  it("avoids the bare-word false positive for REST", () => {
    assert.deepEqual(matchAliases("restore the rest of it", ["rest api", "restful"]), []);
  });

  it("matches transformer-model aliases (BERT) but not inside names", () => {
    const hf = ["hugging face", "huggingface", "transformers", "transformer models", "bert"];
    assert.deepEqual(matchAliases("Fine-tuned BERT for NLP", hf), ["bert"]);
    assert.deepEqual(matchAliases("transformer models (BERT)", hf), [
      "transformer models",
      "bert",
    ]);
    assert.deepEqual(matchAliases("Albert and Robert", hf), []);
  });

  it("matches SQLite/DuckDB under the SQL row but not inside other words", () => {
    const sqlAliases = ["sql", "duckdb", "sqlite"];
    assert.deepEqual(matchAliases("SQLite and DuckDB pipelines", sqlAliases), [
      "duckdb",
      "sqlite",
    ]);
    assert.deepEqual(matchAliases("postgresql", sqlAliases), []);
  });

  it("handles symbols at alias edges (c++, ci/cd, next.js)", () => {
    assert.deepEqual(matchAliases("C++ and C#", ["c#", "c++"]), ["c#", "c++"]);
    assert.deepEqual(matchAliases("CI/CD pipeline", ["ci/cd"]), ["ci/cd"]);
    assert.deepEqual(matchAliases("Next.js app", ["next.js", "nextjs"]), ["next.js"]);
  });

  it("returns aliases in dataset order, deduplicated per call", () => {
    assert.deepEqual(matchAliases("postgres and PostgreSQL", ["postgresql", "postgres"]), [
      "postgresql",
      "postgres",
    ]);
  });
});
