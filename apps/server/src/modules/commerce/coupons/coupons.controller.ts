import { ok } from "@/core/response"
import { NotFoundError } from "@/core/errors"
import { Context } from "hono"
import { CouponsService } from "./coupons.service"

export class CouponsController {
  private service = new CouponsService()

  async list(c: Context) {
    const items = await this.service.listCoupons()
    return c.json(ok(items))
  }

  async create(c: Context) {
    const body = c.req.valid("json" as never) as any
    const item = await this.service.createCoupon(body)
    return c.json(ok(item))
  }

  async update(c: Context) {
    const id = c.req.param("id")!
    const body = c.req.valid("json" as never) as any
    const item = await this.service.updateCoupon(id, body)
    if (!item) {
      throw new NotFoundError("Coupon not found")
    }
    return c.json(ok(item))
  }
}
