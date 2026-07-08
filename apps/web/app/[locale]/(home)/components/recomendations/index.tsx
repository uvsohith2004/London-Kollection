"use client"

import { usePersonalizedRecommendationsQuery } from "../../services/queries"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { useDevice } from "@/hooks/use-media-query"
import { PremiumProductCard } from "../product-card/premium-product-card"
import { PremiumMobileProductCard } from "../product-card/premium-mobile-product-card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@workspace/ui/components/carousel"

export function HomePersonalizedRecommendations() {
  const { data: products, isLoading } = usePersonalizedRecommendationsQuery()
  const { isMobile } = useDevice()

  // Only render if we have data
  if (!isLoading && (!products || products.length === 0)) return null

  return (
    <div className="w-full">
      <div className="container mx-auto mb-8 px-4 text-center md:px-6 md:text-start">
        <h2
          className="font-serif text-2xl tracking-tight md:text-4xl"
          dir="auto"
        >
          Recommended For You
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
                    className="basis-[85vw] pl-4 sm:basis-[45vw] md:basis-[33vw] md:pl-6 lg:basis-[25vw]"
                  >
                    {isMobile ? (
                      <PremiumMobileProductCard product={product} />
                    ) : (
                      <PremiumProductCard product={product} />
                    )}
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
