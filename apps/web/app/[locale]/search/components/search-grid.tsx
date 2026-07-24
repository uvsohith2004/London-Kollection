"use client"

import { useEffect, useRef, useState } from "react"
import { useInfiniteQuery } from "@tanstack/react-query"
import { useWindowVirtualizer } from "@tanstack/react-virtual"
import { SearchQuery } from "@workspace/api-contracts"
import { productQueries } from "@/queries/products.queries"
import { ProductCard } from "@/components/product-card"
import { SearchEmpty } from "./search-empty"
import { SearchSkeleton } from "./search-skeleton"
import { useRouter, usePathname } from "next/navigation"

export function SearchGrid({
  searchParams,
}: {
  searchParams: SearchQuery
}) {
  const router = useRouter()
  const pathname = usePathname()
  const containerRef = useRef<HTMLDivElement>(null)

  const {
    data,
    isLoading,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery(productQueries.listInfinite(searchParams))

  const products = data?.pages.flatMap((page) => page.items) || []

  const [columns, setColumns] = useState(2)

  useEffect(() => {
    const updateColumns = () => {
      if (!containerRef.current) return
      const width = containerRef.current.offsetWidth
      if (width >= 1024) setColumns(4)
      else if (width >= 768) setColumns(3)
      else setColumns(2)
    }

    updateColumns()
    window.addEventListener("resize", updateColumns)
    return () => window.removeEventListener("resize", updateColumns)
  }, [])

  const virtualizer = useWindowVirtualizer({
    count: hasNextPage ? Math.ceil(products.length / columns) + 1 : Math.ceil(products.length / columns),
    estimateSize: () => 450, // Approximate height of ProductCard + gap
    overscan: 3,
  })

  // Infinite scroll trigger
  useEffect(() => {
    const [lastItem] = virtualizer.getVirtualItems().slice(-1)
    if (!lastItem) return

    if (
      lastItem.index >= Math.ceil(products.length / columns) - 1 &&
      hasNextPage &&
      !isFetchingNextPage
    ) {
      fetchNextPage()
    }
  }, [hasNextPage, fetchNextPage, products.length, isFetchingNextPage, virtualizer.getVirtualItems(), columns])

  const handleClearFilters = () => {
    router.push(pathname)
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <SearchSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (!products.length) {
    return <SearchEmpty searchParams={searchParams} onClearFilters={handleClearFilters} />
  }

  return (
    <div ref={containerRef} className="w-full">
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: "100%",
          position: "relative",
        }}
      >
        {virtualizer.getVirtualItems().map((virtualRow) => {
          const isLoaderRow = virtualRow.index >= Math.ceil(products.length / columns)
          
          if (isLoaderRow) {
            return (
              <div
                key="loader"
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  transform: `translateY(${virtualRow.start}px)`,
                }}
                className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4 pb-4 md:pb-6"
              >
                {[...Array(columns)].map((_, i) => (
                  <SearchSkeleton key={i} />
                ))}
              </div>
            )
          }

          const startIndex = virtualRow.index * columns
          const rowProducts = products.slice(startIndex, startIndex + columns)

          return (
            <div
              key={virtualRow.key}
              data-index={virtualRow.index}
              ref={virtualizer.measureElement}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                transform: `translateY(${virtualRow.start}px)`,
              }}
              className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 pb-4 md:pb-6"
            >
              {rowProducts.map((product, idx) => (
                <div key={product.id}>
                  <ProductCard product={product} priority={virtualRow.index === 0 && idx < 4} />
                </div>
              ))}
            </div>
          )
        })}
      </div>
    </div>
  )
}
