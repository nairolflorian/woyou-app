/**
 * Runs at Vercel build time:
 *   1. apply Prisma migrations
 *   2. (re-)seed demo data when DEMO_MODE != "false"
 *
 * The seed script is idempotent (it deletes & recreates demo rows), so each
 * deploy returns the database to a known fixture state.
 */
import { execSync } from "node:child_process";
import "dotenv/config";

function run(cmd: string) {
  console.log(`▶ ${cmd}`);
  execSync(cmd, { stdio: "inherit" });
}

if (!process.env.DATABASE_URL) {
  console.warn("⚠ DATABASE_URL not set — skipping migrate & seed.");
  process.exit(0);
}

try {
  run("prisma migrate deploy");
} catch (err) {
  console.error("Migration failed:", err);
  process.exit(1);
}

if (process.env.DEMO_MODE !== "false") {
  try {
    run("tsx scripts/seed.ts");
  } catch (err) {
    console.warn("Seed failed (continuing build):", err);
  }
} else {
  console.log("DEMO_MODE=false — skipping seed.");
}
