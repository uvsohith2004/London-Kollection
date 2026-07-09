import { Client } from "pg";
import "dotenv/config";

async function main() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });
  await client.connect();
  await client.query(`
    DROP TABLE IF EXISTS setting CASCADE;
    CREATE TABLE setting (
      id TEXT PRIMARY KEY DEFAULT 'global',
      default_currency TEXT DEFAULT 'GBP',
      order_prefix TEXT,
      logo_url JSONB,
      logo_dark_url JSONB,
      site_name TEXT,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `);
  console.log("Recreated table 'setting' successfully!");
  await client.end();
}
main();
