import db from "@/db"
import { userProductHistory, userSearchHistory } from "@/db/schemas/history.schema"
import { eq, and, desc } from "drizzle-orm"

export class HistoryService {
  async trackProductView(userId: string, productId: string) {
    const existing = await db.query.userProductHistory.findFirst({
      where: and(eq(userProductHistory.userId, userId), eq(userProductHistory.productId, productId))
    })

    if (existing) {
      if (existing.isArchived) {
        await db.update(userProductHistory)
          .set({ viewCount: existing.viewCount + 1, lastViewedAt: new Date(), isArchived: false })
          .where(eq(userProductHistory.id, existing.id))
      } else {
        await db.update(userProductHistory)
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
      where: and(eq(userSearchHistory.userId, userId), eq(userSearchHistory.searchTerm, term))
    })

    if (existing) {
      if (existing.isArchived) {
        await db.update(userSearchHistory)
          .set({ searchCount: existing.searchCount + 1, lastSearchedAt: new Date(), isArchived: false })
          .where(eq(userSearchHistory.id, existing.id))
      } else {
        await db.update(userSearchHistory)
          .set({ searchCount: existing.searchCount + 1, lastSearchedAt: new Date() })
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

  async getHistory(userId: string, limit = 20) {
    const productViews = await db.query.userProductHistory.findMany({
      where: and(eq(userProductHistory.userId, userId), eq(userProductHistory.isArchived, false)),
      orderBy: [desc(userProductHistory.lastViewedAt)],
      limit,
      with: {
        product: {
          with: { images: true }
        }
      }
    })

    const searches = await db.query.userSearchHistory.findMany({
      where: and(eq(userSearchHistory.userId, userId), eq(userSearchHistory.isArchived, false)),
      orderBy: [desc(userSearchHistory.lastSearchedAt)],
      limit,
    })

    return { productViews, searches }
  }

  async archiveProductHistory(userId: string, historyId: string) {
    await db.update(userProductHistory)
      .set({ isArchived: true })
      .where(and(eq(userProductHistory.id, historyId), eq(userProductHistory.userId, userId)))
  }

  async archiveSearchHistory(userId: string, historyId: string) {
    await db.update(userSearchHistory)
      .set({ isArchived: true })
      .where(and(eq(userSearchHistory.id, historyId), eq(userSearchHistory.userId, userId)))
  }

  async getRecommendedProducts(userId: string | null, limit = 10) {
    if (!userId) {
      // Fallback to latest products if no user
      return await db.query.product.findMany({
        where: (p, { eq }) => eq(p.published, true),
        orderBy: (p, { desc }) => [desc(p.createdAt)],
        limit,
        with: { images: true }
      });
    }
    
    const userViews = await db.query.userProductHistory.findMany({
      where: eq(userProductHistory.userId, userId),
      orderBy: [desc(userProductHistory.lastViewedAt)],
      limit: 10,
      with: { product: true }
    });

    if (!userViews.length) {
      return await db.query.product.findMany({
        where: (p, { eq }) => eq(p.published, true),
        orderBy: (p, { desc }) => [desc(p.createdAt)],
        limit,
        with: { images: true }
      });
    }
    
    const categoryIds = [...new Set(userViews.map(v => v.product?.categoryId).filter((id): id is string => Boolean(id)))];
    
    if (!categoryIds.length) {
       return await db.query.product.findMany({
        where: (p, { eq }) => eq(p.published, true),
        orderBy: (p, { desc }) => [desc(p.createdAt)],
        limit,
        with: { images: true }
      });
    }

    const recommended = await db.query.product.findMany({
      where: (p, { inArray, and, eq, notInArray }) => and(
        inArray(p.categoryId, categoryIds),
        eq(p.published, true),
        notInArray(p.id, userViews.map(v => v.productId))
      ),
      limit,
      orderBy: (p, { desc }) => [desc(p.createdAt)],
      with: { images: true }
    });

    if (recommended.length < limit) {
        const fallback = await db.query.product.findMany({
          where: (p, { eq, notInArray, and }) => and(
            eq(p.published, true),
            notInArray(p.id, [...userViews.map(v => v.productId), ...recommended.map(r => r.id)])
          ),
          orderBy: (p, { desc }) => [desc(p.createdAt)],
          limit: limit - recommended.length,
          with: { images: true }
        });
        return [...recommended, ...fallback];
    }

    return recommended;
  }
}
