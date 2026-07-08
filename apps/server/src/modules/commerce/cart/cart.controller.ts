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
    return c.json(ok({ cart: data }))
  }

  async addItem(c: Context) {
    const user = c.get("user")
    const guestCartId = c.req.header("x-guest-cart-id")
    const body = c.req.valid("json" as never) as any

    const activeCart = await this.service.getOrCreateCart(user?.id, guestCartId)
    if (!activeCart) {
      throw new NotFoundError("Cart not found")
    }
    const item = await this.service.addItemToCart(activeCart.id, body.productId, body.quantity, body.variantId)
    return c.json(ok(item))
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
    const item = await this.service.updateCartItem(activeCart.id, itemId, body.quantity)
    return c.json(ok(item))
  }

  async removeItem(c: Context) {
    const user = c.get("user")
    const guestCartId = c.req.header("x-guest-cart-id")
    const itemId = c.req.param("itemId")!

    const activeCart = await this.service.getOrCreateCart(user?.id, guestCartId)
    if (!activeCart) {
      throw new NotFoundError("Cart not found")
    }
    const item = await this.service.removeItemFromCart(activeCart.id, itemId)
    return c.json(ok(item))
  }

  async applyCoupon(c: Context) {
    const user = c.get("user")
    const guestCartId = c.req.header("x-guest-cart-id")
    const body = c.req.valid("json" as never) as any

    const activeCart = await this.service.getOrCreateCart(user?.id, guestCartId)
    if (!activeCart) {
      throw new NotFoundError("Cart not found")
    }
    const updated = await this.service.applyCoupon(activeCart.id, body.couponCode)
    return c.json(ok({ cart: updated }))
  }

  async updateGiftNote(c: Context) {
    const user = c.get("user")
    const guestCartId = c.req.header("x-guest-cart-id")
    const body = c.req.valid("json" as never) as any

    const activeCart = await this.service.getOrCreateCart(user?.id, guestCartId)
    if (!activeCart) {
      throw new NotFoundError("Cart not found")
    }
    const updated = await this.service.updateGiftNote(activeCart.id, body.giftNote)
    return c.json(ok({ cart: updated }))
  }

  async merge(c: Context) {
    const user = c.get("user")!
    const body = await c.req.json().catch(() => ({ items: [] }));
    const items = body.items || [];
    const mergedCart = await this.service.mergeCarts(user.id, items)
    return c.json(ok({ cart: mergedCart }))
  }

  async sync(c: Context) {
    const user = c.get("user")
    const guestCartId = c.req.header("x-guest-cart-id")
    const body = c.req.valid("json" as never) as any

    const syncedCart = await this.service.syncCart(user?.id, guestCartId, body.items)
    return c.json(ok({ cart: syncedCart }))
  }
}
