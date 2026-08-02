import bcrypt from "bcrypt";
import { db } from "../../config/db";

async function seed() {
  const passwordHash = await bcrypt.hash("Password@123", 10);

  const users = [
    {
      firstName: "Admin",
      email: "admin@test.com",
      role: "admin",
    },
    {
      firstName: "Seller",
      email: "seller@test.com",
      role: "seller",
    },
    {
      firstName: "Buyer",
      email: "buyer@test.com",
      role: "buyer",
    },
  ];

  for (const user of users) {
    await db.query(
      `
      INSERT INTO users
      (
        first_name,
        email,
        password_hash,
        role,
        is_email_verified
      )
      VALUES ($1,$2,$3,$4,true)
      ON CONFLICT(email) DO NOTHING
      `,
      [user.firstName, user.email, passwordHash, user.role],
    );
  }

  console.log("✅ Users seeded");

  process.exit(0);
}

seed();
