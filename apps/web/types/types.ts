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
  createdAt: Date
  updatedAt: Date
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
  productType?: string
  categoryId: string
  collection: Collection[]
  occasions: Occasion[]
  isNewArrival: boolean
  options?: ProductOption[]
  variants: Variant[]
  specifications?: ProductSpecification[]
  seo: SEO
  averageRating: number
  reviewCount: number
  dimensions?: Dimensions
  createdAt: Date
  updatedAt: Date
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
  createdAt: Date
  updatedAt: Date
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

  createdAt: Date
  updatedAt: Date
}
export interface Cart {
  id: string
  customerId: string
  items: CartItem[]
  subtotal: number
  discountValue: number
  shippingFee: number
  tax: number
  total: number
  coupon?: {
    code: string
    discountAmount: number
  }
  createdAt: Date
  updatedAt: Date
}
export interface CartItem {
  id: string
  productId: string
  variantId: string
  productName: string
  productSlug: string
  sku: string
  image: string
  optionValues: Record<string, string>
  quantity: number
  unitPrice: number
  compareAtPrice?: number
  discountValue: number
  subtotal: number
}
export interface Wishlist {
  id: string
  customerId: string
  items: WishlistItem[]
  createdAt: Date
  updatedAt: Date
}

export interface WishlistItem {
  id: string
  productId: string
  variantId?: string
  productName: string
  productSlug: string
  image: string
  optionValues?: Record<string, string>
  price: number
  compareAtPrice?: number
  discountValue: number
  stockStatus: "in_stock" | "out_of_stock" | "coming_soon" | "pre_order"
  createdAt: Date
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
  dateOfBirth?: Date

  role: "customer" | "admin"

  createdAt: Date
  updatedAt: Date
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  name: string
  email: string
  password: string
}

export interface ForgotPasswordRequest {
  email: string
}

export interface ResetPasswordRequest {
  token: string
  newPassword: string
}

export interface SendOtpRequest {
  email: string
}

export interface VerifyOtpRequest {
  email: string
  otp: string
}

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
}
export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "packed"
  | "shipped"
  | "out_for_delivery"
  | "delivered"
  | "cancelled"
  | "returned"
  | "refunded"
  | "rescheduled"
  | "return_requested"
  | "return_approved"
  | "return_rejected"
  | "exchange_requested"
  | "exchange_approved"
  | "exchange_rejected"
  | "ready_for_pickup"
  | "pickup_successful"
  | "pickup_failed"
export type PaymentStatus =
  | "pending"
  | "paid"
  | "failed"
  | "refunded"
  | "partially_refunded"
export type PaymentMethod = "cash_on_delivery" | "manual"
export interface Order {
  id: string
  orderNumber: string
  customerId: string
  shippingAddress: Address
  billingAddress: Address
  status: OrderStatus
  paymentStatus: PaymentStatus
  paymentMethod: PaymentMethod
  subtotal: number
  discountValue: number
  shippingFee: number
  tax: number
  total: number
  couponCode?: string
  customerNote?: string
  adminNote?: string
  items: OrderItem[]
  createdAt: Date
  updatedAt: Date
}
export interface OrderItem {
  id: string
  productId: string
  variantId: string
  productName: string
  productSlug: string
  sku: string
  optionValues: Record<string, string>
  quantity: number
  unitPrice: number
  compareAtPrice?: number
  discountValue: number
  subtotal: number
}
export interface Brand {
    id: string
    name: string
    slug: string
    logo?: string
    seo?: SEO
}
export interface Category {
    id: string
    name: string
    slug: string
    image?: string
    parentId?: string
    seo?: SEO
}
export interface Collection {
    id: string
    name: string
    slug: string
    image?: string
    icon?:string
    description?: string
    seo?: SEO
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
    createdAt: Date
}



export interface Occasion {
  id: string
  name: string
  slug: string
  image?: string
  isActive: boolean
  sortOrder: number
  createdAt: Date
  updatedAt: Date
}


