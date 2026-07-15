import { ok } from "@/core/response"
import { NotFoundError } from "@/core/errors"
import { Context } from "hono"
import { CouponsService } from "./coupons.service"
import { transformCoupon, transformCouponList } from "@/core/transformers/coupon.transformer"

export class CouponsController {
  private service = new CouponsService()

  async list(c: Context) {
    const rawItems = await this.service.listCoupons()
    const items = rawItems.map(transformCouponList)
    return c.json(ok(items))
  }

  async create(c: Context) {
    const body = c.req.valid("json" as never) as any
    const rawItem = await this.service.createCoupon(body)
    const item = transformCoupon(rawItem)
    return c.json(ok(item))
  }

  async update(c: Context) {
    const id = c.req.param("id")!
    const body = c.req.valid("json" as never) as any
    const rawItem = await this.service.updateCoupon(id, body)
    const item = transformCoupon(rawItem)
    return c.json(ok(item))
  }
}
