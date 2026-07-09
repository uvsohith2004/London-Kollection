import { requireRole, requireAuth, AppEnv } from "@/core/middleware"
import { Hono } from "hono"
import { zValidator } from "@hono/zod-validator"
import { UsersController } from "./users.controller"
import { UpdateProfileSchema, UpdateRoleSchema, ResendVerificationSchema, ProcessAvatarSchema } from "./users.validate"

export const usersRouter = new Hono<AppEnv>()
export const adminUsersRouter = new Hono<AppEnv>()
const controller = new UsersController()

// Public Routes
usersRouter.get("/check-email", (c) => controller.checkEmail(c))
usersRouter.post("/resend-verification", zValidator("json", ResendVerificationSchema), (c) => controller.resendVerification(c))

// User Routes
usersRouter.use("*", requireAuth)
usersRouter.get("/profile", (c) => controller.getProfile(c))
usersRouter.get("/accounts", (c) => controller.getAccounts(c))
usersRouter.put("/profile", zValidator("json", UpdateProfileSchema), (c) => controller.updateProfile(c))
usersRouter.post("/profile/avatar/process", (c) => controller.processAvatar(c))

// Admin Routes
adminUsersRouter.use("*", requireRole("admin"))
adminUsersRouter.get("/", (c) => controller.listAdmin(c)) // was /admin
adminUsersRouter.get("/search", (c) => controller.searchAdmin(c))
adminUsersRouter.patch("/:id/role", zValidator("json", UpdateRoleSchema), (c) => controller.updateRole(c)) // was /admin/:id/role
