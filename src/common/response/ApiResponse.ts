export class ApiResponse {
  static success(data: unknown, message = "Success") {
    return {
      success: true,
      message,
      data,
    };
  }

  static error(message: string, errors?: unknown) {
    return {
      success: false,
      message,
      errors,
    };
  }
}
