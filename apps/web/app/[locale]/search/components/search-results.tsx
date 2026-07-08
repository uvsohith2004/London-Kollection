"use client"

import { useSearchQuery } from "../services/queries"
import { SearchParams } from "@/lib/api/index"
import { PremiumProductCard } from "../../(home)/components/product-card/premium-product-card"
import { PremiumMobileProductCard } from "../../(home)/components/product-card/premium-mobile-product-card"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { useDevice } from "@/hooks/use-media-query"

export function SearchResults({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const { data: products, isLoading } = useSearchQuery(searchParams)
  const { isMobile } = useDevice()

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="w-full">
            <Skeleton className="aspect-[3/4] w-full rounded-2xl" />
            <Skeleton className="mt-4 h-5 w-3/4" />
            <Skeleton className="mt-2 h-4 w-1/4" />
          </div>
        ))}
      </div>
    )
  }

  if (!products || products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center px-4 py-24 text-center">
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-secondary/30">
          <svg
            className="h-8 w-8 text-muted-foreground/60"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        <h2
          className="mb-2 font-serif text-2xl tracking-tight text-foreground"
          dir="auto"
        >
          No results found
        </h2>
        <p
          className="max-w-sm text-sm font-light text-muted-foreground"
          dir="auto"
        >
          We couldn't find anything matching your current filters. Try adjusting
          your search criteria or clearing some filters.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
      {products.map((product) => (
        <div key={product.id}>
          {isMobile ? (
            <PremiumMobileProductCard product={product} />
          ) : (
            <PremiumProductCard product={product} />
          )}
        </div>
      ))}
    </div>
  )
}
