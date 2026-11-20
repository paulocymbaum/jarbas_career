import fs from "node:fs";
import path from "node:path";
import type { UpworkSyncState } from "./types.js";

export function createEmptySyncState(): UpworkSyncState {
  return {
    version: 1,
    updatedAt: new Date().toISOString(),
    experience: {},
    projects: {},
  };
}

export function getSyncStatePath(stateDir: string, projectRoot: string): string {
  const dir = path.isAbsolute(stateDir) ? stateDir : path.join(projectRoot, stateDir);
  return path.join(dir, "sync-state.json");
}

export function loadSyncState(stateDir: string, projectRoot: string): UpworkSyncState {
  const filePath = getSyncStatePath(stateDir, projectRoot);
  if (!fs.existsSync(filePath)) {
    return createEmptySyncState();
  }

  const raw = JSON.parse(fs.readFileSync(filePath, "utf-8")) as UpworkSyncState;
  return {
    ...createEmptySyncState(),
    ...raw,
    experience: raw.experience ?? {},
    projects: raw.projects ?? {},
  };
}

export function saveSyncState(
  state: UpworkSyncState,
  stateDir: string,
  projectRoot: string,
): string {
  const dir = path.isAbsolute(stateDir) ? stateDir : path.join(projectRoot, stateDir);
  fs.mkdirSync(dir, { recursive: true });

  const filePath = path.join(dir, "sync-state.json");
  const next: UpworkSyncState = {
    ...state,
    updatedAt: new Date().toISOString(),
  };
  fs.writeFileSync(filePath, `${JSON.stringify(next, null, 2)}\n`, "utf-8");
  return filePath;
}
