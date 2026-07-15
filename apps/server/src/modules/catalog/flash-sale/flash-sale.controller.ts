import { Context } from "hono"
import { ok } from "@/core/response"
import { FlashSaleService } from "./flash-sale.service"
import {
  transformFlashSale,
  transformFlashSaleItem,
  transformFlashSaleProductList,
  transformAdminFlashSaleItem
} from "@/core/transformers/flash-sale.transformer"

export class FlashSaleController {
  private service = new FlashSaleService()

  async getFlashSaleDetails(c: Context) {
    const rawSale = await this.service.getActiveFlashSale()
    const sale = rawSale ? transformFlashSale(rawSale) : null
    return c.json(ok(sale))
  }

  async getFlashSaleProducts(c: Context) {
    const rawData = await this.service.getFlashSaleProducts()
    const products = rawData.items.map(transformFlashSaleProductList)
    return c.json(ok({ sale: transformFlashSale(rawData.sale), items: products }))
  }

  async getAdminFlashSaleDetails(c: Context) {
    const rawData = await this.service.getAdminFlashSaleDetails()
    const details = rawData.sale ? transformFlashSale(rawData.sale) : null
    const items = rawData.items.map((rawItem: any) => transformAdminFlashSaleItem(rawItem, rawData.images))
    return c.json(ok({ sale: details, items }))
  }

  async toggleFlashSale(c: Context) {
    const { isActive, endTime } = await c.req.json()
    const rawSale = await this.service.toggleFlashSale(isActive, endTime)
    const sale = transformFlashSale(rawSale)
    return c.json(ok(sale))
  }

  async addFlashSaleItem(c: Context) {
    const { productId, flashPrice } = await c.req.json()
    const rawItem = await this.service.addFlashSaleItem(productId, flashPrice)
    const item = transformFlashSaleItem(rawItem)
    return c.json(ok(item))
  }

  async updateFlashSaleItem(c: Context) {
    const id = c.req.param("id")!
    const { flashPrice, sortOrder } = await c.req.json()
    const rawItem = await this.service.updateFlashSaleItem(id, flashPrice, sortOrder)
    const item = transformFlashSaleItem(rawItem)
    return c.json(ok(item))
  }

  async removeFlashSaleItem(c: Context) {
    const id = c.req.param("id")!
    await this.service.removeFlashSaleItem(id)
    return c.json(ok({ success: true }))
  }
}
