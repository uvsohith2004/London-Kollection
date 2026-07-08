import { MiddlewareHandler } from "hono"
import { nanoid } from "nanoid"

export const requestIdMiddleware: MiddlewareHandler = async (c, next) => {
  const reqId = c.req.header("X-Request-Id") || nanoid()
  c.set("requestId", reqId)
  
  await next()
  
  c.header("X-Request-Id", reqId)
}
