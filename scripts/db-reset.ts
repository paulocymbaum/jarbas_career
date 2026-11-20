import { resetDatabase } from "./lib/db.js";

try {
  resetDatabase();
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  process.exit(1);
}
