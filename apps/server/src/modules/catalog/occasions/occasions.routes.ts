import { AppEnv } from "@/core/middleware"
import { Hono } from "hono"
import { OccasionsController } from "./occasions.controller"

export const occasionsRouter = new Hono<AppEnv>()
const controller = new OccasionsController()

// Public Routes
occasionsRouter.get("/", (c) => controller.list(c) as any)
occasionsRouter.get("/slug/:slug", (c) => controller.getBySlug(c) as any)
