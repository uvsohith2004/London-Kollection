import { requireRole, AppEnv } from "@/core/middleware"
import { Hono } from "hono"
import { SettingsController } from "./settings.controller"
import { auditMiddleware } from "../../identity/audit"

export const settingsRouter = new Hono<AppEnv>()
const controller = new SettingsController()

settingsRouter.use("/", requireRole("admin"))
settingsRouter.get("/", (c) => controller.getSettings(c))
settingsRouter.put("/", requireRole("admin"), auditMiddleware("UPDATE", "settings"), (c) => controller.updateSettings(c))
