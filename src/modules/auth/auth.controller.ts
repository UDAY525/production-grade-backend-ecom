import type { Request, Response } from "express";
import { loginSchema, registerSchema } from "./auth.validation";
import { AuthService } from "./auth.service";
import { ApiResponse } from "../../common/response/ApiResponse";
import { UnauthorizedError } from "../../common/errors/UnauthorizedError";

const authService = new AuthService();

export class AuthController {
  async register(req: Request, res: Response) {
    const body = registerSchema.parse(req.body);

    const user = await authService.register(body);

    res.status(201).json(ApiResponse.success(user, "Register successful"));
  }
  async login(req: Request, res: Response) {
    const body = loginSchema.parse(req.body);

    const result = await authService.login(body.email, body.password);

    res.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: false, // true in production
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json(ApiResponse.success(result, "Login successful"));
  }
  async refresh(req: Request, res: Response) {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      throw new UnauthorizedError("Refresh token missing");
    }

    const result = await authService.refresh(refreshToken);

    res.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      sameSite: "strict",
      secure: false,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json(
      ApiResponse.success(
        {
          accessToken: result.accessToken,
        },
        "Token refreshed",
      ),
    );
  }
  async logout(req: Request, res: Response) {
    const refreshToken = req.cookies.refreshToken;

    if (refreshToken) {
      await authService.logout(refreshToken);
    }

    res.clearCookie("refreshToken", {
      httpOnly: true,
      sameSite: "strict",
      secure: false, // true in production
    });

    res.json(ApiResponse.success(null, "Logout successful"));
  }
}
