import type { NextFunction, Request, Response } from "express";
import { ForbiddenError } from "../errors/ForbiddenError";

export function authorize(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new ForbiddenError("Unauthorized");
    }

    if (!roles.includes(req.user.role)) {
      throw new ForbiddenError("Access denied");
    }

    next();
  };
}
