import { Hono } from "hono"
import { EmailAdminController } from "./email.controller"

export const emailAdminRouter = new Hono()
const controller = new EmailAdminController()

emailAdminRouter.get("/config", (c) => controller.getConfig(c))
emailAdminRouter.put("/config", (c) => controller.updateConfig(c))
emailAdminRouter.get("/health", (c) => controller.getHealthMetrics(c))
emailAdminRouter.post("/test", (c) => controller.sendTestEmail(c))
