import { ok } from "@/core/response"
import { NotFoundError } from "@/core/errors"
import { Context } from "hono"
import { OrdersService } from "./orders.service"
import db from "@/db"
import { order } from "@/db/schemas"
import { desc } from "drizzle-orm"

export class OrdersController {
  private service = new OrdersService()

  async getUserOrders(c: Context) {
    const user = c.get("user")!
    const items = await this.service.getUserOrders(user.id)
    return c.json(ok(items))
  }

  async getOrderDetails(c: Context) {
    const user = c.get("user")!
    const id = c.req.param("id")!
    const item = await this.service.getOrderDetails(id, user.id)
    if (!item) {
      throw new NotFoundError("Order not found")
    }
    return c.json(ok({ order: item }))
  }

  async listAdmin(c: Context) {
    const items = await db.query.order.findMany({
      orderBy: desc(order.createdAt),
    })
    return c.json(ok(items))
  }

  async getAdminOrderDetails(c: Context) {
    const id = c.req.param("id")!
    const item = await this.service.getOrderDetails(id)
    if (!item) {
      throw new NotFoundError("Order not found")
    }
    return c.json(ok({ order: item }))
  }

  async updateStatus(c: Context) {
    const admin = c.get("user")!
    const id = c.req.param("id")!
    const body = c.req.valid("json" as never) as any
    const updated = await this.service.updateOrder(id, body, admin.id)
    return c.json(ok({ order: updated }))
  }
}
