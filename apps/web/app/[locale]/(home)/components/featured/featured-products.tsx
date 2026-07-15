"use client"

import Link from "next/link"
import { useFeaturedProductsQuery } from "../../services/queries"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { useDevice } from "@/hooks/use-media-query"
import { ProductCard } from "@/components/product-card"

export function HomeFeaturedProducts() {
  const { data: products, isLoading } = useFeaturedProductsQuery()
  const { isMobile } = useDevice()

  // Display max 4 items in a grid rather than a scroll for featured
  return (
    <div className="w-full">
      <div className="container mx-auto mb-8 px-4 text-center md:mb-12 md:px-6">
        <h2
          className="mb-4 text-xs font-semibold tracking-[0.3em] text-muted-foreground uppercase"
          dir="auto"
        >
          The Spotlight
        </h2>
        <h3
          className="font-serif text-3xl tracking-tight md:text-5xl"
          dir="auto"
        >
          Featured Pieces
        </h3>
        <p
          className="mx-auto mt-3 max-w-md text-sm font-light text-muted-foreground md:text-base"
          dir="auto"
        >
          Handpicked by our stylists for their exceptional craftsmanship and
          timeless appeal.
        </p>
      </div>

      <div className="container mx-auto px-4 md:px-6">
        {isLoading ? (
          <div className="grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="w-full">
                <Skeleton className="aspect-3/4 w-full" />
                <Skeleton className="mt-4 h-5 w-3/4" />
                <Skeleton className="mt-2 h-4 w-1/4" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-4">
            {products?.slice(0, 4).map((product) => (
              <div key={product.id} className="w-full">
                  <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}

        <div className="mt-12 text-center">
          <Link
            href="/featured"
            className="border-b border-foreground pb-1 text-xs font-semibold tracking-widest uppercase transition-colors hover:text-muted-foreground"
          >
            Discover All Featured
          </Link>
        </div>
      </div>
    </div>
  )
}
