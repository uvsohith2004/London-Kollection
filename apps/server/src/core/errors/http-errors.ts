import { ERROR_CODES, ErrorCode } from "./error-codes"
import { AppError } from "./app-error"

export class BadRequestError extends AppError {
  constructor(message = "Bad Request", code: ErrorCode = ERROR_CODES.BAD_REQUEST, details?: Record<string, any>) {
    super(message, code, 400, details)
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized", code: ErrorCode = ERROR_CODES.UNAUTHORIZED, details?: Record<string, any>) {
    super(message, code, 401, details)
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Forbidden", code: ErrorCode = ERROR_CODES.FORBIDDEN, details?: Record<string, any>) {
    super(message, code, 403, details)
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Not Found", code: ErrorCode = ERROR_CODES.NOT_FOUND, details?: Record<string, any>) {
    super(message, code, 404, details)
  }
}

export class ConflictError extends AppError {
  constructor(message = "Conflict", code: ErrorCode = ERROR_CODES.CONFLICT, details?: Record<string, any>) {
    super(message, code, 409, details)
  }
}

export class ValidationError extends AppError {
  constructor(message = "Validation Error", details?: Record<string, any>) {
    super(message, ERROR_CODES.VALIDATION_ERROR, 422, details)
  }
}

export class RateLimitError extends AppError {
  constructor(message = "Too Many Requests", code: ErrorCode = ERROR_CODES.TOO_MANY_REQUESTS, details?: Record<string, any>) {
    super(message, code, 429, details)
  }
}

export class InternalServerError extends AppError {
  constructor(message = "Internal Server Error", code: ErrorCode = ERROR_CODES.INTERNAL_SERVER_ERROR, details?: Record<string, any>) {
    super(message, code, 500, details)
  }
}
