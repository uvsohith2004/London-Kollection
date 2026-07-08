import { requireRole, requireAuth, AppEnv } from "@/core/middleware"
import { Hono } from "hono"
import { zValidator } from "@hono/zod-validator"
import { InvoicesController } from "./invoices.controller"
import { GenerateInvoiceSchema } from "./invoices.validate"

export const invoicesRouter = new Hono<AppEnv>()
export const adminInvoicesRouter = new Hono<AppEnv>()
const controller = new InvoicesController()

// Public / User Routes
invoicesRouter.get("/order/:orderId", requireAuth, (c) => controller.getByOrder(c))

// Admin Routes
adminInvoicesRouter.use("*", requireRole("admin"))
adminInvoicesRouter.get("/", (c) => controller.listAdmin(c))
adminInvoicesRouter.post("/generate", zValidator("json", GenerateInvoiceSchema), (c) => controller.generate(c))
