import { db } from "../../config/db";
import type { RegisterDto } from "./auth.types";

export class AuthRepository {
  findByEmail(email: string) {
    return db.query("SELECT * FROM users WHERE email = $1", [email]);
  }

  create(data: RegisterDto, passwordHash: string) {
    return db.query(
      `INSERT INTO users
      (first_name,last_name,email,password_hash)
      VALUES ($1,$2,$3,$4)
      RETURNING id,email,first_name,last_name`,
      [data.firstName, data.lastName ?? null, data.email, passwordHash],
    );
  }
}
