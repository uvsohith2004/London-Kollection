import { config } from "dotenv";
config();

async function run() {
  const { cache } = await import("./src/cache");
  console.log("Clearing cache...");
  await cache.invalidatePattern("product:*");
  await cache.invalidatePattern("products:*");
  console.log("Cache cleared!");
  process.exit(0);
}

run();
