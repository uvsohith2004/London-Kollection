import db from "@/db"
import {
  userProductHistory,
  userSearchHistory,
} from "@/db/schemas/history.schema"
import { order, orderItem } from "@/db/schemas/orders.schema"
import { product } from "@/db/schemas/products.schema"
import { eq, and, desc, inArray, notInArray, ilike, or } from "drizzle-orm"

export class HistoryService {
  async trackProductView(userId: string, productId: string) {
    const existing = await db.query.userProductHistory.findFirst({
      where: and(
        eq(userProductHistory.userId, userId),
        eq(userProductHistory.productId, productId)
      ),
    })

    if (existing) {
      if (existing.isArchived) {
        await db
          .update(userProductHistory)
          .set({
            viewCount: existing.viewCount + 1,
            lastViewedAt: new Date(),
            isArchived: false,
          })
          .where(eq(userProductHistory.id, existing.id))
      } else {
        await db
          .update(userProductHistory)
          .set({ viewCount: existing.viewCount + 1, lastViewedAt: new Date() })
          .where(eq(userProductHistory.id, existing.id))
      }
    } else {
      await db.insert(userProductHistory).values({
        userId,
        productId,
        viewCount: 1,
      })
    }
  }

  async trackSearch(userId: string, searchTerm: string) {
    const term = searchTerm.trim().toLowerCase()
    if (!term) return

    const existing = await db.query.userSearchHistory.findFirst({
      where: and(
        eq(userSearchHistory.userId, userId),
        eq(userSearchHistory.searchTerm, term)
      ),
    })

    if (existing) {
      if (existing.isArchived) {
        await db
          .update(userSearchHistory)
          .set({
            searchCount: existing.searchCount + 1,
            lastSearchedAt: new Date(),
            isArchived: false,
          })
          .where(eq(userSearchHistory.id, existing.id))
      } else {
        await db
          .update(userSearchHistory)
          .set({
            searchCount: existing.searchCount + 1,
            lastSearchedAt: new Date(),
          })
          .where(eq(userSearchHistory.id, existing.id))
      }
    } else {
      await db.insert(userSearchHistory).values({
        userId,
        searchTerm: term,
        searchCount: 1,
      })
    }
  }

  async trackBatch(
    userId: string,
    productIds: string[],
    searchTerms: string[]
  ) {
    // Process uniquely to avoid duplication in same batch
    for (const pid of new Set(productIds)) {
      await this.trackProductView(userId, pid)
    }
    for (const term of new Set(searchTerms)) {
      await this.trackSearch(userId, term)
    }
  }

  async getHistory(userId: string, limit = 20) {
    const productViews = await db.query.userProductHistory.findMany({
      where: and(
        eq(userProductHistory.userId, userId),
        eq(userProductHistory.isArchived, false)
      ),
      orderBy: [desc(userProductHistory.lastViewedAt)],
      limit,
      with: {
        product: {
          with: { images: true },
        },
      },
    })

    const searches = await db.query.userSearchHistory.findMany({
      where: and(
        eq(userSearchHistory.userId, userId),
        eq(userSearchHistory.isArchived, false)
      ),
      orderBy: [desc(userSearchHistory.lastSearchedAt)],
      limit,
    })

    return { productViews, searches }
  }

  async archiveProductHistory(userId: string, historyId: string) {
    await db
      .update(userProductHistory)
      .set({ isArchived: true })
      .where(
        and(
          eq(userProductHistory.id, historyId),
          eq(userProductHistory.userId, userId)
        )
      )
  }

  async archiveSearchHistory(userId: string, historyId: string) {
    await db
      .update(userSearchHistory)
      .set({ isArchived: true })
      .where(
        and(
          eq(userSearchHistory.id, historyId),
          eq(userSearchHistory.userId, userId)
        )
      )
  }

  async getRecommendedProducts(userId: string | null, limit = 20, offset = 0) {
    if (!userId) {
      // Fallback to latest products if no user
      const products = await db.query.product.findMany({
        where: (p, { eq }) => eq(p.published, true),
        orderBy: (p, { desc }) => [desc(p.createdAt)],
        limit,
        offset,
        with: { images: true },
      })
      return {
        items: products,
        nextOffset: products.length === limit ? offset + limit : null,
      }
    }

    // 1. Fetch user's view history
    const userViews = await db.query.userProductHistory.findMany({
      where: eq(userProductHistory.userId, userId),
      orderBy: [desc(userProductHistory.lastViewedAt)],
      limit: 20,
      with: { product: true },
    })

    // 2. Fetch user's search history
    const userSearches = await db.query.userSearchHistory.findMany({
      where: eq(userSearchHistory.userId, userId),
      orderBy: [desc(userSearchHistory.lastSearchedAt)],
      limit: 10,
    })

    // 3. Fetch user's past orders
    const userOrders = await db.query.order.findMany({
      where: eq(order.userId, userId),
      with: {
        items: {
          with: { product: true },
        },
      },
      limit: 10,
    })

    // Extract preferred categories
    const categoryIds = new Set<string>()
    const viewedProductIds = new Set<string>()
    const purchasedProductIds = new Set<string>()

    userViews.forEach((v) => {
      if (v.product?.categoryId) categoryIds.add(v.product.categoryId)
      viewedProductIds.add(v.productId)
    })

    userOrders.forEach((o) => {
      o.items.forEach((item) => {
        if (item.product?.categoryId) categoryIds.add(item.product.categoryId)
        if (item.productId) purchasedProductIds.add(item.productId)
      })
    })

    // Determine query conditions
    const conditions = [eq(product.published, true)]

    // Exclude purchased products from recommendations
    if (purchasedProductIds.size > 0) {
      conditions.push(notInArray(product.id, Array.from(purchasedProductIds)))
    }

    // Build the recommendation preference condition
    const preferenceConditions = []

    if (categoryIds.size > 0) {
      preferenceConditions.push(
        inArray(product.categoryId, Array.from(categoryIds))
      )
    }

    userSearches.forEach((search) => {
      // Basic matching against title
      preferenceConditions.push(ilike(product.title, `%${search.searchTerm}%`))
    })

    if (preferenceConditions.length > 0) {
      const orCond = or(...preferenceConditions)
      if (orCond) {
        conditions.push(orCond)
      }
    }

    let recommended = await db.query.product.findMany({
      where: and(...conditions),
      limit,
      offset,
      orderBy: [desc(product.createdAt)], // Order by newest among matches
      with: { images: true },
    })

    // If we didn't find enough recommendations based on history, fill with trending/latest
    if (recommended.length < limit && offset === 0) {
      const excludeIds = [
        ...Array.from(purchasedProductIds),
        ...recommended.map((r) => r.id),
      ]
      const fallbackConditions = [eq(product.published, true)]

      if (excludeIds.length > 0) {
        fallbackConditions.push(notInArray(product.id, excludeIds))
      }

      const fallback = await db.query.product.findMany({
        where: and(...fallbackConditions),
        orderBy: [desc(product.createdAt)],
        limit: limit - recommended.length,
        with: { images: true },
      })
      recommended = [...recommended, ...fallback]
    }

    return {
      items: recommended,
      nextOffset: recommended.length === limit ? offset + limit : null,
    }
  }
}
