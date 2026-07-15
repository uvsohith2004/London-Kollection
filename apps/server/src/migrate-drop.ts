import "dotenv/config";
import { Pool } from "pg";

async function main() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log("Dropping review form columns and tables...");
    
    await pool.query(`ALTER TABLE "product" DROP COLUMN IF EXISTS "review_form_id" CASCADE`);
    console.log("Dropped review_form_id from product.");

    await pool.query(`ALTER TABLE "review" DROP COLUMN IF EXISTS "review_form_version" CASCADE`);
    await pool.query(`ALTER TABLE "review" DROP COLUMN IF EXISTS "answers" CASCADE`);
    console.log("Dropped review_form_version and answers from review.");

    await pool.query(`DROP TABLE IF EXISTS "review_form" CASCADE`);
    console.log("Dropped review_form table.");

    console.log("Migration successful!");
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    await pool.end();
  }
}

main();
