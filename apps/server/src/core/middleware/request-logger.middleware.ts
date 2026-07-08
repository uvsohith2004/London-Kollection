import { MiddlewareHandler } from "hono"
import { logger } from "@/core/utils/logger"

export const requestLoggerMiddleware: MiddlewareHandler = async (c, next) => {
  const start = Date.now()
  const reqId = c.get("requestId")

  logger.info(`[REQ] ${c.req.method} ${c.req.path}`, { reqId })

  await next()

  const ms = Date.now() - start
  logger.info(`[RES] ${c.req.method} ${c.req.path} - Status: ${c.res.status} - ${ms}ms`, { reqId })
}
