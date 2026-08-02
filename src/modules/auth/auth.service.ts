import bcrypt from "bcrypt";
import type { RegisterDto } from "./auth.types";
import { AuthRepository } from "./auth.repository";
import { ConflictError } from "../../common/errors/ConflictError";

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
}
