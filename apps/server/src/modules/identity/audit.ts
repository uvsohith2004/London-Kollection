import { Context, MiddlewareHandler } from "hono"
import { AppEnv } from "@/core/middleware"
import { nanoid } from "nanoid"
import db from "@/db"
import { auditLog } from "@/db/schemas/audit.schema"

export const auditMiddleware = (action: string, resource: string): MiddlewareHandler<AppEnv> => {
  return async (c, next) => {
    // We capture the request info
    const user = c.get("user")
    const ipAddress = c.req.header("x-forwarded-for") || "local-ip"
    const userAgent = c.req.header("user-agent") || ""

    // We can capture the request body for tracking "new value" on POST/PUT
    let newValue = null
    if (["POST", "PUT", "PATCH"].includes(c.req.method)) {
      try {
        newValue = await c.req.json()
      } catch {
        // Not a JSON body or already parsed
      }
    }

    // Call the actual route handler
    await next()

    // Log the audit event asynchronously after the request
    if (user && c.res.status >= 200 && c.res.status < 400) {
      // Background task to insert audit log
      Promise.resolve().then(async () => {
        try {
          await db.insert(auditLog).values({
            id: nanoid(),
            userId: user.id,
            action,
            resource,
            ipAddress,
            userAgent,
            newValue: newValue ? JSON.stringify(newValue) : null,
          })
        } catch (err) {
          console.error("Failed to insert audit log:", err)
        }
      })
    }
  }
}
