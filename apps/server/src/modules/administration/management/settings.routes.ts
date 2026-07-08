import { requireRole, requireAuth, AppEnv } from "@/core/middleware"
import { Hono } from "hono"
import { zValidator } from "@hono/zod-validator"
import { SettingsController } from "./settings.controller"
import { UpdateSettingSchema } from "./settings.validate"
import { auditMiddleware } from "../../identity/audit"

export const settingsRouter = new Hono<AppEnv>()
const controller = new SettingsController()

// Apply settings.read RBAC guard globally to this router (except updates)
settingsRouter.use("/", requireRole("admin"))
settingsRouter.get("/", (c) => controller.getAllSettings(c))

// 1.5 Bulk Update Settings
settingsRouter.put("/", requireRole("admin"), auditMiddleware("UPDATE", "settings"), (c) => controller.bulkUpdateSettings(c))

// 2. Update dynamic setting key
settingsRouter.put("/:key", requireRole("admin"), auditMiddleware("UPDATE", "settings"), zValidator("json", UpdateSettingSchema), (c) => controller.updateSetting(c))
