import { requireAuth, AppEnv } from "@/core/middleware"
import { Hono } from "hono"
import { zValidator } from "@hono/zod-validator"
import { CheckoutController } from "./checkout.controller"
import { PrepareOrderSchema } from "./checkout.validate"

export const checkoutRouter = new Hono<AppEnv>()
const controller = new CheckoutController()

checkoutRouter.post("/", requireAuth, zValidator("json", PrepareOrderSchema), (c) => controller.prepare(c))
