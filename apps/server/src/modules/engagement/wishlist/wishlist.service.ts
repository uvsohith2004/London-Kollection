import db from "@/db"
import { wishlist } from "@/db/schemas"
import { eq, and } from "drizzle-orm"

export class WishlistService {
  async addToWishlist(userId: string, productId: string, variantId?: string | null) {
    const conditions = [eq(wishlist.userId, userId), eq(wishlist.productId, productId)]
    if (variantId) {
      conditions.push(eq(wishlist.variantId, variantId))
    }

    const existing = await db.query.wishlist.findFirst({
      where: and(...conditions),
    })

    if (existing) {
      return existing
    }

    const [added] = await db
      .insert(wishlist)
      .values({
        userId,
        productId,
        variantId: variantId || null,
      })
      .returning()

    return added
  }

  async removeFromWishlist(userId: string, productId: string) {
    const [deleted] = await db
      .delete(wishlist)
      .where(and(eq(wishlist.userId, userId), eq(wishlist.productId, productId)))
      .returning()
    return deleted || null
  }

  async listWishlist(userId: string) {
    return await db.query.wishlist.findMany({
      where: eq(wishlist.userId, userId),
      with: {
        product: {
          with: {
            images: true,
            variants: true,
          },
        },
        variant: true,
      },
    })
  }
}
