import { useQuery } from "@tanstack/react-query"
import {
  fetchCustomerReviews,
  fetchFeaturedCategories,
  fetchFeaturedCollections,
  fetchFeaturedProducts,
  fetchFlashSaleProducts,
  fetchHeroCarouselImages,
  fetchNewArrival,
  fetchOccasions,
  fetchPersonalizedRecommendations,
  fetchPersonalizedRecommendationsPaginated,
  fetchTrendingProducts,
} from "@/api/index"
import type {
  BannerCarouselResponse,
  ProductsResponse,
  CustomerReviewResponse,
  OccasionResponse,
  LookBookResponse,
} from "@/types/home-types"
import type { Collection } from "@/types/types"

export function useHeroCarouselQuery() {
  return useQuery({
    queryKey: ["home", "hero-carousel"],
    queryFn: fetchHeroCarouselImages,
    staleTime: 5 * 60 * 1000,
    select: (data: BannerCarouselResponse) => data.items,
  })
}

export function useNewArrivalsQuery() {
  return useQuery({
    queryKey: ["home", "new-arrivals"],
    queryFn: fetchNewArrival,
    staleTime: 5 * 60 * 1000,
    select: (data: ProductsResponse) => data.items,
  })
}

export function useTrendingProductsQuery() {
  return useQuery({
    queryKey: ["home", "trending-products"],
    queryFn: fetchTrendingProducts,
    staleTime: 5 * 60 * 1000,
    select: (data: ProductsResponse) => data.items,
  })
}

export function useCategoriesQuery() {
  return useQuery({
    queryKey: ["home", "categories"],
    queryFn: fetchFeaturedCategories,
    staleTime: Infinity,
    select: (data: any) => data.items || data,
  })
}

export function useRecentlyUpdatedCategoriesQuery() {
  return useQuery({
    queryKey: ["home", "categories", "recently-updated"],
    queryFn: async () => {
      const { fetchRecentlyUpdatedCategories } = await import("@/api/index")
      return fetchRecentlyUpdatedCategories()
    },
    staleTime: 5 * 60 * 1000,
    select: (data: any) => data.items || data,
  })
}

export function useFlashSaleQuery() {
  return useQuery({
    queryKey: ["home", "flash-sale"],
    queryFn: fetchFlashSaleProducts,
    staleTime: 5 * 60 * 1000,
    select: (res: any) => res.data || res,
  })
}

export function useFeaturedProductsQuery() {
  return useQuery({
    queryKey: ["home", "featured-products"],
    queryFn: fetchFeaturedProducts,
    staleTime: 5 * 60 * 1000,
    select: (data: ProductsResponse) => data.items,
  })
}

export function usePersonalizedRecommendationsQuery() {
  return useQuery({
    queryKey: ["home", "personalized-recommendations"],
    queryFn: fetchPersonalizedRecommendations,
    staleTime: 5 * 60 * 1000,
    select: (data: ProductsResponse) => data.items,
  })
}

import { useInfiniteQuery } from "@tanstack/react-query"

export function useInfinitePersonalizedRecommendationsQuery() {
  return useInfiniteQuery({
    queryKey: ["home", "infinite-personalized-recommendations"],
    queryFn: fetchPersonalizedRecommendationsPaginated,
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextOffset,
    staleTime: 5 * 60 * 1000,
  })
}

export function useOccasionsQuery() {
  return useQuery({
    queryKey: ["home", "occasions"],
    queryFn: fetchOccasions,
    staleTime: Infinity,
    select: (data: OccasionResponse) => data.items,
  })
}

export function useFeaturedCollectionsQuery() {
  return useQuery({
    queryKey: ["home", "featured-collections"],
    queryFn: fetchFeaturedCollections,
    staleTime: Infinity,
    select: (data: any) => data.items || data,
  })
}

export function useLookbookQuery() {
  return useQuery({
    queryKey: ["home", "lookbook"],
    queryFn: async () => {
      return {
        imageUrl:
          "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop",
        title: "Curated Excellence",
        subtitle: "The Editorial",
        description:
          "We believe in the power of understated elegance. Every piece in our collection is carefully selected to reflect an uncompromising dedication to quality across fashion, living, and lifestyle.",
        link: "/search?collection=editorial",
        linkText: "Explore The Edit",
      }
    },
    staleTime: Infinity,
  })
}

export function useCustomerReviewsQuery() {
  return useQuery({
    queryKey: ["home", "reviews"],
    queryFn: fetchCustomerReviews,
    staleTime: Infinity,
    select: (data: CustomerReviewResponse) => data.items,
  })
}
