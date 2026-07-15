import { ok } from "@/core/response"
import { NotFoundError } from "@/core/errors"
import { Context } from "hono"
import { CollectionsService } from "./collections.service"
import { transformCollection } from "@/core/transformers/collection.transformer"

export class CollectionsController {
  private service = new CollectionsService()

  async list(c: Context) {
    const items = await this.service.listCollections()
    return c.json(ok(items))
  }

  async getFeatured(c: Context) {
    const items = await this.service.listCollections()
    return c.json(ok(items.slice(0, 5)))
  }

  async create(c: Context) {
    const body = c.req.valid("json" as never) as any
    const item = await this.service.createCollection(body)
    return c.json(ok(item))
  }

  async update(c: Context) {
    const id = c.req.param("id")!
    const body = c.req.valid("json" as never) as any
    const item = await this.service.updateCollection(id, body)
    if (!item) {
      throw new NotFoundError("Collection not found")
    }
    return c.json(ok(item))
  }

  async delete(c: Context) {
    const id = c.req.param("id")!
    const item = await this.service.deleteCollection(id)
    if (!item) {
      throw new NotFoundError("Collection not found")
    }
    return c.json(ok(item))
  }

  async getBySlug(c: Context) {
    const slug = c.req.param("slug")!
    const rawItem = await this.service.getCollectionBySlug(slug)
    const item = transformCollection(rawItem)
    return c.json(ok(item))
  }
}
