#!/usr/bin/env node
/**
 * Fetch GitHub contribution calendar (including private repos) and write snapshot files.
 * Run: npm run sync:github-activity
 *
 * Requires GITHUB_TOKEN in .env (classic PAT or fine-grained with read access to user profile).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import {
  emptyGithubActivitySnapshot,
  fetchContributionCalendar,
  generateGithubActivityModule,
} from "./lib/github-activity.mjs";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
dotenv.config({ path: path.join(root, ".env") });

const token = process.env.GITHUB_TOKEN?.trim();
const username =
  process.env.GITHUB_USERNAME?.trim()
  || process.env.GITHUB_ACTOR?.trim()
  || "your-username";
const dataPath = path.join(root, "data", "github-activity.json");
const modulePath = path.join(root, "src", "content", "github-activity.ts");

async function main() {
  let snapshot;

  if (!token) {
    if (process.env.CI === "true" || process.env.GITHUB_ACTIONS === "true") {
      console.error(
        [
          "GH_CONTRIBUTIONS_TOKEN is not configured for this workflow.",
          "The automatic Actions GITHUB_TOKEN cannot read your personal contribution calendar.",
          "Add a classic PAT (repo + read:user) as repository secret GH_CONTRIBUTIONS_TOKEN.",
          "Locally: set GITHUB_TOKEN in .env, then run: npm run gh:secrets",
        ].join("\n"),
      );
      process.exit(1);
    }

    console.warn("GITHUB_TOKEN not set — writing empty GitHub activity snapshot.");
    snapshot = emptyGithubActivitySnapshot(username);
  } else {
    snapshot = await fetchContributionCalendar(token);
    if (username && snapshot.username !== username) {
      console.info(`Note: authenticated as ${snapshot.username} (GITHUB_USERNAME=${username}).`);
    }
    console.info(
      `Fetched ${snapshot.totalContributions} contributions (${snapshot.from} → ${snapshot.to}).`,
    );
  }

  fs.mkdirSync(path.dirname(dataPath), { recursive: true });
  fs.writeFileSync(dataPath, `${JSON.stringify(snapshot, null, 2)}\n`, "utf-8");
  fs.writeFileSync(modulePath, generateGithubActivityModule(snapshot), "utf-8");

  console.info(`Wrote ${dataPath}`);
  console.info(`Wrote ${modulePath}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
