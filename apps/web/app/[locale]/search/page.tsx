import { SearchQuery } from "@workspace/api-contracts"
import { HydrationBoundary, dehydrate, QueryClient } from "@tanstack/react-query"
import { productQueries } from "@/queries/products.queries"
import { SearchFilters } from "./components/search-filters"
import { SearchGrid } from "./components/search-grid"
import { Button } from "@workspace/ui/components/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@workspace/ui/components/sheet"
import { SlidersHorizontal } from "lucide-react"

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedParams = await searchParams

  const params: SearchQuery = {
    q: typeof resolvedParams.q === "string" ? resolvedParams.q : undefined,
    categoryId: typeof resolvedParams.category === "string" ? resolvedParams.category : undefined,
    minPrice: typeof resolvedParams.minPrice === "string" ? resolvedParams.minPrice : undefined,
    maxPrice: typeof resolvedParams.maxPrice === "string" ? resolvedParams.maxPrice : undefined,
    sortBy: typeof resolvedParams.sort === "string" ? (resolvedParams.sort as any) : undefined,
    isBranded: typeof resolvedParams.branded === "string" ? (resolvedParams.branded as any) : undefined,
  }

  const queryClient = new QueryClient()
  await queryClient.prefetchInfiniteQuery(productQueries.listInfinite(params))

  return (
    <div className="bg-background">
      <div className="container mx-auto min-h-screen px-4 py-6 md:px-6 md:py-12">
        {/* Header section */}
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h1
              className="font-serif text-3xl tracking-tight text-foreground md:text-5xl"
              dir="auto"
            >
              {params.q ? `Results for "${params.q}"` : "All Collection"}
            </h1>
            <p
              className="mt-2 max-w-md text-sm font-light text-muted-foreground md:text-base"
              dir="auto"
            >
              Explore our curated selection.
            </p>
          </div>

          {/* Mobile Filter Toggle */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger
                render={
                  <Button
                    variant="outline"
                    className="h-12 w-full border-border/50 bg-background text-xs font-semibold tracking-widest text-foreground uppercase hover:bg-secondary/20"
                  />
                }
              >
                <div className="flex items-center justify-center">
                  <SlidersHorizontal className="mr-2 h-4 w-4" />
                  Filter & Sort
                </div>
              </SheetTrigger>
              <SheetContent
                side="bottom"
                className="h-[85vh] rounded-t-3xl px-0 sm:max-w-md"
              >
                <SheetHeader className="border-b border-border/50 px-6 pb-4 text-left">
                  <SheetTitle className="font-serif text-xl tracking-wide">
                    Filter & Sort
                  </SheetTitle>
                </SheetHeader>
                <div className="h-[calc(85vh-70px)] overflow-y-auto p-6">
                  <SearchFilters />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        <div className="flex flex-col gap-8 md:flex-row">
          {/* Desktop / Tablet Filters (Hidden on Mobile) */}
          <aside className="hidden w-1/4 shrink-0 pr-4 md:block">
            <div className="sticky top-24">
              <SearchFilters />
            </div>
          </aside>

          {/* Product Grid Area */}
          <main className="w-full flex-1">
            <HydrationBoundary state={dehydrate(queryClient)}>
              <SearchGrid searchParams={params} />
            </HydrationBoundary>
          </main>
        </div>
      </div>
    </div>
  )
}
