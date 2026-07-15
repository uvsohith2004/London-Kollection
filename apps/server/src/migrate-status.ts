import "dotenv/config";
import { Pool } from "pg";

async function main() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log("Updating review table schema...");
    
    // Add new column
    await pool.query(`ALTER TABLE "review" ADD COLUMN IF NOT EXISTS "is_published" boolean DEFAULT false NOT NULL`);
    console.log("Added is_published column.");

    // Update existing rows
    await pool.query(`UPDATE "review" SET "is_published" = true WHERE "status" IN ('Approved', 'Submitted')`);
    console.log("Migrated data to is_published.");

    // Drop old column
    await pool.query(`ALTER TABLE "review" DROP COLUMN IF EXISTS "status"`);
    console.log("Dropped status column.");

    // Fix indexes
    await pool.query(`DROP INDEX IF EXISTS "review_status_idx"`);
    await pool.query(`CREATE INDEX IF NOT EXISTS "review_is_published_idx" ON "review" ("is_published")`);
    console.log("Updated indexes.");

    console.log("Migration successful!");
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    await pool.end();
  }
}

main();
