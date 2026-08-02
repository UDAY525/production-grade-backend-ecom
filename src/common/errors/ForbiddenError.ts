import { AppError } from "./AppError";

export class ForbiddenError extends AppError {
  constructor(message: string, errors?: unknown) {
    super(403, message, errors);
  }
}
