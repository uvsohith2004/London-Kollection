import { SearchSkeleton } from "./components/search-skeleton"
import { SearchFilters } from "./components/search-filters"
import { Button } from "@workspace/ui/components/button"
import { SlidersHorizontal } from "lucide-react"

export default function SearchLoading() {
  return (
    <div className="container mx-auto min-h-screen px-4 py-6 md:px-6 md:py-12">
      {/* Header section skeleton */}
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <div className="h-10 w-64 animate-pulse rounded-md bg-secondary md:h-12 md:w-96" />
          <div className="mt-4 h-5 w-48 animate-pulse rounded-md bg-secondary" />
        </div>

        {/* Mobile Filter Toggle Skeleton */}
        <div className="md:hidden">
          <Button
            variant="outline"
            disabled
            className="h-12 w-full border-border/50 bg-background"
          >
            <SlidersHorizontal className="mr-2 h-4 w-4" />
            Filter & Sort
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-8 md:flex-row">
        {/* Desktop / Tablet Filters (Hidden on Mobile) */}
        <aside className="hidden w-1/4 shrink-0 pr-4 md:block">
          <div className="sticky top-24 opacity-50 pointer-events-none grayscale">
            <SearchFilters />
          </div>
        </aside>

        {/* Product Grid Area Skeleton */}
        <main className="w-full flex-1">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <SearchSkeleton key={i} />
            ))}
          </div>
        </main>
      </div>
    </div>
  )
}
