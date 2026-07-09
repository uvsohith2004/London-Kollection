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

  async preview(c: Context) {
    const user = c.get("user")
    // Use user.id if logged in, otherwise "guest" or handle guest logic
    const userId = user?.id || "guest"
    const body = c.req.valid("json" as never) as any
    const summary = await this.checkoutService.previewOrder(userId, body)

    return c.json(ok(summary))
  }
}
