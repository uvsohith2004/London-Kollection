import { MiddlewareHandler } from "hono"
import { RateLimitError } from "@/core/errors"

const rateLimitWindowMs = 60 * 1000 // 1 minute
const maxRequestsPerWindow = 1000
const ipRequestCounts = new Map<string, { count: number; resetTime: number }>()

export const rateLimiter: MiddlewareHandler = async (c, next) => {
  const ip = c.req.header("x-forwarded-for") || "local-ip"
  const now = Date.now()

  const record = ipRequestCounts.get(ip)

  if (!record || now > record.resetTime) {
    ipRequestCounts.set(ip, {
      count: 1,
      resetTime: now + rateLimitWindowMs,
    })
  } else {
    record.count++
    if (record.count > maxRequestsPerWindow) {
      throw new RateLimitError("Rate limit exceeded. Please try again later.")
    }
  }

  await next()
}
