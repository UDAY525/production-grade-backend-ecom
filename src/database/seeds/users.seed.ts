import bcrypt from "bcrypt";
import type { PoolClient } from "pg";

export async function seedUsers(client: PoolClient) {
  const passwordHash = await bcrypt.hash("Password@123", 10);
  console.log("⏳ Running user data seeding...");

  const users = [
    {
      firstName: "Admin",
      lastName: "User",
      email: "admin@test.com",
      role: "admin",
    },
    {
      firstName: "Seller",
      lastName: "User",
      email: "seller@test.com",
      role: "seller",
    },
    {
      firstName: "Buyer",
      lastName: "User",
      email: "buyer@test.com",
      role: "buyer",
    },
  ];

  for (const user of users) {
    await client.query(
      `
      INSERT INTO users (
        first_name, last_name, email, password_hash, role, is_email_verified
      )
      VALUES ($1, $2, $3, $4, $5, true)
      ON CONFLICT(email)
      DO UPDATE SET
        role = EXCLUDED.role,
        first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name
      `,
      [user.firstName, user.lastName, user.email, passwordHash, user.role],
    );
  }

  console.log("✅ Users seeded");
}
