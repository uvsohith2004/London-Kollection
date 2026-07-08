import { requireRole, requireAuth, AppEnv } from "@/core/middleware"
import { Hono } from "hono"
import { zValidator } from "@hono/zod-validator"
import { NotificationsController } from "./notifications.controller"
import { SubscribePushSchema, UnsubscribePushSchema, CreateCampaignSchema } from "./notifications.validate"

export const notificationsRouter = new Hono<AppEnv>()
export const adminNotificationsRouter = new Hono<AppEnv>()
const controller = new NotificationsController()

// Public Routes
notificationsRouter.post("/push/subscribe", zValidator("json", SubscribePushSchema), (c) => controller.subscribe(c))
notificationsRouter.post("/push/unsubscribe", zValidator("json", UnsubscribePushSchema), (c) => controller.unsubscribe(c))

// Admin Routes
adminNotificationsRouter.use("*", requireRole("admin"))
adminNotificationsRouter.post("/campaigns", zValidator("json", CreateCampaignSchema), (c) => controller.createCampaign(c))
adminNotificationsRouter.post("/campaigns/:id/send", (c) => controller.broadcastCampaign(c))
