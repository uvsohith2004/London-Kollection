import { Banner, CustomerReview, Occasion, Product } from "./types"

export interface BannerCarouselResponse {
  success: boolean
  items: Banner[]
}
export interface ProductsResponse {
  success: boolean
  items: Product[]
}
export interface LookBook {
  id: string
  imageUrl: string
  link?: string
  title?: string
  subtitle?: string
  description?: string
}
export interface LookBookResponse {
  success: boolean
  items: LookBook[]
}
export interface CustomerReviewResponse {
  success: boolean
  items: CustomerReview[]
}
export interface OccasionResponse{
  success: boolean
  items: Occasion[]
}
