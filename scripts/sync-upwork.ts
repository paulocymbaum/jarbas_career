import fs from "node:fs";
import path from "node:path";
import { config as loadEnv } from "dotenv";
import {
  buildSyncPlan,
  loadSyncState,
  loadUpworkConfig,
  mapExperienceRows,
  mapProjectRows,
  printSyncPlan,
  saveSyncState,
  UpworkClient,
  type CreateEmploymentRecordInput,
  type OtherExperienceInput,
  type UpworkSyncSnapshot,
  type UpdateEmploymentRecordInput,
  type UpdateOtherExperienceInput,
} from "./integrations/upwork/index.js";
import { openDatabaseReadonly, getProjectRoot } from "./lib/db.js";
import { fetchExperience, fetchProjects } from "./lib/queries.js";

loadEnv({ path: path.join(getProjectRoot(), ".env") });

function parseArgs(argv: string[]): {
  apply: boolean;
  experienceOnly: boolean;
  projectsOnly: boolean;
} {
  const apply = argv.includes("--apply");
  const experienceOnly = argv.includes("--experience-only");
  const projectsOnly = argv.includes("--projects-only");

  if (experienceOnly && projectsOnly) {
    throw new Error("Use only one of --experience-only or --projects-only.");
  }

  return { apply, experienceOnly, projectsOnly };
}

function writeSnapshot(snapshot: UpworkSyncSnapshot, stateDir: string): string {
  const root = getProjectRoot();
  const dir = path.isAbsolute(stateDir) ? stateDir : path.join(root, stateDir);
  fs.mkdirSync(dir, { recursive: true });

  const filePath = path.join(dir, "last-sync.json");
  fs.writeFileSync(filePath, `${JSON.stringify(snapshot, null, 2)}\n`, "utf-8");
  return filePath;
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  const config = loadUpworkConfig();
  const root = getProjectRoot();
  const db = openDatabaseReadonly();

  try {
    const experienceRows = fetchExperience(db);
    const projectRows = fetchProjects(db);
    const experiencePayloads = mapExperienceRows(experienceRows, config);
    const projectPayloads = mapProjectRows(projectRows, config);

    const syncExperience = args.projectsOnly ? false : config.syncExperience;
    const syncProjects = args.experienceOnly ? false : config.syncProjects;

    const client = new UpworkClient(config);
    const profile = await client.fetchCurrentUser();
    const state = loadSyncState(config.stateDir, root);

    const plan = buildSyncPlan({
      profile,
      experience: experiencePayloads,
      projects: projectPayloads,
      state,
      syncExperience,
      syncProjects,
    });

    printSyncPlan(plan, !args.apply);

    const snapshot: UpworkSyncSnapshot = {
      syncedAt: new Date().toISOString(),
      dryRun: !args.apply,
      user: { id: plan.userId, name: plan.userName },
      plan,
      results: [],
    };

    if (!args.apply) {
      const snapshotPath = writeSnapshot(snapshot, config.stateDir);
      console.info(`Dry-run snapshot written to ${snapshotPath}`);
      console.info("Re-run with --apply to push changes to Upwork.\n");
      return;
    }

    const nextState = { ...state, userId: plan.userId };

    for (const action of plan.actions) {
      if (action.action === "skip") continue;

      if (action.kind === "employment") {
        if (action.action === "create") {
          const created = await client.addEmploymentRecord(action.input as CreateEmploymentRecordInput);
          nextState.experience[String(action.portfolioId)] = {
            upworkId: created.id,
            syncedAt: new Date().toISOString(),
          };
          snapshot.results?.push({
            kind: "employment",
            action: "create",
            id: created.id,
            portfolioRef: String(action.portfolioId),
          });
        } else {
          const updated = await client.updateEmploymentRecord(action.input as UpdateEmploymentRecordInput);
          nextState.experience[String(action.portfolioId)] = {
            upworkId: updated.id,
            syncedAt: new Date().toISOString(),
          };
          snapshot.results?.push({
            kind: "employment",
            action: "update",
            id: updated.id,
            portfolioRef: String(action.portfolioId),
          });
        }
      }

      if (action.kind === "project") {
        if (action.action === "create") {
          const created = await client.addOtherExperience(action.input as OtherExperienceInput);
          nextState.projects[action.portfolioSlug] = {
            upworkId: created.id,
            syncedAt: new Date().toISOString(),
          };
          snapshot.results?.push({
            kind: "project",
            action: "create",
            id: created.id,
            portfolioRef: action.portfolioSlug,
          });
        } else {
          const updated = await client.updateOtherExperience(action.input as UpdateOtherExperienceInput);
          nextState.projects[action.portfolioSlug] = {
            upworkId: updated.id,
            syncedAt: new Date().toISOString(),
          };
          snapshot.results?.push({
            kind: "project",
            action: "update",
            id: updated.id,
            portfolioRef: action.portfolioSlug,
          });
        }
      }
    }

    const statePath = saveSyncState(nextState, config.stateDir, root);
    const snapshotPath = writeSnapshot(snapshot, config.stateDir);

    console.info(`Sync complete. State: ${statePath}`);
    console.info(`Snapshot: ${snapshotPath}\n`);
  } finally {
    db.close();
  }
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  process.exit(1);
});
