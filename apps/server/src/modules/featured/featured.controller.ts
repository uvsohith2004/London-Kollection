import { ok } from "@/core/response"
import { Context } from "hono"
import { FeaturedService } from "./featured.service"

export class FeaturedController {
  private service = new FeaturedService()

  // Featured Pieces
  async getPieces(c: Context) {
    const items = await this.service.getFeaturedPieces()
    return c.json(ok(items))
  }

  async getAdminPieces(c: Context) {
    const items = await this.service.getAllFeaturedPiecesForAdmin()
    return c.json(ok(items))
  }

  async setPieces(c: Context) {
    const body = await c.req.valid("json" as never) as any
    await this.service.setFeaturedPieces(body.items)
    return c.json(ok({ success: true }))
  }

  async updatePieceStatus(c: Context) {
    const id = c.req.param("id")!
    const { isActive } = await c.req.valid("json" as never) as any
    const item = await this.service.updateFeaturedPieceStatus(id, isActive)
    return c.json(ok(item))
  }

  // Featured Collections
  async getCollections(c: Context) {
    const items = await this.service.getFeaturedCollections()
    return c.json(ok(items))
  }

  async getAdminCollections(c: Context) {
    const items = await this.service.getAllFeaturedCollectionsForAdmin()
    return c.json(ok(items))
  }

  async setCollections(c: Context) {
    const body = await c.req.valid("json" as never) as any
    await this.service.setFeaturedCollections(body.items)
    return c.json(ok({ success: true }))
  }

  async updateCollectionStatus(c: Context) {
    const id = c.req.param("id")!
    const { isActive } = await c.req.valid("json" as never) as any
    const item = await this.service.updateFeaturedCollectionStatus(id, isActive)
    return c.json(ok(item))
  }
}
