import { requireRole, requireAuth, AppEnv } from "@/core/middleware"
import { Hono } from "hono"
import { zValidator } from "@hono/zod-validator"
import { OrdersController } from "./orders.controller"
import { UpdateOrderStatusSchema, CancelOrderSchema } from "@workspace/api-contracts"

export const ordersRouter = new Hono<AppEnv>()
export const adminOrdersRouter = new Hono<AppEnv>()
const controller = new OrdersController()

// User Routes
ordersRouter.use("*", requireAuth)
ordersRouter.get("/", (c) => controller.getUserOrders(c))
ordersRouter.get("/:id", (c) => controller.getOrderDetails(c))
ordersRouter.post("/:id/cancel", zValidator("json", CancelOrderSchema), (c) => controller.cancelOrder(c))

// Admin Routes
adminOrdersRouter.use("*", requireRole("admin"))
adminOrdersRouter.get("/", (c) => controller.listAdmin(c)) // was /admin/list
adminOrdersRouter.get("/export", (c) => controller.exportOrders(c))
adminOrdersRouter.get("/invoices/bulk", (c) => controller.downloadBulkInvoices(c))
adminOrdersRouter.get("/:id", (c) => controller.getAdminOrderDetails(c)) // was /admin/:id
adminOrdersRouter.get("/:id/invoice", (c) => controller.downloadInvoice(c))
adminOrdersRouter.put("/:id/status", zValidator("json", UpdateOrderStatusSchema), (c) => controller.updateStatus(c)) // was /admin/:id/status
