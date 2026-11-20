import { dumpDatabaseToSeed } from "./lib/dump-seed.js";

try {
  const { outputPath, bytes } = dumpDatabaseToSeed();
  console.info(`Wrote ${outputPath} (${bytes} bytes)`);
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  process.exit(1);
}
