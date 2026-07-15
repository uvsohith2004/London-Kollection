import { ok } from "@/core/response"
import { Context } from "hono"
import { FeaturedService } from "./featured.service"
import { transformFeaturedPiece, transformFeaturedCollection } from "@/core/transformers/featured.transformer"

export class FeaturedController {
  private service = new FeaturedService()

  // Featured Pieces
  async getPieces(c: Context) {
    const rawItems = await this.service.getFeaturedPieces()
    const items = rawItems.map(transformFeaturedPiece)
    return c.json(ok(items))
  }

  async getAdminPieces(c: Context) {
    const rawItems = await this.service.getAllFeaturedPiecesForAdmin()
    const items = rawItems.map(transformFeaturedPiece)
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
    const rawItem = await this.service.updateFeaturedPieceStatus(id, isActive)
    return c.json(ok(rawItem))
  }

  // Featured Collections
  async getCollections(c: Context) {
    const rawItems = await this.service.getFeaturedCollections()
    const items = rawItems.map(transformFeaturedCollection)
    return c.json(ok(items))
  }

  async getAdminCollections(c: Context) {
    const rawItems = await this.service.getAllFeaturedCollectionsForAdmin()
    const items = rawItems.map(transformFeaturedCollection)
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
    const rawItem = await this.service.updateFeaturedCollectionStatus(id, isActive)
    return c.json(ok(rawItem))
  }
}
