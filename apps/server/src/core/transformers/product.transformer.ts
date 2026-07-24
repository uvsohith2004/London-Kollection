export function transformProduct(raw: any | null | undefined) {
  if (!raw) return null

  const mapImage = (img: any) => {
    let rawUrl = img.url
    if (img.asset) {
      rawUrl = img.asset.webp?.url || img.asset.avif?.url || rawUrl
    }

    let url = undefined
    if (rawUrl) {
      if (rawUrl.startsWith("/api/media/view/")) {
        url = rawUrl
      } else {
        url = `/api/media/view/${encodeURIComponent(rawUrl)}`
      }
    }

    return {
      ...img,
      asset: img.asset || undefined,
      url,
    }
  }

  const options =
    raw.options?.map((opt: any) => ({
      name: opt.name,
      values: opt.values?.map((v: any) => v.value) || [],
    })) || []

  const variants =
    raw.variants?.map((v: any) => ({
      id: v.id,
      name: v.name || undefined,
      images: (v.images || []).map(mapImage),
      sku: v.sku,
      isDefault: v.isDefault,
      price: Number(v.price || raw.price),
      discountValue: Number(v.discountValue || 0),
      compareAtPrice: v.compareAtPrice ? Number(v.compareAtPrice) : undefined,
      stock: v.stock,
      optionValues: v.combinations || {},
      barcode: v.barcode || undefined,
      inventoryStatus: v.inventoryStatus || "in_stock",
      createdAt: v.createdAt,
      updatedAt: v.updatedAt,
    })) || []

  const collections =
    raw.collections?.map((pc: any) => pc.collection).filter(Boolean) || []

  const occasions =
    raw.occasions?.map((po: any) => po.occasion).filter(Boolean) || []

  return {
    id: raw.id,
    title: raw.title,
    slug: raw.slug,
    visibility: raw.visibility || "public",
    shortDescription: raw.shortDescription || undefined,
    description: raw.description || "",
    tags: [],
    brandId: raw.brandId || undefined,
    brandName: raw.brand?.name || undefined,
    taxClassId: raw.taxClassId || undefined,
    taxClassName: raw.taxClass?.name || undefined,
    productType: raw.productType || undefined,
    categoryId: raw.categoryId || raw.categories?.[0]?.categoryId || "",
    collection: collections,
    occasions,
    isNewArrival: raw.isNewArrival || false,
    options,
    variants,
    specifications: [],
    seo: {
      title: raw.metaTitle || undefined,
      description: raw.metaDescription || undefined,
      keywords: raw.seoKeywords || undefined,
    },
    averageRating: Number(raw.averageRating || 0),
    reviewCount: raw.reviewCount || 0,
    dimensions: raw.dimensions || undefined,
    price: raw.price ? Number(raw.price) : 0,
    compareAtPrice: undefined as number | undefined,
    sku: raw.variants?.[0]?.sku || raw.slug,
    taxClass: raw.taxClass || undefined,
    images: (raw.images?.length
      ? raw.images
      : raw.variants?.[0]?.images || []
    ).map(mapImage),
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  }
}

export function transformProductList(raw: any | null | undefined) {
  if (!raw) return null

  const mapImage = (img: any) => {
    let rawUrl = img.url
    if (img.asset) {
      rawUrl = img.asset.webp?.url || img.asset.avif?.url || rawUrl
    }

    let url = undefined
    if (rawUrl) {
      if (rawUrl.startsWith("/api/media/view/")) {
        url = rawUrl
      } else {
        url = `/api/media/view/${encodeURIComponent(rawUrl)}`
      }
    }

    return {
      ...img,
      asset: img.asset || undefined,
      url,
    }
  }

  return {
    id: raw.id,
    title: raw.title,
    slug: raw.slug,
    visibility: raw.visibility || "public",
    shortDescription: raw.shortDescription || undefined,
    description: raw.description || "",
    categoryId: raw.categoryId || raw.categories?.[0]?.categoryId || "",
    categories: raw.categories || undefined,
    collection:
      raw.collections?.map((pc: any) => pc.collection).filter(Boolean) || [],
    occasions:
      raw.occasions?.map((po: any) => po.occasion).filter(Boolean) || [],
    isNewArrival: raw.isNewArrival || false,
    options:
      raw.options?.map((opt: any) => ({
        name: opt.name,
        values: opt.values?.map((v: any) => v.value) || [],
      })) || [],
    variants:
      raw.variants?.map((v: any) => ({
        id: v.id,
        name: v.name || undefined,
        images: (v.images || []).map(mapImage),
        sku: v.sku,
        isDefault: v.isDefault,
        price: Number(v.price || raw.price),
        discountValue: Number(v.discountValue || 0),
        compareAtPrice: v.compareAtPrice ? Number(v.compareAtPrice) : undefined,
        stock: v.stock,
        optionValues: v.combinations || {},
        barcode: v.barcode || undefined,
        inventoryStatus: v.inventoryStatus || "in_stock",
        createdAt: v.createdAt,
        updatedAt: v.updatedAt,
      })) || [],
    specifications: [],
    seo: {
      title: raw.metaTitle || undefined,
      description: raw.metaDescription || undefined,
    },
    metaTitle: raw.metaTitle || undefined,
    metaDescription: raw.metaDescription || undefined,
    seoKeywords: Array.isArray(raw.seoKeywords)
      ? raw.seoKeywords.join(", ")
      : undefined,
    averageRating: Number(raw.averageRating || 0),
    reviewCount: raw.reviewCount || 0,
    dimensions: raw.dimensions || undefined,
    weight: raw.dimensions?.weight || raw.weight || undefined,
    length: raw.dimensions?.length || raw.length || undefined,
    width: raw.dimensions?.width || raw.width || undefined,
    height: raw.dimensions?.height || raw.height || undefined,
    brandId: raw.brandId || undefined,
    brandName: raw.brand?.name || undefined,
    productType: raw.productType || undefined,
    price: raw.price ? Number(raw.price) : 0,
    compareAtPrice: undefined as number | undefined,
    discount: raw.discount ? Number(raw.discount) : undefined,
    taxClassId: raw.taxClassId || undefined,
    taxClassName: raw.taxClass?.name || undefined,
    taxClass: raw.taxClass || undefined,
    published: raw.published || raw.visibility === "public" || false,
    featured: raw.featured || false,
    status: raw.published ? "published" : "draft",
    images: (raw.images?.length
      ? raw.images
      : raw.variants?.[0]?.images || []
    ).map(mapImage),
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  }
}
