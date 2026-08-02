import type { NextFunction, Request, Response } from "express";
import { UnauthorizedError } from "../errors/UnauthorizedError";
import { verifyAccessToken } from "../../config/jwt";

export function protect(req: Request, res: Response, next: NextFunction) {
  const auth = req.headers.authorization;

  if (!auth?.startsWith("Bearer ")) {
    throw new UnauthorizedError("Authentication required");
  }

  const token = auth.split(" ")[1] ?? "";

  req.user = verifyAccessToken(token);

  next();
}
