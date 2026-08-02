import type { Request, Response } from "express";
import { registerSchema } from "./auth.validation";
import { AuthService } from "./auth.service";

const authService = new AuthService();

export class AuthController {
  async register(req: Request, res: Response) {
    const body = registerSchema.parse(req.body);

    const user = await authService.register(body);

    res.status(201).json({
      success: true,
      data: user,
    });
  }
}
