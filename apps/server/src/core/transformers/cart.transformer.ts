import type { CartSummary } from "@workspace/api-contracts"

export function transformCartSummary(raw: any): CartSummary {
  if (!raw) return raw as CartSummary

  const items = raw.items.map((entry: any) => {
    if (!entry.rawProduct) {
      return {
        ...entry.item,
        productName: "Unavailable Product",
        productSlug: "",
        sku: "",
        quantity: entry.item.quantity,
        unitPrice: 0,
        discountValue: 0,
        subtotal: 0,
        isAvailable: false,
        optionValues: {},
      }
    }

    let sku = entry.rawProduct.sku || ""
    if (entry.variantData) {
      sku = entry.variantData.sku || sku
    }

    const optionValues = entry.variantData?.combinations || {}
    const discountValue = entry.compareAtPrice ? entry.compareAtPrice - entry.unitPrice : 0

    // Resolve Image
    const primaryVariantImage = entry.variantData?.images?.find((i: any) => i.isPrimary) || entry.variantData?.images?.[0]
    const primaryProductImage = entry.rawProduct.images?.find((i: any) => i.isPrimary) || entry.rawProduct.images?.[0]
    const imageObj = primaryVariantImage?.asset || primaryProductImage?.asset
    
    let image = ""
    if (imageObj && typeof imageObj === 'object') {
       image = imageObj.webp?.url || imageObj.avif?.url || imageObj.url || ""
    }
    
    if (image && !image.startsWith("/api/media/view/") && !image.startsWith("http")) {
       image = `/api/media/view/${encodeURIComponent(image)}`
    }

    return {
      id: entry.item.id,
      productId: entry.item.productId,
      variantId: entry.item.variantId,
      productName: entry.rawProduct.title,
      productSlug: entry.rawProduct.slug,
      sku,
      image: image || undefined,
      optionValues,
      quantity: entry.item.quantity,
      unitPrice: entry.unitPrice,
      compareAtPrice: entry.compareAtPrice,
      discountValue: discountValue,
      subtotal: entry.itemSubtotal,
      isAvailable: entry.isAvailable,
      stock: entry.stock,
    }
  })

  return {
    id: raw.id,
    items,
    subtotal: raw.subtotal,
    taxTotal: raw.taxTotal,
    discountTotal: raw.discountTotal,
    deliveryFee: raw.deliveryFee,
    grandTotal: raw.grandTotal,
    couponCode: raw.couponCode,
  } as CartSummary
}
