import { ErrorCode } from "./error-codes"

export class AppError extends Error {
  public readonly code: ErrorCode
  public readonly statusCode: number
  public readonly details?: Record<string, any>

  constructor(message: string, code: ErrorCode, statusCode: number, details?: Record<string, any>) {
    super(message)
    this.name = this.constructor.name
    this.code = code
    this.statusCode = statusCode
    this.details = details
    Error.captureStackTrace(this, this.constructor)
  }
}
