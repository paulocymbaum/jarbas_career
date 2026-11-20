#!/usr/bin/env node
/**
 * Push local .env integration secrets to GitHub Actions repository secrets.
 * Run: npm run gh:secrets
 *
 * Requires: gh CLI authenticated (`gh auth login`) with repo admin access.
 */
import fs from "node:fs";
import { execSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const envFile = path.join(root, ".env");
const envFromFile = fs.existsSync(envFile)
  ? dotenv.parse(fs.readFileSync(envFile, "utf-8"))
  : {};

function readEnv(key) {
  const fromFile = envFromFile[key]?.trim();
  if (fromFile) return fromFile;

  const vercelIds = loadVercelProjectIds();
  return vercelIds[key]?.trim() ?? "";
}

const SECRET_MAP = [
  { envKey: "GITHUB_TOKEN", secretKey: "GH_CONTRIBUTIONS_TOKEN" },
  { envKey: "VERCEL_TOKEN", secretKey: "VERCEL_TOKEN" },
  { envKey: "VERCEL_ORG_ID", secretKey: "VERCEL_ORG_ID" },
  { envKey: "VERCEL_PROJECT_ID", secretKey: "VERCEL_PROJECT_ID" },
  { envKey: "VITE_BASE_PATH", secretKey: "VITE_BASE_PATH", defaultValue: "/" },
  { envKey: "VITE_UMAMI_WEBSITE_ID", secretKey: "VITE_UMAMI_WEBSITE_ID" },
  { envKey: "VITE_UMAMI_URL", secretKey: "VITE_UMAMI_URL" },
];

function loadVercelProjectIds() {
  const projectFile = path.join(root, ".vercel", "project.json");
  if (!fs.existsSync(projectFile)) return {};

  try {
    const { orgId, projectId } = JSON.parse(fs.readFileSync(projectFile, "utf-8"));
    return {
      ...(orgId ? { VERCEL_ORG_ID: orgId } : {}),
      ...(projectId ? { VERCEL_PROJECT_ID: projectId } : {}),
    };
  } catch {
    return {};
  }
}

function setSecret(key, value) {
  execSync(`gh secret set ${key} --body ${JSON.stringify(value)}`, {
    stdio: "inherit",
    cwd: root,
    env: ghEnv(),
  });
}

function resolveEnvValue(envKey, defaultValue = "") {
  const value = readEnv(envKey);
  return value || defaultValue;
}

function ghEnv() {
  const env = { ...process.env };
  delete env.GITHUB_TOKEN;
  return env;
}

function main() {
  const repo = process.env.GITHUB_REPOSITORY
    ?? execSync("gh repo view --json nameWithOwner --jq .nameWithOwner", {
      encoding: "utf-8",
      cwd: root,
      env: ghEnv(),
    }).trim();

  console.info(`Pushing secrets to ${repo} ...\n`);

  let pushed = 0;
  const skipped = [];

  for (const { envKey, secretKey, defaultValue = "" } of SECRET_MAP) {
    const value = resolveEnvValue(envKey, defaultValue);
    if (!value) {
      skipped.push(`${secretKey} (set ${envKey} in .env or run npx vercel link)`);
      continue;
    }

    setSecret(secretKey, value);
    console.info(`  ✓ ${secretKey}`);
    pushed += 1;
  }

  if (skipped.length) {
    console.info("\nSkipped:");
    for (const item of skipped) {
      console.info(`  - ${item}`);
    }
  }

  if (!pushed) {
    console.error("\nNo secrets pushed. Fill .env and/or run: npx vercel link");
    process.exit(1);
  }

  const hasVercel = resolveEnvValue("VERCEL_TOKEN")
    && resolveEnvValue("VERCEL_ORG_ID")
    && resolveEnvValue("VERCEL_PROJECT_ID");
  const hasGithub = resolveEnvValue("GITHUB_TOKEN");

  console.info("\nStatus:");
  console.info(`  GitHub activity sync: ${hasGithub ? "ready" : "missing GH_CONTRIBUTIONS_TOKEN"}`);
  console.info(`  Vercel deploy:        ${hasVercel ? "ready" : "missing VERCEL_* secrets"}`);
  console.info("\nSee VERCEL.md for setup steps.");
}

main();
