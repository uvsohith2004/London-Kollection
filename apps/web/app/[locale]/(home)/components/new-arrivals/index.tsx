"use client"

import Link from "next/link"
import { MoveRight } from "lucide-react"
import { useNewArrivalsQuery } from "../../services/queries"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { useDevice } from "@/hooks/use-media-query"
import { PremiumProductCard } from "../product-card/premium-product-card"
import { PremiumMobileProductCard } from "../product-card/premium-mobile-product-card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@workspace/ui/components/carousel"

export function HomeNewArrivals() {
  const { data: products, isLoading } = useNewArrivalsQuery()
  const { isMobile } = useDevice()

  return (
    <div className="w-full">
      <div className="container mx-auto mb-8 flex items-end justify-between px-4 md:mb-12 md:px-6">
        <div>
          <h2
            className="font-serif text-3xl tracking-tight md:text-5xl"
            dir="auto"
          >
            Just In
          </h2>
          <p
            className="mt-2 max-w-md text-sm font-light text-muted-foreground md:mt-3 md:text-base"
            dir="auto"
          >
            Discover the latest additions to our collection.
          </p>
        </div>
        <Link
          href="/new-arrivals"
          className="group hidden items-center gap-2 text-xs font-semibold tracking-widest uppercase transition-colors hover:text-muted-foreground md:flex"
        >
          View All{" "}
          <MoveRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      <div className="w-full">
        {isLoading ? (
          <div className="container mx-auto flex gap-4 overflow-hidden px-4 pb-8 md:gap-6 md:px-6">
            {[1, 2, 3, 4].map((i) => (
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

      <div className="container mx-auto mt-2 flex justify-center px-4 md:hidden">
        <Link
          href="/new-arrivals"
          className="border-b border-foreground pb-1 text-xs font-semibold tracking-widest uppercase"
        >
          View All Additions
        </Link>
      </div>
    </div>
  )
}
