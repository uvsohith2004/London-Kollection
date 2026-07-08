import { Context } from "hono"
import { FlashSaleService } from "./flash-sale.service"

export class FlashSaleController {
  private service = new FlashSaleService()

  async getFlashSaleDetails(c: Context) {
    const sale = await this.service.getActiveFlashSale()
    return c.json({ data: sale || null })
  }

  async getFlashSaleProducts(c: Context) {
    const products = await this.service.getFlashSaleProducts()
    return c.json({ data: products })
  }

  async getAdminFlashSaleDetails(c: Context) {
    const details = await this.service.getAdminFlashSaleDetails()
    return c.json({ data: details })
  }

  async toggleFlashSale(c: Context) {
    const { isActive, endTime } = await c.req.json()
    const sale = await this.service.toggleFlashSale(isActive, endTime)
    return c.json({ data: sale })
  }

  async addFlashSaleItem(c: Context) {
    const { productId, flashPrice } = await c.req.json()
    const item = await this.service.addFlashSaleItem(productId, flashPrice)
    return c.json({ data: item })
  }

  async updateFlashSaleItem(c: Context) {
    const id = c.req.param("id")!
    const { flashPrice, sortOrder } = await c.req.json()
    const item = await this.service.updateFlashSaleItem(id, flashPrice, sortOrder)
    return c.json({ data: item })
  }

  async removeFlashSaleItem(c: Context) {
    const id = c.req.param("id")!
    await this.service.removeFlashSaleItem(id)
    return c.json({ success: true })
  }
}
