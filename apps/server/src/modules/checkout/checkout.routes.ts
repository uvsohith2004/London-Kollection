import { requireAuth, AppEnv } from "@/core/middleware"
import { Hono } from "hono"
import { zValidator } from "@hono/zod-validator"
import { CheckoutController } from "./checkout.controller"
import { PrepareOrderSchema, PreviewOrderSchema } from "@workspace/api-contracts"

export const checkoutRouter = new Hono<AppEnv>()
const controller = new CheckoutController()

checkoutRouter.post("/", zValidator("json", PrepareOrderSchema), (c) => controller.prepare(c))
checkoutRouter.post("/preview", zValidator("json", PreviewOrderSchema), (c) => controller.preview(c))
