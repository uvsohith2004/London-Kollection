import { ok } from "@/core/response"
import { NotFoundError } from "@/core/errors"
import { Context } from "hono"
import { HeroService } from "./hero.service"
import { ProductsService } from "../products/products.service"

export class HeroController {
  private service = new HeroService()
  private productsService = new ProductsService()

  async getActive(c: Context) {
    const items = await this.service.getActiveSlides()
    return c.json(ok(items))
  }

  async listAdmin(c: Context) {
    const items = await this.service.listAllSlidesForAdmin()
    return c.json(ok(items))
  }

  async add(c: Context) {
    const body = c.req.valid("json" as never) as any
    const item = await this.service.addSlide(body)
    return c.json(ok(item))
  }

  async update(c: Context) {
    const id = c.req.param("id")!
    const body = c.req.valid("json" as never) as any
    const item = await this.service.updateSlide(id, body)
    if (!item) {
      throw new NotFoundError("Slide not found")
    }
    return c.json(ok(item))
  }

  async delete(c: Context) {
    const id = c.req.param("id")!
    const item = await this.service.removeSlide(id)
    if (!item) {
      throw new NotFoundError("Slide not found")
    }
    return c.json(ok(item))
  }

  async reorder(c: Context) {
    const body = c.req.valid("json" as never) as any
    const items = await this.service.reorderSlides(body.orderList)
    return c.json(ok(items))
  }


  async getPersonalizedRecommendations(c: Context) {
    const items = await this.productsService.getFeaturedProducts(8)
    return c.json(ok(items))
  }


}
