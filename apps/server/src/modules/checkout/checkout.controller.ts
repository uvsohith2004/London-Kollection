import { ok, fail, created, paginated } from "@/core/response"
import { Context } from "hono"
import { CheckoutService } from "./checkout.service"

export class CheckoutController {
  private checkoutService = new CheckoutService()

  async prepare(c: Context) {
    const user = c.get("user")!
    const body = c.req.valid("json" as never) as any
    const pendingOrder = await this.checkoutService.prepareOrder(user.id, body)

    return c.json(ok({ order: pendingOrder, }))
  }
}
