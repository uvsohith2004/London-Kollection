import type { FlashSale, FlashSaleItem } from "@workspace/api-contracts"

export function transformFlashSale(raw: any): FlashSale {
  return raw as FlashSale
}

export function transformFlashSaleList(raw: any): FlashSale {
  return transformFlashSale(raw)
}

export function transformFlashSaleItem(raw: any): FlashSaleItem {
  return raw as FlashSaleItem
}

export function transformFlashSaleItemList(raw: any): FlashSaleItem {
  return transformFlashSaleItem(raw)
}

import { transformProductList } from "./product.transformer"

export function transformFlashSaleProductList(raw: any) {
  const p = transformProductList(raw.product) as any;
  const flashPrice = Number(raw.item.flashPrice)

  const newVariants = p.variants?.map((v: any) => ({
      ...v,
      price: flashPrice,
      compareAtPrice: v.compareAtPrice || v.price 
  })) || []

  return {
    ...p,
    price: flashPrice,
    originalPrice: p.price,
    discount: p.price ? Math.max(0, p.price - flashPrice) : 0,
    variants: newVariants
  }
}

export function transformAdminFlashSaleItem(raw: any, images: any[] = []) {
  return {
    id: raw.item.id,
    productId: raw.product.id,
    title: raw.product.title,
    originalPrice: raw.product.price,
    flashPrice: raw.item.flashPrice,
    sortOrder: raw.item.sortOrder,
    image: images.find((img: any) => img.productId === raw.product.id)?.asset
  }
}

