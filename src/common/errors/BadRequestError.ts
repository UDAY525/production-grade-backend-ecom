import { AppError } from "./AppError";

export class BadRequestError extends AppError {
  constructor(message: string, errors?: unknown) {
    super(400, message, errors);
  }
}
