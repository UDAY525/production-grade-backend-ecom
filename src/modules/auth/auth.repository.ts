import { UnauthorizedError } from "../../common/errors/UnauthorizedError";
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

  saveRefreshToken(userId: string, tokenHash: string, expiresAt: Date) {
    return db.query(
      `INSERT INTO refresh_tokens
    (user_id, token_hash, expires_at)
    VALUES ($1,$2,$3)`,
      [userId, tokenHash, expiresAt],
    );
  }

  findRefreshToken(tokenHash: string) {
    return db.query(
      `SELECT rt.*, u.role
     FROM refresh_tokens rt
     JOIN users u ON u.id = rt.user_id
     WHERE rt.token_hash = $1
       AND rt.revoked = false
       AND rt.expires_at > NOW()`,
      [tokenHash],
    );
  }

  revokeRefreshToken(tokenHash: string) {
    return db.query(
      `UPDATE refresh_tokens
     SET revoked = true
     WHERE token_hash = $1`,
      [tokenHash],
    );
  }

  async rotateRefreshToken(
    oldTokenHash: string,
    newTokenHash: string,
    expiresAt: Date,
  ) {
    const client = await db.connect();

    try {
      await client.query("BEGIN");

      const { rows } = await client.query(
        `SELECT user_id
       FROM refresh_tokens
       WHERE token_hash = $1
       AND revoked = false`,
        [oldTokenHash],
      );

      if (!rows.length) {
        throw new UnauthorizedError("Invalid refresh token");
      }

      await client.query(
        `UPDATE refresh_tokens
       SET revoked = true
       WHERE token_hash = $1`,
        [oldTokenHash],
      );

      await client.query(
        `INSERT INTO refresh_tokens
      (user_id, token_hash, expires_at)
      VALUES ($1,$2,$3)`,
        [rows[0].user_id, newTokenHash, expiresAt],
      );

      await client.query("COMMIT");
    } catch (e) {
      await client.query("ROLLBACK");
      throw e;
    } finally {
      client.release();
    }
  }

  revokeAllUserTokens(userId: string) {
    return db.query(
      `UPDATE refresh_tokens 
     SET revoked = true 
     WHERE user_id = $1 AND revoked = false`,
      [userId],
    );
  }
}
