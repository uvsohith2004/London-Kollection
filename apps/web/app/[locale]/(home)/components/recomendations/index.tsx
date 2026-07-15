"use client"

import { useInfinitePersonalizedRecommendationsQuery } from "../../services/queries"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { useDevice } from "@/hooks/use-media-query"
import { ProductCard } from "@/components/product-card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@workspace/ui/components/carousel"
import { Button } from "@workspace/ui/components/button"
import { Loader2 } from "lucide-react"

export function HomePersonalizedRecommendations() {
  const { data, isLoading, isError, error, isFetchingNextPage, hasNextPage, fetchNextPage } = useInfinitePersonalizedRecommendationsQuery()
  const { isMobile } = useDevice()

  const allProducts = data?.pages.flatMap(page => page.items) || []

  // Only render if we have data or are loading
  if (!isLoading && allProducts.length === 0) {
    if (isError) {
      console.error("Recommendations error:", error);
      return <div className="p-8 text-red-500">Error loading recommendations: {String(error)}</div>
    }
    return <div className="p-8 text-gray-500">No recommended products found.</div>
  }

  return (
    <div className="w-full">
      <div className="container mx-auto mb-8 px-4 text-center md:px-6 md:text-start flex justify-between items-center">
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
                <Skeleton className="aspect-[3/4] w-full" />
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
              <CarouselContent className="-ml-4 md:-ml-6 items-center">
                {allProducts.map((product) => (
                  <CarouselItem
                    key={product.id}
                    className="basis-[45vw] pl-4 sm:basis-[33vw] md:basis-[25vw] md:pl-6 lg:basis-[20vw]"
                  >
                      <ProductCard product={product} />
                  </CarouselItem>
                ))}
                
                {hasNextPage && (
                  <CarouselItem className="basis-[50vw] pl-4 sm:basis-[30vw] md:basis-[20vw] md:pl-6 lg:basis-[15vw] flex items-center justify-center">
                    <Button 
                      variant="outline" 
                      className="rounded-full px-8 py-6 h-auto"
                      onClick={() => fetchNextPage()}
                      disabled={isFetchingNextPage}
                    >
                      {isFetchingNextPage ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Loading...
                        </>
                      ) : (
                        "See More"
                      )}
                    </Button>
                  </CarouselItem>
                )}
              </CarouselContent>
            </Carousel>
          </div>
        )}
      </div>
    </div>
  )
}
