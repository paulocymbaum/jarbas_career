#!/usr/bin/env node
/**
 * Sync README files from GitHub repos into content/projects/{slug}.md
 * Run: npm run sync:github-projects
 */
import {
  discoverOwner,
  GITHUB_OWNER_YourCompany,
  syncGithubProjectsFromConfig,
} from "./lib/github-projects-sync.js";

const discoverOwnerArg = process.argv.find((arg) => arg.startsWith("--discover="))?.split("=")[1]
  ?? (process.argv.includes("--discover") ? process.argv[process.argv.indexOf("--discover") + 1] : null);

if (discoverOwnerArg) {
  discoverOwner(discoverOwnerArg);
  process.exit(0);
}

const slugArgs = process.argv
  .filter((arg) => arg.startsWith("--slug="))
  .map((arg) => arg.split("=")[1])
  .filter((value): value is string => Boolean(value));

const slugs = slugArgs.length
  ? slugArgs
  : process.argv.includes("--slug")
    ? [process.argv[process.argv.indexOf("--slug") + 1]].filter((value): value is string =>
        Boolean(value),
      )
    : undefined;

syncGithubProjectsFromConfig({ slugs })
  .then((result) => {
    if (result.errors.length) {
      console.warn("Errors:", result.errors.join("; "));
    }
    if (process.argv.includes("--discover-all")) {
      console.info("");
      discoverOwner(GITHUB_OWNER_YourCompany);
    }
  })
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  });
