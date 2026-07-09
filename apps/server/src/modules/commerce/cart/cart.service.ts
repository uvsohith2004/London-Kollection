import { NotFoundError, BadRequestError } from "@/core/errors"
import db from "@/db"
import { cart, cartItem, product, productVariant, coupon } from "@/db/schemas"
import { eq, and, sql, inArray } from "drizzle-orm"
import { ProductsService } from "../../catalog/products/products.service"
import { pricingEngine } from "../../catalog/pricing/pricing.service"

export class CartService {
  async getOrCreateCart(userId?: string, guestCartId?: string) {
    const expiration = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) 

    if (userId) {
      const existingUserCart = await db.query.cart.findFirst({
        where: eq(cart.userId, userId),
        with: { items: { with: { product: { with: { images: true } }, variant: true } } },
      })
      if (existingUserCart) {
       
        await db.update(cart).set({ expiresAt: expiration }).where(eq(cart.id, existingUserCart.id))
        return existingUserCart
      }

      
      if (guestCartId) {
        const [associated] = await db
          .update(cart)
          .set({ userId, expiresAt: expiration, updatedAt: new Date() })
          .where(eq(cart.id, guestCartId))
          .returning()
        if (associated) {
          return await db.query.cart.findFirst({
            where: eq(cart.id, associated.id),
            with: { items: { with: { product: { with: { images: true } }, variant: true } } },
          })
        }
      }

      // Create new cart for user
      const [newCart] = await db
        .insert(cart)
        .values({
          userId,
          expiresAt: expiration,
        })
        .returning()
      return { ...newCart, items: [] }
    }

    if (guestCartId) {
      const existingGuestCart = await db.query.cart.findFirst({
        where: eq(cart.id, guestCartId),
        with: { items: { with: { product: { with: { images: true } }, variant: true } } },
      })
      if (existingGuestCart) {
        // Extend expiration
        await db.update(cart).set({ expiresAt: expiration }).where(eq(cart.id, existingGuestCart.id))
        return existingGuestCart
      }
    }

    // Create brand new guest cart
    const [newCart] = await db
      .insert(cart)
      .values({
        expiresAt: expiration,
      })
      .returning()
    return { ...newCart, items: [] }
  }

  async getCartDetails(cartId: string) {
    return await db.query.cart.findFirst({
      where: eq(cart.id, cartId),
      with: { items: { with: { product: { with: { images: true } }, variant: true } } },
    })
  }

  async addItemToCart(cartId: string, productId: string, quantity: number, variantId?: string | null) {
    const prod = await db.query.product.findFirst({
      where: eq(product.id, productId),
    })

    if (!prod) {
      throw new NotFoundError("Product not found")
    }
    if (variantId) {
      const variant = await db.query.productVariant.findFirst({
        where: eq(productVariant.id, variantId),
      })
      if (!variant) {
        throw new NotFoundError("Variant not found")
      }
      if (variant.stock < quantity) {
        throw new BadRequestError("Insufficient stock available")
      }
    }

    const conditions = [eq(cartItem.cartId, cartId), eq(cartItem.productId, productId)]
    if (variantId) {
      conditions.push(eq(cartItem.variantId, variantId))
    }

    const existingItem = await db.query.cartItem.findFirst({
      where: and(...conditions),
    })

    if (existingItem) {
      const newQty = existingItem.quantity + quantity
      if (variantId) {
        const variant = await db.query.productVariant.findFirst({
          where: eq(productVariant.id, variantId),
        })
        if (variant && variant.stock < newQty) {
          throw new BadRequestError("Insufficient stock available")
        }
      }
      const [updated] = await db
        .update(cartItem)
        .set({ quantity: newQty, updatedAt: new Date() })
        .where(eq(cartItem.id, existingItem.id))
        .returning()
      return updated
    }

    const [newItem] = await db
      .insert(cartItem)
      .values({
        cartId,
        productId,
        variantId: variantId || null,
        quantity,
      })
      .returning()

    return newItem
  }

  async updateCartItem(cartId: string, itemId: string, quantity: number) {
    if (quantity <= 0) {
      return this.removeItemFromCart(cartId, itemId)
    }

    const item = await db.query.cartItem.findFirst({
      where: and(eq(cartItem.id, itemId), eq(cartItem.cartId, cartId)),
      with: { variant: true },
    })

    if (!item) {
      throw new NotFoundError("Cart item not found")
    }

    // Check variant stock if variant exists
    if (item.variant) {
      const diff = quantity - item.quantity
      if (diff > 0 && item.variant.stock < quantity) {
        throw new BadRequestError("Insufficient stock available")
      }
    }

    const [updated] = await db
      .update(cartItem)
      .set({ quantity, updatedAt: new Date() })
      .where(eq(cartItem.id, itemId))
      .returning()

    return updated
  }

  async removeItemFromCart(cartId: string, itemId: string) {
    const [deleted] = await db
      .delete(cartItem)
      .where(and(eq(cartItem.id, itemId), eq(cartItem.cartId, cartId)))
      .returning()
    return deleted || null
  }

  async applyCoupon(cartId: string, couponCode: string | null) {
    if (couponCode) {
      const dbCoupon = await db.query.coupon.findFirst({
        where: eq(coupon.code, couponCode.toUpperCase()),
      })

      if (!dbCoupon) {
        throw new BadRequestError("Invalid coupon code")
      }

      if (!dbCoupon.active) {
        throw new BadRequestError("Coupon is no longer active")
      }

      const now = new Date()
      if (now < dbCoupon.startDate || now > dbCoupon.endDate) {
        throw new BadRequestError("Coupon is expired or not yet active")
      }

      if (dbCoupon.usageLimit > 0 && dbCoupon.usageCount >= dbCoupon.usageLimit) {
        throw new BadRequestError("Coupon usage limit reached")
      }
    }

    const [updated] = await db
      .update(cart)
      .set({ couponCode: couponCode ? couponCode.toUpperCase() : null, updatedAt: new Date() })
      .where(eq(cart.id, cartId))
      .returning()
    return updated || null
  }

  async updateGiftNote(cartId: string, giftNote: string | null) {
    const [updated] = await db
      .update(cart)
      .set({ giftNote, updatedAt: new Date() })
      .where(eq(cart.id, cartId))
      .returning()
    return updated || null
  }

  async mergeCarts(authUserId: string, items: Array<{ productId: string, variantId?: string | null, quantity: number }>) {
    const userCart = await this.getOrCreateCart(authUserId)
    if (!userCart) {
      throw new BadRequestError("Could not find or create cart for user")
    }

    if (!items || items.length === 0) {
      return userCart
    }

    return await db.transaction(async (tx) => {
      for (const item of items) {
        const conditions = [eq(cartItem.cartId, userCart.id), eq(cartItem.productId, item.productId)]
        if (item.variantId) {
          conditions.push(eq(cartItem.variantId, item.variantId))
        }

        const existing = await tx.query.cartItem.findFirst({
          where: and(...conditions),
        })

        if (existing) {
          await tx
            .update(cartItem)
            .set({
              quantity: Math.max(existing.quantity, item.quantity),
              updatedAt: new Date(),
            })
            .where(eq(cartItem.id, existing.id))
        } else {
          await tx.insert(cartItem).values({
            cartId: userCart.id,
            productId: item.productId,
            variantId: item.variantId || null,
            quantity: item.quantity,
          })
        }
      }

      // Return fully updated user cart details
      return await tx.query.cart.findFirst({
        where: eq(cart.id, userCart.id),
        with: { items: { with: { product: { with: { images: true } }, variant: true } } },
      })
    })
  }

  async syncCart(userId: string | undefined, guestCartId: string | undefined, items: Array<{ productId: string, variantId?: string | null, quantity: number }>) {
    const activeCart = await this.getOrCreateCart(userId, guestCartId)
    
    if (!activeCart) {
      throw new BadRequestError("Could not find or create cart")
    }

    await db.transaction(async (tx) => {
      await tx.delete(cartItem).where(eq(cartItem.cartId, activeCart.id))
      

      if (items && items.length > 0) {
        const insertValues = items.map(item => ({
          cartId: activeCart.id,
          productId: item.productId,
          variantId: item.variantId || null,
          quantity: item.quantity,
        }))
        await tx.insert(cartItem).values(insertValues)
      }
      
      // 3. Update cart timestamp
      await tx.update(cart).set({ updatedAt: new Date() }).where(eq(cart.id, activeCart.id))
    })

    return this.calculateCartSummary(activeCart.id)
  }

  async calculateCartSummary(cartId: string) {
    const activeCart = await this.getCartDetails(cartId)
    if (!activeCart) return null

    const productsService = new ProductsService()

    let subtotal = 0
    let discountTotal = 0
    let taxTotal = 0
    const deliveryFee = 0 // Placeholder for future integration

    const hydratedItems = await Promise.all(activeCart.items.map(async (item) => {
      // 1. Fetch live product data
      let liveProduct = await productsService.getProductById(item.productId)
      
      // 2. Apply Global Flash Sale Pricing
      if (liveProduct) {
        liveProduct = await pricingEngine.applyGlobalPricingSingle(liveProduct)
      }

      if (!liveProduct) {
        // Product no longer exists or isn't published
        return {
          ...item,
          productName: "Unavailable Product",
          productSlug: "",
          sku: "",
          quantity: item.quantity,
          unitPrice: 0,
          discountValue: 0,
          subtotal: 0,
          isAvailable: false,
          optionValues: {},
        }
      }

      // 3. Resolve Variant or Base Product
      let variantData = null
      let optionValues = {}
      let sku = liveProduct.sku || ""
      
      if (item.variantId) {
        variantData = liveProduct.variants?.find(v => v.id === item.variantId)
        if (variantData) {
          optionValues = variantData.optionValues || {}
          sku = variantData.sku || sku
        }
      }

      // 4. Resolve Pricing
      const unitPrice = variantData ? variantData.price : liveProduct.price
      const compareAtPrice = variantData ? variantData.compareAtPrice : liveProduct.compareAtPrice
      const itemSubtotal = unitPrice * item.quantity

      // 5. Check Availability (Stock)
      const stock = variantData ? variantData.stock : liveProduct.variants?.[0]?.stock || 0
      const isAvailable = stock >= item.quantity

      // 6. Tax Calculation
      // If the product has a taxClass, we calculate it. 
      // (Assuming taxClass has a rate property, e.g. 0.05 for 5%)
      let itemTax = 0
      if (liveProduct.taxClass?.rate) {
        itemTax = itemSubtotal * Number(liveProduct.taxClass.rate)
      }

      subtotal += itemSubtotal
      taxTotal += itemTax
      
      // We don't separately add to discountTotal right now since the unitPrice is the final price.
      // But if we want to show total savings:
      if (compareAtPrice && compareAtPrice > unitPrice) {
        discountTotal += (compareAtPrice - unitPrice) * item.quantity
      }

      // 7. Resolve Image
      let image = variantData?.images?.[0]?.url || liveProduct.images?.[0]?.url

      return {
        id: item.id,
        productId: item.productId,
        variantId: item.variantId,
        productName: liveProduct.title,
        productSlug: liveProduct.slug,
        sku,
        image,
        optionValues,
        quantity: item.quantity,
        unitPrice,
        compareAtPrice,
        discountValue: compareAtPrice ? compareAtPrice - unitPrice : 0,
        subtotal: itemSubtotal,
        isAvailable,
        stock,
      }
    }))

    const grandTotal = subtotal + taxTotal + deliveryFee

    return {
      id: activeCart.id,
      items: hydratedItems,
      subtotal,
      taxTotal,
      discountTotal,
      deliveryFee,
      grandTotal,
      couponCode: activeCart.couponCode,
    }
  }
}
