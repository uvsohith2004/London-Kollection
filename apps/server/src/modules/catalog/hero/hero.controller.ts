import { ok } from "@/core/response"
import { NotFoundError } from "@/core/errors"
import { Context } from "hono"
import { HeroService } from "./hero.service"
import { ProductsService } from "../products/products.service"
import { transformHeroCarousel, transformHeroCarouselList } from "@/core/transformers/hero.transformer"
import { transformProductList } from "@/core/transformers/product.transformer"

export class HeroController {
  private service = new HeroService()
  private productsService = new ProductsService()

  async getActive(c: Context) {
    const rawItems = await this.service.getActiveSlides()
    const items = rawItems.map(transformHeroCarouselList)
    return c.json(ok(items))
  }

  async listAdmin(c: Context) {
    const rawItems = await this.service.listAllSlidesForAdmin()
    const items = rawItems.map(transformHeroCarouselList)
    return c.json(ok(items))
  }

  async add(c: Context) {
    const body = c.req.valid("json" as never) as any
    const rawItem = await this.service.addSlide(body)
    const item = transformHeroCarousel(rawItem)
    return c.json(ok(item))
  }

  async update(c: Context) {
    const id = c.req.param("id")!
    const body = c.req.valid("json" as never) as any
    const rawItem = await this.service.updateSlide(id, body)
    const item = transformHeroCarousel(rawItem)
    return c.json(ok(item))
  }

  async delete(c: Context) {
    const id = c.req.param("id")!
    const rawItem = await this.service.removeSlide(id)
    const item = transformHeroCarousel(rawItem)
    return c.json(ok(item))
  }

  async reorder(c: Context) {
    const body = c.req.valid("json" as never) as any
    const rawItems = await this.service.reorderSlides(body.orderList)
    const items = rawItems.map(transformHeroCarouselList)
    return c.json(ok(items))
  }


  async getPersonalizedRecommendations(c: Context) {
    const rawItems = await this.productsService.getFeaturedProducts(8)
    const items = rawItems.map(transformProductList)
    return c.json(ok(items))
  }


}
