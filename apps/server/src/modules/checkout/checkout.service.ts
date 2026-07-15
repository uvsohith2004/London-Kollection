import { NotFoundError, BadRequestError } from "@/core/errors"
import db from "@/db"
import { cart, order, orderItem, orderTimeline, product, productVariant, address } from "@/db/schemas"
import { eq, and, sql } from "drizzle-orm"
import { transformProduct } from "@/core/transformers/product.transformer"

export class CheckoutService {
  private async rotateDefaultVariant(tx: any, productId: string, currentVariantId: string) {
    await tx.update(productVariant)
      .set({ isDefault: false })
      .where(eq(productVariant.id, currentVariantId))

    const variants = await tx.query.productVariant.findMany({
      where: eq(productVariant.productId, productId)
    })
    
    const nextVariant = variants.find((v: any) => v.id !== currentVariantId && v.stock > 0)
    
    if (nextVariant) {
      await tx.update(productVariant)
        .set({ isDefault: true })
        .where(eq(productVariant.id, nextVariant.id))
    }
    
    const { cache } = await import("@/cache")
    await cache.invalidatePattern("products:*")
  }

  async prepareOrder(userId: string, data: {
    cartId: string
    shippingAddressId: string
    billingAddressId?: string
  }) {
    return await db.transaction(async (tx) => {
      const activeCart = await tx.query.cart.findFirst({
        where: eq(cart.id, data.cartId),
        with: { items: { with: { product: true, variant: true } } },
      })

      if (!activeCart || activeCart.items.length === 0) {
        throw new NotFoundError("Cart is empty or not found")
      }

      if (activeCart.userId && activeCart.userId !== userId) {
        if (userId !== "guest") {
          throw new BadRequestError("Unauthorized cart access")
        }
      }

      const shippingAddr = await tx.query.address.findFirst({
        where: userId === "guest" ? eq(address.id, data.shippingAddressId) : and(eq(address.id, data.shippingAddressId), eq(address.userId, userId)),
      })

      if (!shippingAddr) {
        throw new NotFoundError("Shipping address not found")
      }

      let billingAddr = shippingAddr
      if (data.billingAddressId) {
        const customBilling = await tx.query.address.findFirst({
          where: userId === "guest" ? eq(address.id, data.billingAddressId) : and(eq(address.id, data.billingAddressId), eq(address.userId, userId)),
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

        // Perform atomic check and update on actual stock
        const reservationResult = await tx
          .update(productVariant)
          .set({
            stock: sql`${productVariant.stock} - ${qty}`,
          })
          .where(
            and(
              eq(productVariant.id, variant.id),
              sql`${productVariant.stock} >= ${qty}`
            )
          )
          .returning()

        if (reservationResult.length === 0) {
          throw new BadRequestError(`Insufficient stock for product: ${prod.title}. Please review your cart.`)
        }

        const updatedVariant = reservationResult[0]
        if (updatedVariant.stock === 0 && updatedVariant.isDefault) {
          await this.rotateDefaultVariant(tx, prod.id, updatedVariant.id)
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

      // Dynamic Tax Logic based on Shipping Country
      let taxAmount = 0
      const applicableRules = await tx.query.taxRule.findMany({
        with: { taxRate: true }
      })
      const countryRules = applicableRules.filter(r => 
        r.taxRate && r.taxRate.countryCode === shippingAddr.country
      )

      for (const item of activeCart.items) {
        const prod = item.product
        const variant = item.variant
        const unitPrice = Number(variant?.price || prod.price)
        const discount = Number(variant?.discountValue || prod.discount || 0)
        const effectivePrice = Math.max(0, unitPrice - discount)
        const itemSubtotal = effectivePrice * item.quantity

        if (prod.taxClassId) {
          const rule = countryRules.find(r => r.taxClassId === prod.taxClassId)
          if (rule && rule.taxRate) {
            const percentage = Number(rule.taxRate.percentage) || 0
            taxAmount += itemSubtotal * (percentage / 100)
          }
        }
      }

      const shippingAmount = subtotal > 100 ? 0 : 10 // Free shipping threshold example
      const totalAmount = subtotal + taxAmount + shippingAmount

      const { SettingsService } = await import("../administration/management/settings.service")
      const settingsService = new SettingsService()
      const settings = await settingsService.getSettings()
      const prefixSetting = settings?.orderPrefix
      const prefix = prefixSetting ? String(prefixSetting).toUpperCase() : "LC"
      
      const randomDigits = Math.floor(100000 + Math.random() * 900000)
      const orderNumber = `${prefix}-${randomDigits}`
      // 5. Create Pending Order
      const [newOrder] = await tx
        .insert(order)
        .values({
          userId: userId === "guest" ? null : userId,
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
            slug: item.product.slug,
            sku: item.variant?.sku || item.product.slug,
            image: (item.product as any).images?.[0] || null,
          },
        }))
      )

      // 7. Record status transition in timeline
      await tx.insert(orderTimeline).values({
        orderId: newOrder.id,
        status: "pending",
        description: "Order draft created and stock deducted successfully.",
        createdBy: userId === "guest" ? "Guest User" : userId,
      })

      // 8. Clear the cart
      await tx.delete(cart).where(eq(cart.id, activeCart.id))

      return newOrder
    })
  }
  async previewOrder(userId: string, data: { cartId: string; shippingCountryCode: string }) {
    const activeCart = await db.query.cart.findFirst({
      where: eq(cart.id, data.cartId),
      with: { items: { with: { product: { with: { taxClass: true } }, variant: true } } },
    })

    if (!activeCart || activeCart.items.length === 0) {
      throw new NotFoundError("Cart is empty or not found")
    }
    if (activeCart.userId && activeCart.userId !== userId) {
      if (userId !== "guest") {
        throw new BadRequestError("Unauthorized cart access")
      }
    }

    const { ProductsService } = await import("../catalog/products/products.service")
    const { pricingEngine } = await import("../catalog/pricing/pricing.service")
    const { taxRule } = await import("@/db/schemas")
    const { taxRate } = await import("@/db/schemas")

    const productsService = new ProductsService()

    let subtotal = 0
    let taxTotal = 0
    let discountTotal = 0
    const deliveryFee = 0 // Mock for now

    // Fetch all applicable tax rules for this country once
    const applicableRules = await db.query.taxRule.findMany({
      with: { taxRate: true }
    })
    
    // Filter to those that match the country code
    const countryRules = applicableRules.filter(r => 
      r.taxRate && r.taxRate.countryCode === data.shippingCountryCode
    )

    for (const item of activeCart.items) {
      let rawProduct = await productsService.getProductById(item.productId)
      if (rawProduct) rawProduct = await pricingEngine.applyGlobalPricingSingle(rawProduct as any)
      if (!rawProduct) continue

      let variantData = null
      if (item.variantId) variantData = rawProduct.variants?.find((v: any) => v.id === item.variantId)

      const unitPrice = Number(variantData ? variantData.price : rawProduct.price)
      const compareAtPrice = Number(variantData ? variantData.compareAtPrice : (rawProduct as any).compareAtPrice) || 0
      const itemSubtotal = unitPrice * item.quantity
      subtotal += itemSubtotal

      if (compareAtPrice > unitPrice) {
        discountTotal += (compareAtPrice - unitPrice) * item.quantity
      }

      // Dynamic Tax Logic
      let itemTax = 0
      if (rawProduct.taxClassId) {
        // Find if there is a tax rule for this product's tax class and the customer's country
        const rule = countryRules.find(r => r.taxClassId === rawProduct?.taxClassId)
        if (rule && rule.taxRate) {
          const percentage = Number(rule.taxRate.percentage) || 0
          itemTax = itemSubtotal * (percentage / 100)
        }
      }
      taxTotal += itemTax
    }

    const grandTotal = subtotal + taxTotal + deliveryFee

    return {
      subtotal,
      taxTotal,
      discountTotal,
      deliveryFee,
      grandTotal,
    }
  }
}
