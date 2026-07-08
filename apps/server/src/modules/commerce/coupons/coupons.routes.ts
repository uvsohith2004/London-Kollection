import { requireRole, requireAuth, AppEnv } from "@/core/middleware"
import { Hono } from "hono"
import { zValidator } from "@hono/zod-validator"
import { CouponsController } from "./coupons.controller"
import { CreateCouponSchema, UpdateCouponSchema } from "./coupons.validate"

// There are no public coupon routes currently (applying is done via cart)
export const couponsRouter = new Hono<AppEnv>()
export const adminCouponsRouter = new Hono<AppEnv>()
const controller = new CouponsController()

// Admin Routes
adminCouponsRouter.use("*", requireRole("admin"))
adminCouponsRouter.get("/", (c) => controller.list(c))
adminCouponsRouter.post("/", zValidator("json", CreateCouponSchema), (c) => controller.create(c))
adminCouponsRouter.put("/:id", zValidator("json", UpdateCouponSchema), (c) => controller.update(c))
