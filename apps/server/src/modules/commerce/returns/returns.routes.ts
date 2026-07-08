import { requireRole, requireAuth, AppEnv } from "@/core/middleware"
import { Hono } from "hono"
import { zValidator } from "@hono/zod-validator"
import { ReturnsController } from "./returns.controller"
import { CreateReturnRequestSchema, UpdateReturnStatusSchema } from "./returns.validate"

export const returnsRouter = new Hono<AppEnv>()
export const adminReturnsRouter = new Hono<AppEnv>()
const controller = new ReturnsController()

// User Routes
returnsRouter.use("*", requireAuth)
returnsRouter.post("/", zValidator("json", CreateReturnRequestSchema), (c) => controller.createRequest(c))
returnsRouter.get("/", (c) => controller.getUserReturns(c))

// Admin Routes
adminReturnsRouter.use("*", requireRole("admin"))
adminReturnsRouter.get("/", (c) => controller.listAdmin(c))
adminReturnsRouter.put("/:id/status", zValidator("json", UpdateReturnStatusSchema), (c) => controller.updateStatus(c))
