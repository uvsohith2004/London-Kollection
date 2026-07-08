import { MiddlewareHandler } from "hono"
import { auth } from "@/config/auth"
import { UnauthorizedError, ForbiddenError } from "@/core/errors"

export type AppEnv = {
  Variables: {
    user: typeof auth.$Infer.Session.user | null
    session: typeof auth.$Infer.Session.session | null
  }
}

export const sessionMiddleware: MiddlewareHandler = async (c, next) => {
  try {
    const session = await auth.api.getSession({ headers: c.req.raw.headers })
    if (!session) {
      c.set("user", null)
      c.set("session", null)
    } else {
      c.set("user", session.user)
      c.set("session", session.session)
    }
  } catch (err) {
    c.set("user", null)
    c.set("session", null)
  }
  await next()
}

export const requireAuth: MiddlewareHandler = async (c, next) => {
  const user = c.get("user")
  if (!user) {
    throw new UnauthorizedError("You must be logged in to perform this action.")
  }
  await next()
}

export const requireRole = (role: string): MiddlewareHandler => {
  return async (c, next) => {
    const user = c.get("user")
    if (!user) {
      throw new UnauthorizedError(
        "You must be logged in to perform this action."
      )
    }
    if (user.role !== role && user.role !== "admin") {
      throw new ForbiddenError(
        "You do not have permission to perform this action."
      )
    }
    await next()
  }
}
