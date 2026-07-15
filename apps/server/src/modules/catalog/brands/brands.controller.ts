import { Context } from "hono"
import { ok, created } from "@/core/response"
import { BrandsService } from "./brands.service"
import { transformBrand } from "@/core/transformers/brand.transformer"
export class BrandsController {
  private service = new BrandsService()

  async getAllBrands(c: Context) {
    const search = c.req.query("q")
    const items = await this.service.getAllBrands(search)
    return c.json(ok({ items }))
  }

  async getBrand(c: Context) {
    const id = c.req.param("id")!
    const item = await this.service.getBrandById(id)
    return c.json(ok(item))
  }

  async getBySlug(c: Context) {
    const slug = c.req.param("slug")!
    const rawItem = await this.service.getBrandBySlug(slug)
    const item = transformBrand(rawItem)
    return c.json(ok(item))
  }

  async createBrand(c: Context) {
    const body = c.req.valid("json" as never)
    const item = await this.service.createBrand(body)
    return c.json(created(item), 201)
  }

  async updateBrand(c: Context) {
    const id = c.req.param("id")!
    const body = c.req.valid("json" as never)
    const item = await this.service.updateBrand(id, body)
    return c.json(ok(item))
  }

  async deleteBrand(c: Context) {
    const id = c.req.param("id")!
    await this.service.deleteBrand(id)
    return c.json(ok({ success: true }))
  }
}
