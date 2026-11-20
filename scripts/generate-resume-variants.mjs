#!/usr/bin/env node
/**
 * Regenerate ATS resume variant SQL (included in db/seed.sql via generate-cv-seed.mjs).
 * Run: npm run generate:resume-variants
 */
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const result = spawnSync("node", ["scripts/generate-cv-seed.mjs"], {
  cwd: root,
  stdio: "inherit",
});

if (result.status !== 0) {
  process.exit(result.status ?? 1);
}

console.info("Resume variants written to db/seed.sql. Run: npm run db:reset");
