"use client"

import { useQuery } from "@tanstack/react-query"
import { apiClient } from "@/api-client/client"
import { useHomeStore } from "../../store"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { useDevice } from "@/hooks/use-media-query"
import { ProductCard } from "@/components/product-card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@workspace/ui/components/carousel"
import type { Product } from "@/types/types"
import type { ProductsResponse } from "@/types/home-types"

export function HomeRecentlyViewed() {
  const recentlyViewedIds = useHomeStore((state) => state.recentlyViewedIds)
  const { isMobile } = useDevice()

  const { data: products, isLoading } = useQuery({
    queryKey: ["home", "recently-viewed", recentlyViewedIds],
    queryFn: async (): Promise<Product[]> => {
      if (recentlyViewedIds.length === 0) return []

      const response = await apiClient.get<ProductsResponse>("/products")
      const data = response.data || response
      const items = (data as any)?.items || []
      return items.filter((item: Product) =>
        recentlyViewedIds.includes(item.id)
      )
    },
    enabled: recentlyViewedIds.length > 0, // Only fetch if we have history
    staleTime: 5 * 60 * 1000,
  })

  if (
    recentlyViewedIds.length === 0 ||
    (!isLoading && (!products || products.length === 0))
  ) {
    return null
  }

  return (
    <div className="w-full">
      <div className="container mx-auto mb-8 px-4 md:px-6">
        <h2
          className="text-center font-serif text-2xl tracking-tight md:text-start md:text-3xl"
          dir="auto"
        >
          Recently Viewed
        </h2>
      </div>

      <div className="w-full">
        {isLoading ? (
          <div className="container mx-auto flex gap-4 overflow-hidden px-4 pb-8 md:gap-6 md:px-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="w-[85vw] shrink-0 sm:w-[45vw] md:w-[33vw] lg:w-[25vw]"
              >
                <Skeleton className="aspect-3/4 w-full" />
                <Skeleton className="mt-4 h-5 w-3/4" />
                <Skeleton className="mt-2 h-4 w-1/4" />
              </div>
            ))}
          </div>
        ) : (
          <div dir="ltr" className="container mx-auto px-4 pb-8 md:px-6">
            <Carousel
              opts={{ align: "start", dragFree: true }}
              className="w-full"
            >
              <CarouselContent className="-ml-4 md:-ml-6">
                {products?.map((product) => (
                  <CarouselItem
                    key={product.id}
                    className="basis-[45vw] pl-4 sm:basis-[33vw] md:basis-[25vw] md:pl-6 lg:basis-[20vw]"
                  >
                      <ProductCard product={product} />
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
          </div>
        )}
      </div>
    </div>
  )
}
