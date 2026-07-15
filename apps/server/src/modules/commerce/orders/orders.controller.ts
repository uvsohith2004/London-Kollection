import { ok } from "@/core/response"
import { NotFoundError } from "@/core/errors"
import { Context } from "hono"
import { OrdersService } from "./orders.service"
import db from "@/db"
import { order } from "@/db/schemas"
import { desc } from "drizzle-orm"
import { transformOrder, transformOrderList } from "@/core/transformers/order.transformer"

export class OrdersController {
  private service = new OrdersService()

  async getUserOrders(c: Context) {
    const user = c.get("user")!
    const page = Number(c.req.query("page")) || 1
    const limit = Number(c.req.query("limit")) || 10
    const search = c.req.query("search")
    const status = c.req.query("status")

    const result = await this.service.getUserOrders(user.id, { page, limit, search, status })
    
    return c.json(ok({
      items: result.items.map(transformOrderList),
      hasMore: result.hasMore,
      total: result.total,
      counts: result.counts,
      nextCursor: result.nextCursor
    }))
  }

  async getOrderDetails(c: Context) {
    const user = c.get("user")!
    const id = c.req.param("id")!
    const rawItem = await this.service.getOrderDetails(id, user.id)
    const item = transformOrder(rawItem)
    return c.json(ok({ order: item }))
  }

  async cancelOrder(c: Context) {
    const user = c.get("user")!
    const id = c.req.param("id")!
    const body = c.req.valid("json" as never) as any
    const reason = body.reason
    const rawUpdated = await this.service.cancelOrder(id, reason, user.id)
    const updated = transformOrder(rawUpdated)
    return c.json(ok({ order: updated }))
  }

  async listAdmin(c: Context) {
    const page = Number(c.req.query("page")) || 1
    const limit = Number(c.req.query("limit")) || 25
    const search = c.req.query("search")
    const status = c.req.query("status")
    const paymentStatus = c.req.query("paymentStatus")
    const paymentMethod = c.req.query("paymentMethod")
    const dateFrom = c.req.query("dateFrom")
    const dateTo = c.req.query("dateTo")

    const result = await this.service.getAdminOrders({
      page,
      limit,
      search,
      status,
      paymentStatus,
      paymentMethod,
      dateFrom,
      dateTo
    })

    return c.json(ok({
      items: result.items.map(transformOrderList),
      hasMore: result.hasMore,
      total: result.total,
      counts: result.counts,
      nextCursor: result.nextCursor
    }))
  }

  async getAdminOrderDetails(c: Context) {
    const id = c.req.param("id")!
    const rawItem = await this.service.getOrderDetails(id)
    const item = transformOrder(rawItem)
    return c.json(ok({ order: item }))
  }

  async updateStatus(c: Context) {
    const admin = c.get("user")!
    const id = c.req.param("id")!
    const body = c.req.valid("json" as never) as any
    const rawUpdated = await this.service.updateOrder(id, body, admin.id)
    const updated = transformOrder(rawUpdated)
    return c.json(ok({ order: updated }))
  }

  async exportOrders(c: Context) {
    // Stub for exporting orders to CSV/Excel based on filters
    return c.json(ok({ url: "/exports/orders-export-stub.csv" }))
  }

  async downloadInvoice(c: Context) {
    const id = c.req.param("id")!
    // Stub for downloading a single invoice PDF
    return c.json(ok({ url: `/invoices/${id}.pdf` }))
  }

  async downloadBulkInvoices(c: Context) {
    // Stub for downloading bulk invoices as ZIP
    return c.json(ok({ url: `/invoices/bulk-export.zip` }))
  }
}
