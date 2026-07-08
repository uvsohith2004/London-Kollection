import db from "@/db"
import { userProductHistory, userSearchHistory } from "@/db/schemas/history.schema"
import { userHeatmap } from "@/db/schemas/heatmap.schema"
import { orderItem, order, product } from "@/db/schemas"
import { eq, and, desc, isNotNull, inArray } from "drizzle-orm"

export class HeatmapService {
  async calculateHeatmap(userId: string) {
    const history = await db.query.userProductHistory.findMany({
      where: and(eq(userProductHistory.userId, userId), eq(userProductHistory.isArchived, false)),
      orderBy: [desc(userProductHistory.lastViewedAt)],
      limit: 20,
      with: {
        product: {
          with: { categories: true, collections: true, occasions: true }
        }
      }
    })

    const userOrders = await db
      .select({ productId: orderItem.productId })
      .from(orderItem)
      .leftJoin(order, eq(orderItem.orderId, order.id))
      .where(and(eq(order.userId, userId), isNotNull(orderItem.productId)))
      .limit(50)
      
    const orderedProductIds = userOrders.map(o => o.productId).filter((id): id is string => id !== null)

    let orderedProducts: any[] = []
    if (orderedProductIds.length > 0) {
      orderedProducts = await db.query.product.findMany({
        where: inArray(product.id, orderedProductIds),
        with: { categories: true, collections: true, occasions: true }
      })
    }

    const addScore = (map: Record<string, number>, key: string | null, weight: number) => {
      if (!key) return
      map[key] = (map[key] || 0) + weight
    }

    const categoryScores: Record<string, number> = {}
    const collectionScores: Record<string, number> = {}
    const occasionScores: Record<string, number> = {}

    for (const item of orderedProducts) {
      if (item.categoryId) addScore(categoryScores, item.categoryId, 3)
      item.categories.forEach((c: any) => addScore(categoryScores, c.categoryId, 3))
      item.collections.forEach((c: any) => addScore(collectionScores, c.collectionId, 4))
      item.occasions.forEach((c: any) => addScore(occasionScores, c.occasionId, 5))
    }

    for (const h of history) {
      if (!h.product) continue
      const p = h.product
      if (p.categoryId) addScore(categoryScores, p.categoryId, 1)
      p.categories.forEach((c: any) => addScore(categoryScores, c.categoryId, 1))
      p.collections.forEach((c: any) => addScore(collectionScores, c.collectionId, 2))
      p.occasions.forEach((c: any) => addScore(occasionScores, c.occasionId, 3))
    }

    // Process Search History
    const searches = await db.query.userSearchHistory.findMany({
      where: and(eq(userSearchHistory.userId, userId), eq(userSearchHistory.isArchived, false)),
      orderBy: [desc(userSearchHistory.lastSearchedAt)],
      limit: 10
    })

    const existing = await db.query.userHeatmap.findFirst({
      where: eq(userHeatmap.userId, userId)
    })

    if (existing) {
      await db.update(userHeatmap)
        .set({
          categoryScores,
          collectionScores,
          occasionScores,
          lastCalculatedAt: new Date()
        })
        .where(eq(userHeatmap.userId, userId))
    } else {
      await db.insert(userHeatmap).values({
        userId,
        categoryScores,
        collectionScores,
        occasionScores,
        lastCalculatedAt: new Date()
      })
    }
    
    return { categoryScores, collectionScores, occasionScores }
  }

  async getHeatmap(userId: string) {
    const existing = await db.query.userHeatmap.findFirst({
      where: eq(userHeatmap.userId, userId)
    })
    return existing || null
  }
}
