import { ok } from "@/core/response"
import { NotFoundError } from "@/core/errors"
import { Context } from "hono"
import { ProductsService } from "./products.service"
import { pricingEngine } from "../pricing/pricing.service"
import { transformProduct, transformProductList } from "@/core/transformers/product.transformer"

export class ProductsController {
  private service = new ProductsService()

  async list(c: Context) {
    const q = c.req.query()
    const featured = q.featured === "true" ? true : q.featured === "false" ? false : undefined
    const newArrivals = q.newArrivals === "true" ? true : undefined
    const limit = q.limit ? Number(q.limit) : undefined
    const offset = q.offset ? Number(q.offset) : undefined

    const rawItems = await this.service.listProducts({
      published: true,
      featured,
      newArrivals,
      limit,
      offset,
    })

    const items = rawItems.map(transformProductList)
    const pricedItems = await pricingEngine.applyGlobalPricing(items)
    return c.json(ok(pricedItems))
  }

  async search(c: Context) {
    const q = c.req.query()
    const limit = q.limit ? Number(q.limit) : 20
    const offset = q.offset ? Number(q.offset) : 0
    
    const rawItems = await this.service.searchProducts({
      categorySlug: q.category,
      collectionId: q.collectionId,
      q: q.q,
      minPrice: q.minPrice ? Number(q.minPrice) : undefined,
      maxPrice: q.maxPrice ? Number(q.maxPrice) : undefined,
      limit,
      offset,
    })

    const items = rawItems.map(transformProductList)
    const pricedItems = await pricingEngine.applyGlobalPricing(items)
    return c.json(ok({ items: pricedItems, total: items.length }))
  }

  async getAdminList(c: Context) {
    const q = c.req.query()
    const limit = q.limit ? Number(q.limit) : undefined
    const offset = q.offset ? Number(q.offset) : undefined
    
    const rawItems = await this.service.getAdminProducts({
      q: q.q,
      limit,
      offset,
    })

    const items = rawItems.map(transformProductList)
    return c.json(ok({ items, total: items.length }))
  }

  async getFeatured(c: Context) {
    const limit = c.req.query("limit") ? Number(c.req.query("limit")) : 8
    const rawItems = await this.service.getFeaturedProducts(limit)
    const items = rawItems.map(transformProductList)
    const pricedItems = await pricingEngine.applyGlobalPricing(items)
    return c.json(ok(pricedItems))
  }
  
  async getTrending(c: Context) {
    const limit = c.req.query("limit") ? Number(c.req.query("limit")) : 10
    const rawItems = await this.service.getTrendingProducts(limit)
    const items = rawItems.map(transformProductList)
    const pricedItems = await pricingEngine.applyGlobalPricing(items)
    return c.json(ok(pricedItems))
  }

  async getNewArrivals(c: Context) {
    const limit = c.req.query("limit") ? Number(c.req.query("limit")) : 10
    const rawItems = await this.service.getNewArrivals(limit)
    const items = rawItems.map(transformProductList)
    const pricedItems = await pricingEngine.applyGlobalPricing(items)
    return c.json(ok(pricedItems))
  }

  async getById(c: Context) {
    const id = c.req.param("id")!
    const rawItem = await this.service.getProductById(id)
    const item = transformProduct(rawItem)
    const pricedItem = await pricingEngine.applyGlobalPricingSingle(item)
    return c.json(ok(pricedItem))
  }

  async getBySlug(c: Context) {
    const slug = c.req.param("slug")!
    const rawItem = await this.service.getProductBySlug(slug)
    const item = transformProduct(rawItem)
    const pricedItem = await pricingEngine.applyGlobalPricingSingle(item)
    return c.json(ok(pricedItem))
  }

  async getPersonalizedRecommendations(c: Context) {
    const userId = (c.get("user") as any)?.id || (c.get("session") as any)?.userId || null
    const limit = c.req.query("limit") ? Number(c.req.query("limit")) : 8
    const rawItems = await this.service.getPersonalizedRecommendations(userId, limit)
    const items = rawItems.map(transformProductList)
    const pricedItems = await pricingEngine.applyGlobalPricing(items)
    return c.json(ok(pricedItems))
  }

  async getRelated(c: Context) {
    const id = c.req.param("id")!
    const limit = c.req.query("limit") ? Number(c.req.query("limit")) : 4
    const rawItems = await this.service.getRelatedProducts(id, limit)
    const items = rawItems.map(transformProductList)
    const pricedItems = await pricingEngine.applyGlobalPricing(items)
    return c.json(ok(pricedItems))
  }

  async getSuggestions(c: Context) {
    const id = c.req.param("id")!
    const limit = c.req.query("limit") ? Number(c.req.query("limit")) : 10
    const rawData = await this.service.getSuggestions(id, limit)
    
    const sameBrandItems = rawData.sameBrand.map(transformProductList)
    const otherBrandsItems = rawData.otherBrands.map(transformProductList)

    const pricedSameBrand = await pricingEngine.applyGlobalPricing(sameBrandItems)
    const pricedOtherBrands = await pricingEngine.applyGlobalPricing(otherBrandsItems)

    return c.json(ok({
      sameBrand: pricedSameBrand,
      otherBrands: pricedOtherBrands
    }))
  }

  async create(c: Context) {
    const body = c.req.valid("json" as never) as any
    const rawItem = await this.service.createProduct(body)
    const item = transformProduct(rawItem)
    return c.json(ok(item))
  }

  async update(c: Context) {
    const id = c.req.param("id")!
    const body = c.req.valid("json" as never) as any
    const rawItem = await this.service.updateProduct(id, body)
    const item = transformProduct(rawItem)
    return c.json(ok(item))
  }

  async archive(c: Context) {
    const id = c.req.param("id")!
    const rawItem = await this.service.archiveProduct(id)
    const item = transformProduct(rawItem)
    return c.json(ok(item))
  }
}
