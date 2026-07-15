import { ok } from "@/core/response"
import { Context } from "hono"
import { HistoryService } from "./history.service"

export class HistoryController {
  private service = new HistoryService()

  async trackProductView(c: Context) {
    const { productId } = await c.req.valid("json" as never) as any
    const userId = (c.get("user") as any)?.id || (c.get("session") as any)?.userId || null
    if (userId) {
      await this.service.trackProductView(userId, productId)
    }
    return c.json(ok({ success: true }))
  }

  async trackSearch(c: Context) {
    const { searchTerm } = await c.req.valid("json" as never) as any
    const userId = (c.get("user") as any)?.id || (c.get("session") as any)?.userId || null
    if (userId) {
      await this.service.trackSearch(userId, searchTerm)
    }
    return c.json(ok({ success: true }))
  }

  async trackBatch(c: Context) {
    const { productIds = [], searchTerms = [] } = await c.req.valid("json" as never) as any
    const userId = (c.get("user") as any)?.id || (c.get("session") as any)?.userId || null
    if (userId) {
      await this.service.trackBatch(userId, productIds, searchTerms)
    }
    return c.json(ok({ success: true }))
  }

  async getHistory(c: Context) {
    const userId = (c.get("user") as any)?.id || (c.get("session") as any)?.userId || null
    if (!userId) return c.json(ok({ productViews: [], searches: [] }))
    
    const limit = c.req.query("limit") ? Number(c.req.query("limit")) : 20
    const history = await this.service.getHistory(userId, limit)
    return c.json(ok(history))
  }

  async getRecommended(c: Context) {
    const userId = (c.get("user") as any)?.id || (c.get("session") as any)?.userId || null
    const limit = c.req.query("limit") ? Number(c.req.query("limit")) : 20
    const offset = c.req.query("offset") ? Number(c.req.query("offset")) : 0
    const items = await this.service.getRecommendedProducts(userId, limit, offset)
    return c.json(ok(items))
  }

  async archiveProductHistory(c: Context) {
    const id = c.req.param("id")!
    const userId = (c.get("user") as any)?.id || (c.get("session") as any)?.userId || null
    if (userId) {
      await this.service.archiveProductHistory(userId, id)
    }
    return c.json(ok({ success: true }))
  }

  async archiveSearchHistory(c: Context) {
    const id = c.req.param("id")!
    const userId = (c.get("user") as any)?.id || (c.get("session") as any)?.userId || null
    if (userId) {
      await this.service.archiveSearchHistory(userId, id)
    }
    return c.json(ok({ success: true }))
  }
}
