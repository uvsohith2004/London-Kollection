export interface ProductImageDTO {
  key?: string
  url?: string
  alt?: string | null
  isPrimary?: boolean | null
  sortOrder?: number
}

export interface ProductOptionDTO {
  name: string
  position?: number
  values: string[]
}

export interface ProductVariantDTO {
  name?: string
  sku: string
  isDefault?: boolean | null
  price?: string | null
  discountValue?: string | null
  compareAtPrice?: string | null
  stock: number
  combinations: Record<string, string>
  barcode?: string | null
  inventoryStatus?: string | null
  images?: ProductImageDTO[]
}

export interface ProductDimensionsDTO {
  length?: number
  width?: number
  height?: number
  weight?: number
  lengthUnit?: string
  weightUnit?: string
}



export interface CreateProductDTO {
  title: string
  slug: string
  shortDescription?: string
  description?: string
  visibility?: string
  status?: string
  price: string
  discount?: string
  currency?: string
  brandId?: string | null
  productType?: string | null
  categoryId?: string | null
  taxClassId?: string | null
  published?: boolean
  featured?: boolean
  isNewArrival?: boolean
  isReturnable?: boolean
  isExchangeable?: boolean
  metaTitle?: string
  metaDescription?: string
  seoKeywords?: string[]
  dimensions?: ProductDimensionsDTO
  categoryIds?: string[]
  collectionIds?: string[]
  occasionIds?: string[]

  returnFormId?: string | null
  returnWindowDays?: number
  exchangeWindowDays?: number
  images?: ProductImageDTO[]
  options?: ProductOptionDTO[]
  variants?: ProductVariantDTO[]
}

export interface UpdateProductDTO extends Partial<CreateProductDTO> {}

export interface RawProductVariant {
  id: string
  name?: string | null
  images?: ProductImageDTO[]
  sku: string
  isDefault: boolean
  price: number | string | null
  discountValue?: number | string | null
  compareAtPrice?: number | string | null
  stock: number
  combinations?: Record<string, string>
  barcode?: string | null
  inventoryStatus?: string
}

export interface RawProductOption {
  name: string
  values?: { value: string }[]
}

export interface RawProductData {
  id: string
  title: string
  slug: string
  price: number | string
  visibility?: string
  status?: string
  shortDescription?: string | null
  description?: string | null
  brandId?: string | null
  productType?: string | null
  categoryId?: string | null
  taxClassId?: string | null
  categories?: { categoryId: string }[]
  collections?: { collection: any }[]
  occasions?: { occasion: any }[]
  isNewArrival?: boolean
  options?: RawProductOption[]
  variants?: RawProductVariant[]
  metaTitle?: string | null
  metaDescription?: string | null
  seoKeywords?: string[] | null
  averageRating?: number | string | null
  reviewCount?: number | null

  returnFormId?: string | null
  returnWindowDays?: number
  exchangeWindowDays?: number
  dimensions?: ProductDimensionsDTO | null
  images?: ProductImageDTO[]
  [key: string]: any
}
