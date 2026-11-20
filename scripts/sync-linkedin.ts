import fs from "node:fs";
import path from "node:path";
import { config as loadEnv } from "dotenv";
import {
  LinkedInApiError,
  LinkedInClient,
  buildImportSnapshot,
  loadLinkedInConfig,
  type LinkedInImportSnapshot,
} from "./integrations/linkedin/index.js";
import { getProjectRoot } from "./lib/db.js";

loadEnv({ path: path.join(getProjectRoot(), ".env") });

function memberUrnFromSub(sub: string): string {
  return sub.startsWith("urn:li:person:") ? sub : `urn:li:person:${sub}`;
}

function writeSnapshot(snapshot: LinkedInImportSnapshot, snapshotDir: string): string {
  const root = getProjectRoot();
  const dir = path.isAbsolute(snapshotDir) ? snapshotDir : path.join(root, snapshotDir);
  fs.mkdirSync(dir, { recursive: true });

  const filePath = path.join(dir, "snapshot.json");
  fs.writeFileSync(filePath, `${JSON.stringify(snapshot, null, 2)}\n`, "utf-8");
  return filePath;
}

async function main(): Promise<void> {
  const config = loadLinkedInConfig();
  const client = new LinkedInClient(config);
  const warnings: string[] = [];

  const userInfo = await client.fetchUserInfo();
  const memberUrn = config.memberUrn ?? memberUrnFromSub(userInfo.sub);

  let liteProfile;
  if (config.syncProfile) {
    try {
      liteProfile = await client.fetchLiteProfile();
    } catch (error) {
      if (error instanceof LinkedInApiError) {
        warnings.push(`Lite profile unavailable (${error.status}): ${error.body}`);
      } else {
        throw error;
      }
    }
  }

  let posts;
  if (config.syncArticles) {
    try {
      posts = await client.fetchAllMemberPosts();
    } catch (error) {
      if (error instanceof LinkedInApiError) {
        warnings.push(
          `Articles/posts unavailable (${error.status}). r_member_social is restricted — see EXTERNAL.md §5.`,
        );
      } else {
        throw error;
      }
    }
  }

  if (config.syncExperience || config.syncEducation || config.syncSkills || config.syncCertifications) {
    warnings.push(
      "Full curriculum (experience, education, skills, certifications) is not available via self-serve LinkedIn APIs. Use LinkedIn data export or partner-tier access — see EXTERNAL.md §4 and §6.",
    );
  }

  const snapshot = buildImportSnapshot({
    memberUrn,
    userInfo,
    liteProfile,
    posts,
    vanityName: config.vanityName,
    warnings,
  });

  const outputPath = writeSnapshot(snapshot, config.snapshotDir);

  console.info(`LinkedIn snapshot written to ${outputPath}`);
  console.info(`  Profile: ${snapshot.profile.name}`);
  console.info(`  Articles: ${snapshot.articles.length}`);
  if (warnings.length > 0) {
    console.warn("Warnings:");
    for (const warning of warnings) {
      console.warn(`  - ${warning}`);
    }
  }
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  process.exit(1);
});
