import { Pool } from "pg";
import { env } from "./env.js";

export const db = new Pool({
  host: env.DB_HOST,
  port: env.DB_PORT,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
});

export async function connectDB() {
  await db.query("SELECT 1");
  console.log("✅ PostgreSQL connected");
}
