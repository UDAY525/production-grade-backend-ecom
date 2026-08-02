import { env } from "../config/env";
import fs from "fs/promises";
import path from "path";
import { Pool } from "pg";
import { fileURLToPath } from "url";

const pool = new Pool({
  host: env.DB_HOST,
  port: env.DB_PORT,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function migrate() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS migrations (
      id SERIAL PRIMARY KEY,
      name TEXT UNIQUE NOT NULL,
      executed_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  const dir = path.join(__dirname, "migrations");
  const files = (await fs.readdir(dir)).sort();

  for (const file of files) {
    const exists = await pool.query(
      "SELECT 1 FROM migrations WHERE name = $1",
      [file],
    );

    if (exists.rowCount) continue;

    const sql = await fs.readFile(path.join(dir, file), "utf8");

    await pool.query("BEGIN");

    try {
      await pool.query(sql);
      await pool.query("INSERT INTO migrations(name) VALUES($1)", [file]);
      await pool.query("COMMIT");

      console.log(`✔ ${file}`);
    } catch (err) {
      await pool.query("ROLLBACK");
      throw err;
    }
  }

  await pool.end();
}

migrate();
