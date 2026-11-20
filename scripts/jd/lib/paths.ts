// Shared path helpers and flag parsing for the job-application tailoring CLI.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function getProjectRoot(): string {
  return path.resolve(__dirname, "..", "..", "..");
}

export type GlobalArgs = {
  applicationsDir: string;
  force: boolean;
  role?: string;
  company?: string;
};

type FlagSetter = (args: GlobalArgs, value: string) => void;

const FLAGS: Record<string, FlagSetter> = {
  "--applications-dir": (args, value) => {
    args.applicationsDir = value;
  },
  "--role": (args, value) => {
    args.role = value;
  },
  "--company": (args, value) => {
    args.company = value;
  },
};

export type ParsedInvocation = { args: GlobalArgs; positional: string[] };

/** Parses "--flag value", "--flag=value", "--force", and positional args. */
export function parseInvocation(argv: string[]): ParsedInvocation {
  const args: GlobalArgs = { applicationsDir: "applications", force: false };
  const positional: string[] = [];

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--force") {
      args.force = true;
      continue;
    }

    const eq = arg.indexOf("=");
    const name = eq > 0 ? arg.slice(0, eq) : arg;

    const setter = FLAGS[name];
    if (!setter) {
      positional.push(arg);
      continue;
    }

    let value: string;
    if (eq > 0) {
      value = arg.slice(eq + 1);
    } else {
      const next = argv[index + 1];
      if (next === undefined || next.startsWith("--")) {
        throw new Error(`Missing value for ${arg}`);
      }
      value = next;
      index += 1;
    }
    setter(args, value);
  }

  return { args, positional };
}

/** "AI Engineer — Sr/Staff (Remote)" → "AI Engineer - Sr-Staff (Remote)" (filesystem-safe). */
export function sanitizeDirName(value: string): string {
  return value
    .normalize("NFKC")
    .replace(/[\u2010-\u2015]/g, "-")
    .replace(/[\\/:*?"<>|]/g, "-")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^[-.\s]+/, "")
    .replace(/[-.\s]+$/, "")
    .slice(0, 120)
    .trim();
}

export function applicationDirName(role: string, company: string): string {
  return sanitizeDirName(`${role.trim()} - ${company.trim()}`);
}

export function applicationsRoot(args: Pick<GlobalArgs, "applicationsDir">): string {
  const root = getProjectRoot();
  return path.isAbsolute(args.applicationsDir)
    ? args.applicationsDir
    : path.join(root, args.applicationsDir);
}

export function readJson<T>(filePath: string): T {
  return JSON.parse(fs.readFileSync(filePath, "utf-8")) as T;
}

export function writeText(filePath: string, content: string): void {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, "utf-8");
}
