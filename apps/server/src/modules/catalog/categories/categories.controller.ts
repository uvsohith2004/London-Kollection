import { ok } from "@/core/response"
import { NotFoundError } from "@/core/errors"
import { Context } from "hono"
import { CategoriesService } from "./categories.service"
import { transformCategory } from "@/core/transformers/category.transformer"

export class CategoriesController {
  private service = new CategoriesService()

  async list(c: Context) {
    const items = await this.service.listCategories()
    return c.json(ok(items))
  }

  async getFeatured(c: Context) {
    // Return standard list as fallback for featured categories
    const items = await this.service.listCategories()
    // Optionally slice to limit featured categories
    return c.json(ok(items.slice(0, 5)))
  }

  async getRecentlyUpdated(c: Context) {
    const limit = Number(c.req.query("limit") || 3)
    const items = await this.service.getRecentlyUpdatedCategories(limit)
    return c.json(ok(items))
  }

  async create(c: Context) {
    const body = c.req.valid("json" as never) as any
    const item = await this.service.createCategory(body)
    return c.json(ok(item))
  }

  async update(c: Context) {
    const id = c.req.param("id")!
    const body = c.req.valid("json" as never) as any
    const item = await this.service.updateCategory(id, body)
    if (!item) {
      throw new NotFoundError("Category not found")
    }
    return c.json(ok(item))
  }

  async delete(c: Context) {
    const id = c.req.param("id")!
    const item = await this.service.deleteCategory(id)
    if (!item) {
      throw new NotFoundError("Category not found")
    }
    return c.json(ok(item))
  }

  async getById(c: Context) {
    const id = c.req.param("id")!
    const rawItem = await this.service.getCategoryById(id)
    const item = transformCategory(rawItem)
    return c.json(ok(item))
  }

  async getBySlug(c: Context) {
    const slug = c.req.param("slug")!
    const rawItem = await this.service.getCategoryBySlug(slug)
    const item = transformCategory(rawItem)
    return c.json(ok(item))
  }
}
