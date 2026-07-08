import db from "@/db"
import { flashSale, flashSaleItem, product, productImage, productCategory, category } from "@/db/schemas"
import { eq, desc, and, inArray } from "drizzle-orm"
import { NotFoundError } from "@/core/errors"

export class FlashSaleService {
  async getActiveFlashSale() {
    const [activeSale] = await db
      .select()
      .from(flashSale)
      .where(eq(flashSale.isActive, true))
      .orderBy(desc(flashSale.createdAt))
      .limit(1)
    
    if (!activeSale) return null
    return activeSale
  }

  async getFlashSaleProducts() {
    const activeSale = await this.getActiveFlashSale()
    if (!activeSale) return { sale: null, items: [] }

    // Fetch items with product data joined. We need product images etc.
    const items = await db.select({
        item: flashSaleItem,
        product: product
    })
    .from(flashSaleItem)
    .innerJoin(product, eq(flashSaleItem.productId, product.id))
    .where(eq(flashSaleItem.flashSaleId, activeSale.id))
    .orderBy(flashSaleItem.sortOrder)
    
    if (items.length === 0) return { sale: activeSale, items: [] }

    // Fetch primary images for these products
    const productIds = items.map(i => i.product.id)
    const images = await db.select().from(productImage).where(and(inArray(productImage.productId, productIds), eq(productImage.isPrimary, true)))

    // Map back
    const mappedItems = items.map(({ item, product }) => ({
      ...product,
      price: item.flashPrice,
      originalPrice: product.price,
      discount: String(Math.max(0, parseFloat(product.price) - parseFloat(item.flashPrice))),
      images: images.filter(img => img.productId === product.id)
    }))

    return {
      sale: activeSale,
      items: mappedItems
    }
  }

  async getAdminFlashSaleDetails() {
    const [sale] = await db
      .select()
      .from(flashSale)
      .orderBy(desc(flashSale.createdAt))
      .limit(1)
      
    let activeSale = sale
    if (!activeSale) {
      const [newSale] = await db.insert(flashSale).values({ isActive: false }).returning()
      activeSale = newSale
    }

    const items = await db.select({
        item: flashSaleItem,
        product: product
    })
    .from(flashSaleItem)
    .innerJoin(product, eq(flashSaleItem.productId, product.id))
    .where(eq(flashSaleItem.flashSaleId, activeSale.id))
    .orderBy(flashSaleItem.sortOrder)

    const productIds = items.map(i => i.product.id)
    const images = productIds.length > 0 
      ? await db.select().from(productImage).where(and(inArray(productImage.productId, productIds), eq(productImage.isPrimary, true)))
      : []

    return {
      sale: activeSale,
      items: items.map(({ item, product }) => ({
        id: item.id,
        productId: product.id,
        title: product.title,
        originalPrice: product.price,
        flashPrice: item.flashPrice,
        sortOrder: item.sortOrder,
        image: images.find(img => img.productId === product.id)?.asset
      }))
    }
  }

  async toggleFlashSale(isActive: boolean, endTime?: string) {
    let [activeSale] = await db
      .select()
      .from(flashSale)
      .orderBy(desc(flashSale.createdAt))
      .limit(1)
      
    const scheduleEnd = endTime ? new Date(endTime) : null;

    if (activeSale) {
      const [updated] = await db.update(flashSale).set({ isActive, scheduleEnd }).where(eq(flashSale.id, activeSale.id)).returning()
      return updated
    } else {
      const [newSale] = await db.insert(flashSale).values({ isActive, scheduleEnd }).returning()
      return newSale
    }
  }

  async addFlashSaleItem(productId: string, flashPrice: string) {
    let [activeSale] = await db
      .select()
      .from(flashSale)
      .orderBy(desc(flashSale.createdAt))
      .limit(1)
      
    if (!activeSale) {
      const [newSale] = await db.insert(flashSale).values({ isActive: false }).returning()
      activeSale = newSale
    }

    const [prod] = await db.select().from(product).where(eq(product.id, productId))
    if (!prod) throw new NotFoundError("Product not found")

    const [existing] = await db.select().from(flashSaleItem)
      .where(and(eq(flashSaleItem.flashSaleId, activeSale.id), eq(flashSaleItem.productId, productId)))
    
    if (existing) {
       const [updated] = await db.update(flashSaleItem).set({ flashPrice }).where(eq(flashSaleItem.id, existing.id)).returning()
       return updated
    }

    const [newItem] = await db.insert(flashSaleItem).values({
      flashSaleId: activeSale.id,
      productId,
      flashPrice
    }).returning()

    return newItem
  }

  async updateFlashSaleItem(itemId: string, flashPrice: string, sortOrder?: number) {
    const payload: any = { flashPrice }
    if (sortOrder !== undefined) payload.sortOrder = sortOrder
    
    const [updated] = await db.update(flashSaleItem).set(payload).where(eq(flashSaleItem.id, itemId)).returning()
    if (!updated) throw new NotFoundError("Flash sale item not found")
    return updated
  }

  async removeFlashSaleItem(itemId: string) {
    const [deleted] = await db.delete(flashSaleItem).where(eq(flashSaleItem.id, itemId)).returning()
    if (!deleted) throw new NotFoundError("Flash sale item not found")
    return deleted
  }
}
