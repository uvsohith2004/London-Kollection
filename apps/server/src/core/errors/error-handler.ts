import { Context } from "hono"
import { HTTPResponseError } from "hono/types"
import { AppError, InternalServerError, ERROR_CODES } from "@/core/errors"
import { fail } from "@/core/response"
import { logger } from "@/core/utils/logger"
import { ZodError } from "zod"

export const errorHandler = (err: Error | HTTPResponseError, c: Context) => {

  if (err instanceof AppError) {
    logger.warn(`AppError: ${err.message}`, { code: err.code, status: err.statusCode, path: c.req.path })
    return c.json(fail(err.code, err.message, err.details), err.statusCode as any)
  }

  // Handle Zod Validation Errors
  if (err instanceof ZodError) {
    const issues: any[] = (err as any).errors || (err as any).issues || []
    const details = issues.reduce((acc: Record<string, string>, current: any) => {
      acc[current.path.join(".")] = current.message
      return acc
    }, {})
    
    logger.warn("Validation Error", { path: c.req.path, details })
    return c.json(fail(ERROR_CODES.VALIDATION_ERROR, "Validation Failed", details), 422)
  }

  // Determine if it's a known HTTP error from Hono
  const status = "status" in err && typeof err.status === "number" ? err.status : 500

  // Handle Unexpected Errors
  logger.error("Unhandled Exception", err, { path: c.req.path, method: c.req.method })
  
  const fallbackError = new InternalServerError()
  const errorObj = err as any
  return c.json(fail(fallbackError.code, err.message, { stack: err.stack, pgCode: errorObj.code, pgDetail: errorObj.detail, pgHint: errorObj.hint, pgRoutine: errorObj.routine }), 500)
}
