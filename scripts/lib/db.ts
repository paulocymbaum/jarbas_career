import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const dataDir = path.join(root, "data");
export const dbPath = path.join(dataDir, "portfolio.db");

export function getProjectRoot(): string {
  return root;
}

export function ensureDataDir(): void {
  fs.mkdirSync(dataDir, { recursive: true });
}

export function openDatabaseReadonly(): Database.Database {
  ensureDatabase();

  try {
    return new Database(dbPath, { readonly: true, fileMustExist: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message.includes("database is locked")) {
      throw new Error(
        `Banco bloqueado em ${dbPath}. Feche editores SQLite externos e tente novamente.`,
      );
    }
    throw error;
  }
}

export function openDatabaseReadWrite(): Database.Database {
  ensureDatabase();

  try {
    const db = new Database(dbPath);
    db.pragma("foreign_keys = ON");
    return db;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message.includes("database is locked")) {
      throw new Error(
        `Banco bloqueado em ${dbPath}. Feche editores SQLite externos e tente novamente.`,
      );
    }
    throw error;
  }
}

/**
 * Rebuild data/portfolio.db from db/schema.sql + migrations + db/seed.sql.
 * The seed file is the single source of truth, so this is deterministic.
 */
export function resetDatabase(): void {
  ensureDataDir();

  if (fs.existsSync(dbPath)) {
    fs.unlinkSync(dbPath);
  }

  const db = new Database(dbPath);

  try {
    db.exec(readSqlFile("db/schema.sql"));

    for (const migration of listMigrationFiles()) {
      db.exec(readSqlFile(path.join("db", "migrations", migration)));
    }

    db.exec(readSqlFile("db/seed.sql"));

    const integrity = db.pragma("integrity_check", { simple: true }) as string;
    if (integrity !== "ok") {
      throw new Error(`PRAGMA integrity_check falhou: ${integrity}`);
    }
  } finally {
    db.close();
  }

  console.info(`Banco recriado em ${dbPath}`);
}

/**
 * Bootstrap the database from seed when it is missing (fresh clones, CI/CD
 * environments like Vercel where data/portfolio.db is gitignored) so content
 * and resume builds never fail on a clean checkout.
 */
export function ensureDatabase(): void {
  if (fs.existsSync(dbPath)) return;
  console.info(`Banco ausente em ${dbPath} — bootstrapando a partir de db/seed.sql…`);
  resetDatabase();
}

export function readSqlFile(relativePath: string): string {
  return fs.readFileSync(path.join(root, relativePath), "utf-8");
}

export function listMigrationFiles(): string[] {
  const migrationsDir = path.join(root, "db", "migrations");
  if (!fs.existsSync(migrationsDir)) {
    return [];
  }

  return fs
    .readdirSync(migrationsDir)
    .filter((file) => file.endsWith(".sql"))
    .sort();
}
