import { ConflictError, InternalServerError, BadRequestError } from "@/core/errors"
import { logger } from "@/core/utils/logger"

/**
 * Standard Postgres Error Codes
 * https://www.postgresql.org/docs/current/errcodes-appendix.html
 */
const PG_ERROR_CODES = {
  UNIQUE_VIOLATION: "23505",
  FOREIGN_KEY_VIOLATION: "23503",
  NOT_NULL_VIOLATION: "23502",
  CHECK_VIOLATION: "23514",
}

/**
 * Utility to catch generic database errors and translate them into standard AppErrors.
 * @param err The error thrown by the database driver.
 * @param customMessage Optional custom message to use for known errors.
 */
export function handleDbError(err: unknown, customMessage?: string): never {
  // Type narrow for standard Error with a code property (like pg errors)
  if (err instanceof Error && "code" in err && typeof (err as any).code === "string") {
    const pgError = err as any
    const detail = pgError.detail ? ` (${pgError.detail})` : ""

    switch (pgError.code) {
      case PG_ERROR_CODES.UNIQUE_VIOLATION:
        throw new ConflictError(customMessage || `A record with this identifier already exists${detail}`)
      
      case PG_ERROR_CODES.FOREIGN_KEY_VIOLATION:
        throw new BadRequestError(customMessage || `Referenced record does not exist${detail}`)
      
      case PG_ERROR_CODES.NOT_NULL_VIOLATION:
        throw new BadRequestError(customMessage || `Missing required field${detail}`)
      
      case PG_ERROR_CODES.CHECK_VIOLATION:
        throw new BadRequestError(customMessage || `Database constraint check failed${detail}`)
    }
  }

  // If we can't safely translate the error, log it as an unexpected DB failure and throw 500
  logger.error("Unexpected Database Error", err)
  throw new InternalServerError("An unexpected database error occurred")
}
