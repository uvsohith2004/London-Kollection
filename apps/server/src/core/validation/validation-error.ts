import { z } from "zod"
import { Context } from "hono"
import { fail } from "@/core/response"
import { ERROR_CODES } from "@/core/errors"
import { logger } from "@/core/utils/logger"

/**
 * Creates a generic hook for @hono/zod-validator that translates Zod validation errors
 * into the standard API error contract.
 */
export const validationHook = (result: any, c: Context) => {
  if (!result.success) {
    const details = result.error.errors.reduce((acc: Record<string, string>, current: any) => {
      acc[current.path.join(".")] = current.message
      return acc
    }, {} as Record<string, string>)

    logger.warn("Validation Middleware Error", { path: c.req.path, details })

    return c.json(fail(ERROR_CODES.VALIDATION_ERROR, "Validation Failed", details), 422)
  }
}
