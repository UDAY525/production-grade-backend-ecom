import bcrypt from "bcrypt";
import type { RegisterDto } from "./auth.types";
import { AuthRepository } from "./auth.repository";
import { ConflictError } from "../../common/errors/ConflictError";
import { UnauthorizedError } from "../../common/errors/UnauthorizedError";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../../config/jwt";
import { hashToken } from "../../common/utils/hash";

export class AuthService {
  constructor(private readonly authRepository = new AuthRepository()) {}

  async register(data: RegisterDto) {
    const existingUser = await this.authRepository.findByEmail(data.email);

    if (existingUser.rowCount) {
      throw new ConflictError("Email already exists");
    }

    const passwordHash = await bcrypt.hash(data.password, 10);

    const { rows } = await this.authRepository.create(data, passwordHash);

    return rows[0];
  }

  async login(email: string, password: string) {
    const { rows } = await this.authRepository.findByEmail(email);

    if (!rows.length) {
      throw new UnauthorizedError("Invalid credentials");
    }

    const user = rows[0];

    const valid = await bcrypt.compare(password, user.password_hash);

    if (!valid) {
      throw new UnauthorizedError("Invalid credentials");
    }
    await this.authRepository.revokeAllUserTokens(user.id);
    const accessToken = generateAccessToken(user.id, user.role);
    const refreshToken = generateRefreshToken(user.id);
    await this.authRepository.saveRefreshToken(
      user.id,
      hashToken(refreshToken),
      new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    );
    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    };
  }

  async refresh(refreshToken: string) {
    const payload = verifyRefreshToken(refreshToken);

    const oldHash = hashToken(refreshToken);

    const { rows } = await this.authRepository.findRefreshToken(oldHash);

    if (!rows.length) {
      throw new UnauthorizedError("Invalid refresh token");
    }

    const token = rows[0];

    const accessToken = generateAccessToken(token.user_id, token.role);

    const newRefreshToken = generateRefreshToken(token.user_id);

    await this.authRepository.rotateRefreshToken(
      oldHash,
      hashToken(newRefreshToken),
      new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    );

    return {
      accessToken,
      refreshToken: newRefreshToken,
    };
  }

  async logout(refreshToken: string) {
    const tokenHash = hashToken(refreshToken);

    await this.authRepository.revokeRefreshToken(tokenHash);
  }
}
