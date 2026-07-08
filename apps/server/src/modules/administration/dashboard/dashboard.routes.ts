import { requireRole, requireAuth, AppEnv } from "@/core/middleware"
import { Hono } from "hono"
import { DashboardController } from "./dashboard.controller"

export const adminDashboardRouter = new Hono<AppEnv>()
const controller = new DashboardController()

adminDashboardRouter.get("/", requireRole("admin"), (c) => controller.getDashboardData(c))
