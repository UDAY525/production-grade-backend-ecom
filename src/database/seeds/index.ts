import { db } from "./../../config/db.js"; // Added .js extension if tracking ESM
import { seedDemo } from "./demo.seed.js";
import { seedUsers } from "./users.seed.js"; // Added .js extension if tracking ESM

async function seed() {
  const client = await db.connect();

  try {
    await client.query("BEGIN");

    // 💡 FIXED: Pass the client connection argument into the function here
    await seedUsers(client);
    await seedDemo(client);

    await client.query("COMMIT");
    console.log("✅ Seeding completed");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("❌ Seeding failed:", err);
    process.exit(1); // Exit with failure code
  } finally {
    client.release();
    process.exit(0); // Clean exit after resource release
  }
}

seed();
