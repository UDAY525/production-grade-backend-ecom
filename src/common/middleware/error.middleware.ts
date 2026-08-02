import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import { AppError } from "../errors/AppError";
import { ApiResponse } from "../response/ApiResponse";

export const errorMiddleware: ErrorRequestHandler = (error, req, res, next) => {
  if (error instanceof ZodError) {
    return res
      .status(400)
      .json(ApiResponse.error("Validation failed", error.flatten()));
  }

  if (error instanceof AppError) {
    return res
      .status(error.statusCode)
      .json(ApiResponse.error(error.message, error.errors));
  }

  console.error(error);

  return res.status(500).json(ApiResponse.error("Internal Server Error"));
};
