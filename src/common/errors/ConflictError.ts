import { AppError } from "./AppError";

export class ConflictError extends AppError {
  constructor(message: string, errors?: unknown) {
    super(409, message, errors);
  }
}
