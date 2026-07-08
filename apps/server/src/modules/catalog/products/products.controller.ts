import { ok } from "@/core/response"
import { NotFoundError } from "@/core/errors"
import { Context } from "hono"
import { ProductsService } from "./products.service"

export class ProductsController {
  private service = new ProductsService()

  async list(c: Context) {
    const q = c.req.query()
    const featured = q.featured === "true" ? true : q.featured === "false" ? false : undefined
    const newArrivals = q.newArrivals === "true" ? true : undefined
    const limit = q.limit ? Number(q.limit) : undefined
    const offset = q.offset ? Number(q.offset) : undefined

    const items = await this.service.listProducts({
      published: true,
      featured,
      newArrivals,
      limit,
      offset,
    })

    return c.json(ok(items))
  }

  async getAdminList(c: Context) {
    const q = c.req.query()
    const limit = q.limit ? Number(q.limit) : undefined
    const offset = q.offset ? Number(q.offset) : undefined
    
    const items = await this.service.getAdminProducts({
      q: q.q,
      limit,
      offset,
    })

    // Return with { items } structure
    return c.json(ok({ items, total: items.length }))
  }

  async getFeatured(c: Context) {
    const limit = c.req.query("limit") ? Number(c.req.query("limit")) : 8
    const items = await this.service.getFeaturedProducts(limit)
    return c.json(ok(items))
  }
  
  async getTrending(c: Context) {
    const limit = c.req.query("limit") ? Number(c.req.query("limit")) : 10
    const items = await this.service.getTrendingProducts(limit)
    return c.json(ok(items))
  }

  async getNewArrivals(c: Context) {
    const limit = c.req.query("limit") ? Number(c.req.query("limit")) : 10
    const items = await this.service.getNewArrivals(limit)
    return c.json(ok(items))
  }

  async getById(c: Context) {
    const id = c.req.param("id")!
    const item = await this.service.getProductById(id)
    if (!item) {
      throw new NotFoundError("Product not found")
    }
    return c.json(ok(item))
  }

  async getBySlug(c: Context) {
    const slug = c.req.param("slug")!
    const item = await this.service.getProductBySlug(slug)
    if (!item) {
      throw new NotFoundError("Product not found")
    }
    return c.json(ok(item))
  }

  async getPersonalizedRecommendations(c: Context) {
    const userId = (c.get("user") as any)?.id || (c.get("session") as any)?.userId || null
    const limit = c.req.query("limit") ? Number(c.req.query("limit")) : 8
    const items = await this.service.getPersonalizedRecommendations(userId, limit)
    return c.json(ok(items))
  }

  async getRelated(c: Context) {
    const id = c.req.param("id")!
    const limit = c.req.query("limit") ? Number(c.req.query("limit")) : 4
    const items = await this.service.getRelatedProducts(id, limit)
    return c.json(ok(items))
  }

  async create(c: Context) {
    const body = c.req.valid("json" as never) as any
    const item = await this.service.createProduct(body)
    return c.json(ok(item))
  }

  async update(c: Context) {
    const id = c.req.param("id")!
    const body = c.req.valid("json" as never) as any
    const item = await this.service.updateProduct(id, body)
    if (!item) {
      throw new NotFoundError("Product not found")
    }
    return c.json(ok(item))
  }

  async archive(c: Context) {
    const id = c.req.param("id")!
    const item = await this.service.archiveProduct(id)
    if (!item) {
      throw new NotFoundError("Product not found")
    }
    return c.json(ok(item))
  }
}
