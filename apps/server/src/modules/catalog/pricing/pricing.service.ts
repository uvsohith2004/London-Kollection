import db from "@/db"
import { flashSale, flashSaleItem } from "@/db/schemas"
import { eq, desc, and, inArray, or, gt, isNull } from "drizzle-orm"

export class PricingEngineService {
  async applyGlobalPricing<T extends { id: string, price: number, compareAtPrice?: number, variants?: any[] }>(products: (T | null | undefined)[]): Promise<(T | null)[]> {
    if (!products || products.length === 0) return products as any;

    const validProducts = products.filter((p): p is T => p != null);
    if (validProducts.length === 0) return products as any;

    const [activeSale] = await db
      .select()
      .from(flashSale)
      .where(
        and(
          eq(flashSale.isActive, true),
          or(
            isNull(flashSale.scheduleEnd),
            gt(flashSale.scheduleEnd, new Date())
          )
        )
      )
      .orderBy(desc(flashSale.createdAt))
      .limit(1);

    if (!activeSale) return products as any;

    const productIds = validProducts.map(p => p.id);
    const saleItems = await db
      .select()
      .from(flashSaleItem)
      .where(and(
        eq(flashSaleItem.flashSaleId, activeSale.id),
        inArray(flashSaleItem.productId, productIds)
      ));

    if (saleItems.length === 0) return products as any;

    const saleItemsMap = new Map(saleItems.map(item => [item.productId, Number(item.flashPrice)]));

    return products.map(product => {
      if (!product) return product;
      const flashPrice = saleItemsMap.get(product.id);
      if (flashPrice === undefined) return product;

      // Apply flash sale to all variants
      const updatedVariants = product.variants?.map((v: any) => {
        const originalBasePrice = Number(v.price)
        const originalDiscount = Number(v.discountValue || 0)
        const currentOriginalPrice = v.compareAtPrice || originalBasePrice
        
        return {
          ...v,
          price: flashPrice,
          discountValue: currentOriginalPrice - Number(flashPrice),
          compareAtPrice: currentOriginalPrice,
        }
      });

      const pBasePrice = Number(product.price)
      const pDiscount = Number((product as any).discountValue || 0)
      const pCurrentOriginalPrice = product.compareAtPrice || pBasePrice

      return {
        ...product,
        price: flashPrice,
        discountValue: pCurrentOriginalPrice - Number(flashPrice),
        compareAtPrice: pCurrentOriginalPrice,
        variants: updatedVariants,
      };
    }) as any;
  }

  async applyGlobalPricingSingle<T extends { id: string, price: number, compareAtPrice?: number, variants?: any[] }>(product: T | null | undefined): Promise<T | null> {
    if (!product) return null;
    const result = await this.applyGlobalPricing([product]);
    return result[0];
  }
}

export const pricingEngine = new PricingEngineService();
