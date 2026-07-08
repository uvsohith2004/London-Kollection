import { Context } from "hono"
import { NotFoundError } from "@/core/errors"
import { fail } from "@/core/response"
import { logger } from "@/core/utils/logger"

export const notFoundHandler = (c: Context) => {
  const error = new NotFoundError(`Route ${c.req.method} ${c.req.path} not found`)
  logger.warn(error.message, { path: c.req.path, method: c.req.method })
  return c.json(fail(error.code, error.message), error.statusCode as any)
}
