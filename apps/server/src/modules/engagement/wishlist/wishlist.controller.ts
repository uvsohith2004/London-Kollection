import { ok, fail, created, paginated } from "@/core/response"
import { Context } from "hono"
import { WishlistService } from "./wishlist.service"

export class WishlistController {
  private service = new WishlistService()

  async list(c: Context) {
    const user = c.get("user")!
    const items = await this.service.listWishlist(user.id)
    return c.json(ok(items))
  }

  async add(c: Context) {
    const user = c.get("user")!
    const body = c.req.valid("json" as never) as any
    const item = await this.service.addToWishlist(user.id, body.productId, body.variantId)
    return c.json(ok(item))
  }

  async remove(c: Context) {
    const user = c.get("user")!
    const productId = c.req.param("productId")!
    const item = await this.service.removeFromWishlist(user.id, productId)
    return c.json(ok(item))
  }
}
