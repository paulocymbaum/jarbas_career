#!/usr/bin/env node
/**
 * Discover and download showcase images from featured project GitHub repos.
 * Assets are stored under assets/projects/{slug}/ and published copies under
 * public/assets/projects/{slug}/ for the Vite site.
 *
 * Run: npm run sync:project-assets
 */
import { syncProjectAssets } from "./lib/github-project-assets.js";

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

const featuredOnly = !process.argv.includes("--all");
const skipDb = process.argv.includes("--no-db");

syncProjectAssets({
  slugs,
  featuredOnly,
  updateDatabase: !skipDb,
})
  .then((result) => {
    if (result.errors.length) {
      console.warn("\nErrors:");
      for (const error of result.errors) {
        console.warn(`  - ${error}`);
      }
    }
  })
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  });
