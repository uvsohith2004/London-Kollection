import { ok } from "@/core/response"
import { NotFoundError, BadRequestError } from "@/core/errors"
import { Context } from "hono"
import { CartService } from "./cart.service"

export class CartController {
  private service = new CartService()

  async getCart(c: Context) {
    const user = c.get("user")
    const guestCartId = c.req.header("x-guest-cart-id")
    const data = await this.service.getOrCreateCart(user?.id, guestCartId)
    if (!data) throw new NotFoundError("Cart not found")
    const summary = await this.service.calculateCartSummary(data.id)
    return c.json(ok({ cart: summary }))
  }

  async addItem(c: Context) {
    const user = c.get("user")
    const guestCartId = c.req.header("x-guest-cart-id")
    const body = c.req.valid("json" as never) as any

    const activeCart = await this.service.getOrCreateCart(user?.id, guestCartId)
    if (!activeCart) {
      throw new NotFoundError("Cart not found")
    }
    await this.service.addItemToCart(activeCart.id, body.productId, body.quantity, body.variantId)
    const summary = await this.service.calculateCartSummary(activeCart.id)
    return c.json(ok({ cart: summary }))
  }

  async updateItem(c: Context) {
    const user = c.get("user")
    const guestCartId = c.req.header("x-guest-cart-id")
    const itemId = c.req.param("itemId")!
    const body = c.req.valid("json" as never) as any

    const activeCart = await this.service.getOrCreateCart(user?.id, guestCartId)
    if (!activeCart) {
      throw new NotFoundError("Cart not found")
    }
    await this.service.updateCartItem(activeCart.id, itemId, body.quantity)
    const summary = await this.service.calculateCartSummary(activeCart.id)
    return c.json(ok({ cart: summary }))
  }

  async removeItem(c: Context) {
    const user = c.get("user")
    const guestCartId = c.req.header("x-guest-cart-id")
    const itemId = c.req.param("itemId")!

    const activeCart = await this.service.getOrCreateCart(user?.id, guestCartId)
    if (!activeCart) {
      throw new NotFoundError("Cart not found")
    }
    await this.service.removeItemFromCart(activeCart.id, itemId)
    const summary = await this.service.calculateCartSummary(activeCart.id)
    return c.json(ok({ cart: summary }))
  }

  async applyCoupon(c: Context) {
    const user = c.get("user")
    const guestCartId = c.req.header("x-guest-cart-id")
    const body = c.req.valid("json" as never) as any

    const activeCart = await this.service.getOrCreateCart(user?.id, guestCartId)
    if (!activeCart) {
      throw new NotFoundError("Cart not found")
    }
    await this.service.applyCoupon(activeCart.id, body.couponCode)
    const summary = await this.service.calculateCartSummary(activeCart.id)
    return c.json(ok({ cart: summary }))
  }

  async updateGiftNote(c: Context) {
    const user = c.get("user")
    const guestCartId = c.req.header("x-guest-cart-id")
    const body = c.req.valid("json" as never) as any

    const activeCart = await this.service.getOrCreateCart(user?.id, guestCartId)
    if (!activeCart) {
      throw new NotFoundError("Cart not found")
    }
    await this.service.updateGiftNote(activeCart.id, body.giftNote)
    const summary = await this.service.calculateCartSummary(activeCart.id)
    return c.json(ok({ cart: summary }))
  }

  async merge(c: Context) {
    const user = c.get("user")!
    const body = await c.req.json().catch(() => ({ items: [] }));
    const items = body.items || [];
    const mergedCart = await this.service.mergeCarts(user.id, items)
    const summary = await this.service.calculateCartSummary(mergedCart!.id)
    return c.json(ok({ cart: summary }))
  }

  async sync(c: Context) {
    const user = c.get("user")
    const guestCartId = c.req.header("x-guest-cart-id")
    const body = c.req.valid("json" as never) as any

    await this.service.syncCart(user?.id, guestCartId, body.items)
    // syncCart already returns calculateCartSummary actually, but let's just make it return normally
    const activeCart = await this.service.getOrCreateCart(user?.id, guestCartId)
    const summary = await this.service.calculateCartSummary(activeCart!.id)
    return c.json(ok({ cart: summary }))
  }
}
