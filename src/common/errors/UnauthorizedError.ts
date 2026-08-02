import { AppError } from "./AppError";

export class UnauthorizedError extends AppError {
  constructor(message: string, errors?: unknown) {
    super(401, message, errors);
  }
}
