import { NotFoundError, BadRequestError } from "@/core/errors"
import db from "@/db"
import { cart, order, orderItem, orderTimeline, product, productVariant, address } from "@/db/schemas"
import { eq, and, sql } from "drizzle-orm"

export class CheckoutService {
  async prepareOrder(userId: string, data: {
    cartId: string
    shippingAddressId: string
    billingAddressId?: string
  }) {
    return await db.transaction(async (tx) => {
      const activeCart = await tx.query.cart.findFirst({
        where: and(eq(cart.id, data.cartId), eq(cart.userId, userId)),
        with: { items: { with: { product: true, variant: true } } },
      })

      if (!activeCart || activeCart.items.length === 0) {
        throw new NotFoundError("Cart is empty or not found")
      }

   
      const shippingAddr = await tx.query.address.findFirst({
        where: and(eq(address.id, data.shippingAddressId), eq(address.userId, userId)),
      })

      if (!shippingAddr) {
        throw new NotFoundError("Shipping address not found")
      }

      let billingAddr = shippingAddr
      if (data.billingAddressId) {
        const customBilling = await tx.query.address.findFirst({
          where: and(eq(address.id, data.billingAddressId), eq(address.userId, userId)),
        })
        if (customBilling) {
          billingAddr = customBilling
        }
      }

    
      for (const item of activeCart.items) {
        const prod = item.product
        const variant = item.variant
        if (!prod || prod.archived) {
          throw new BadRequestError(`Product ${prod?.title || "Unknown"} is no longer available`)
        }
        if (!variant) {
           throw new BadRequestError(`Variant for product ${prod.title} is required`)
        }

        const qty = item.quantity

        // Perform atomic check and update
        const reservationResult = await tx
          .update(productVariant)
          .set({
            reservedStock: sql`${productVariant.reservedStock} + ${qty}`,
          })
          .where(
            and(
              eq(productVariant.id, variant.id),
              sql`${productVariant.stock} - ${productVariant.reservedStock} >= ${qty}`
            )
          )
          .returning()

        if (reservationResult.length === 0) {
          throw new BadRequestError(`Insufficient stock for product: ${prod.title}`)
        }
      }

      // 4. Calculate pricing totals on the server
      let subtotal = 0
      for (const item of activeCart.items) {
        const price = Number(item.variant?.price || item.product.price)
        const discount = Number(item.variant?.discountValue || item.product.discount || 0)
        const effectivePrice = Math.max(0, price - discount)
        subtotal += effectivePrice * item.quantity
      }

      // Dynamic lookup of settings later, mock values for now
      const taxRate = 0.20 // 20% VAT/Tax
      const taxAmount = subtotal * taxRate
      const shippingAmount = subtotal > 100 ? 0 : 10 // Free shipping threshold example
      const totalAmount = subtotal + taxAmount + shippingAmount

      const orderNumber = `LC-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`

      // 5. Create Pending Order
      const [newOrder] = await tx
        .insert(order)
        .values({
          userId,
          orderNumber,
          status: "pending",
          totalAmount: totalAmount.toFixed(2),
          taxAmount: taxAmount.toFixed(2),
          shippingAmount: shippingAmount.toFixed(2),
          discountAmount: "0.00",
          couponCode: activeCart.couponCode,
          shippingAddress: shippingAddr,
          billingAddress: billingAddr,
          giftNote: activeCart.giftNote,
        })
        .returning()

      // 6. Create Order Items (snapshotting product information)
      await tx.insert(orderItem).values(
        activeCart.items.map((item) => ({
          orderId: newOrder.id,
          productId: item.product.id,
          variantId: item.variantId,
          quantity: item.quantity,
          priceAtPurchase: String(item.variant?.price || item.product.price),
          discountAtPurchase: String(item.variant?.discountValue || item.product.discount || 0),
          productMetadata: {
            title: item.product.title,
            sku: item.variant?.sku || item.product.slug,
          },
        }))
      )

      // 7. Record status transition in timeline
      await tx.insert(orderTimeline).values({
        orderId: newOrder.id,
        status: "pending",
        description: "Order draft created and stock reserved successfully.",
        createdBy: userId,
      })

      // 8. Clear the cart
      await tx.delete(cart).where(eq(cart.id, activeCart.id))

      return newOrder
    })
  }
}
