export interface Image {
  url: string
  alt?: string
  isPrimary: boolean
  sortOrder?: number
}
export interface ProductOption {
  name: string
  values: string[]
}
export interface Variant {
  id: string
  images: Image[]
  sku: string
  isDefault: boolean
  price: number
  discountValue: number
  compareAtPrice?: number
  stock: number
  optionValues: Record<string, string>
  barcode?: string
  inventoryStatus: "in_stock" | "out_of_stock" | "pre_order" | "coming_soon"
  createdAt: Date | string
  updatedAt: Date | string
}
export interface ProductSpecification {
  name: string
  value: string
}
export interface SEO {
  title?: string
  description?: string
  keywords?: string[]
}
export interface Product {
  id: string
  title: string
  slug: string
  visibility: "public" | "hidden"
  shortDescription?: string
  description: string
  price: number
  discount?: number
  tags?: string[]
  brandId?: string
  brandName?: string
  productType?: string
  categoryId: string
  collection: any[]
  occasions: any[]
  isNewArrival: boolean
  options?: ProductOption[]
  variants: Variant[]
  specifications?: ProductSpecification[]
  seo: SEO
  averageRating: number
  reviewCount: number
  dimensions?: Dimensions
  createdAt: Date | string
  updatedAt: Date | string
}
export interface Dimensions {
  length: number
  width: number
  height: number
  weight: number
  lengthUnit: "in" | "cm"
  weightUnit: "kg" | "lb"
}
export interface CustomerReview {
  id: string
  name?: string
  productId: string
  userId?: string
  verifiedPurchase?: boolean
  rating?: number
  title?: string
  description?: string
  createdAt: Date | string
  updatedAt: Date | string
}

export interface Governorate {
  id: string
  code: string
  name: string
}
export interface Address {
  id: string
  label?: "Home" | "Work" | "Other"
  fullName: string
  phone: string
  country: "Kuwait"
  governorateId: string
  area: string
  block: string
  street: string
  avenue?: string

  building: string
  floor?: string
  apartment?: string
  office?: string

  landmark?: string
  postalCode?: string
  paciNumber?: string

  latitude?: number
  longitude?: number

  isDefault: boolean

  createdAt: Date | string
  updatedAt: Date | string
}

export interface User {
  id: string

  name: string
  email: string
  emailVerified: boolean

  image?: string

  phone?: string
  phoneVerified: boolean

  gender?: "male" | "female" | "non_binary" | "other"
  dateOfBirth?: Date | string

  role: "customer" | "admin"

  createdAt: Date | string
  updatedAt: Date | string
}

export interface Banner {
  id: string
  title:string
  image: string
  link?: string
  sortOrder: number
}
export interface ContactMessage {
    id: string
    name: string
    email: string
    phone?: string
    message: string
    createdAt: Date | string
}

export interface ProductsResponse {
  success?: boolean
  items: Product[]
  total?: number
}
export interface CustomerReviewResponse {
  success?: boolean
  items: CustomerReview[]
  total?: number
}
export interface BannerCarouselResponse {
  success?: boolean
  items: Banner[]
}
export interface OccasionResponse {
  success?: boolean
  items: any[]
}
export interface LookBookResponse {
  success?: boolean
  items: any[]
}
