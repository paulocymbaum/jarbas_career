import fs from "node:fs";
import path from "node:path";
import type Database from "better-sqlite3";
import { getProjectRoot, openDatabaseReadonly } from "./db.js";

const SEED_HEADER = `-- Portfolio seed exported from data/portfolio.db
-- Regenerate: npm run db:dump-seed
-- Apply: npm run db:reset
`;

const TABLE_ORDER = [
  "site_profile",
  "professional_profile",
  "professional_profile_chip",
  "experience",
  "experience_highlight",
  "experience_tech",
  "education",
  "certification",
  "project",
  "project_link",
  "project_tech",
  "skill_category",
  "skill_item",
  "professional_profile_cv",
  "professional_profile_experience",
  "professional_profile_experience_highlight",
  "professional_profile_cv_skill",
  "professional_profile_cv_project",
  "article",
] as const;

const SKIP_COLUMNS = new Set(["created_at", "updated_at"]);

type ColumnInfo = {
  name: string;
  pk: number;
};

function sqlLiteral(value: unknown): string {
  if (value === null || value === undefined) return "NULL";
  if (typeof value === "number") return Number.isFinite(value) ? String(value) : "NULL";
  if (typeof value === "boolean") return value ? "1" : "0";
  return `'${String(value).replace(/'/g, "''")}'`;
}

function getTableColumns(db: Database.Database, table: string): ColumnInfo[] {
  const rows = db.prepare(`PRAGMA table_info(${table})`).all() as Array<{
    name: string;
    pk: number;
  }>;

  return rows
    .filter((column) => !SKIP_COLUMNS.has(column.name))
    .map((column) => ({ name: column.name, pk: column.pk }));
}

function orderClause(columns: ColumnInfo[]): string {
  const pkColumns = columns.filter((column) => column.pk > 0).map((column) => column.name);
  if (pkColumns.length) return `ORDER BY ${pkColumns.join(", ")}`;
  return "";
}

function dumpTable(db: Database.Database, table: string): string | null {
  const columns = getTableColumns(db, table);
  if (!columns.length) return null;

  const columnNames = columns.map((column) => column.name);
  const rows = db
    .prepare(`SELECT ${columnNames.join(", ")} FROM ${table} ${orderClause(columns)}`)
    .all() as Record<string, unknown>[];

  if (!rows.length) return null;

  const valueLines = rows.map((row) => {
    const values = columnNames.map((name) => sqlLiteral(row[name]));
    return `  (${values.join(", ")})`;
  });

  return [
    `INSERT INTO ${table} (${columnNames.join(", ")}) VALUES`,
    valueLines.join(",\n"),
    ";",
  ].join("\n");
}

export function buildSeedSql(db: Database.Database): string {
  const sections = [SEED_HEADER.trimEnd()];

  for (const table of TABLE_ORDER) {
    const section = dumpTable(db, table);
    if (section) {
      sections.push("", section);
    }
  }

  return `${sections.join("\n")}\n`;
}

export function dumpDatabaseToSeed(outputPath = path.join(getProjectRoot(), "db", "seed.sql")): {
  outputPath: string;
  bytes: number;
} {
  const db = openDatabaseReadonly();

  try {
    const sql = buildSeedSql(db);
    fs.writeFileSync(outputPath, sql, "utf-8");
    return { outputPath, bytes: Buffer.byteLength(sql, "utf-8") };
  } finally {
    db.close();
  }
}
