import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const hooksDir = path.join(root, ".git", "hooks");

if (!fs.existsSync(path.join(root, ".git"))) {
  console.info("Skipping git hooks: not a git repository.");
  process.exit(0);
}

const hooks = ["pre-commit", "pre-push"];
fs.mkdirSync(hooksDir, { recursive: true });
for (const name of hooks) {
  const hookPath = path.join(hooksDir, name);
  fs.copyFileSync(path.join(root, "scripts", "git-hooks", name), hookPath);
  fs.chmodSync(hookPath, 0o755);
  console.info(`Installed git ${name} hook → scripts/git-hooks/${name}`);
}
