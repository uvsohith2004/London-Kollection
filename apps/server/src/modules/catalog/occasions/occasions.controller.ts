import { ok } from "@/core/response"
import { NotFoundError } from "@/core/errors"
import { Context } from "hono"
import { OccasionsService } from "./occasions.service"
import { transformOccasion } from "@/core/transformers/occasion.transformer"

export class OccasionsController {
  private service = new OccasionsService()

  async list(c: Context) {
    const items = await this.service.listActiveOccasions()
    return c.json(ok({ items }))
  }

  async listAll(c: Context) {
    const items = await this.service.listAllOccasions()
    return c.json(ok({ items, meta: { total: items.length } }))
  }

  async getBySlug(c: Context) {
    const slug = c.req.param("slug")!
    const rawItem = await this.service.getOccasionBySlug(slug)
    const item = transformOccasion(rawItem)
    return c.json(ok(item))
  }

  async create(c: Context) {
    const data = c.req.valid("json" as never) as any
    const item = await this.service.create(data)
    return c.json(ok(item))
  }

  async update(c: Context) {
    const id = c.req.param("id")!
    const data = c.req.valid("json" as never) as any
    const item = await this.service.update(id, data)
    if (!item) {
      throw new NotFoundError("Occasion not found")
    }
    return c.json(ok(item))
  }

  async delete(c: Context) {
    const id = c.req.param("id")!
    const item = await this.service.delete(id)
    if (!item) {
      throw new NotFoundError("Occasion not found")
    }
    return c.json(ok(item))
  }
}
