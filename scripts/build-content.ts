import { rebuildContent } from "./lib/rebuild-content.js";

try {
  const result = rebuildContent();
  console.info(`Conteúdo gerado em ${result.sitePath}`);
  console.info(`Recruitment packs gerados em ${result.recruitmentPath}`);
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  process.exit(1);
}
