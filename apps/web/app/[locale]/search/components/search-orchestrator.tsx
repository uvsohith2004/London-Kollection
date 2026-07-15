"use client"

import { SearchQuery } from "@workspace/api-contracts"
import { SearchFilters } from "./search-filters"
import { SearchResults } from "./search-results"
import { useSearchStore } from "../store"
import { Button } from "@workspace/ui/components/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@workspace/ui/components/sheet"
import { SlidersHorizontal } from "lucide-react"

export function SearchOrchestrator({
  searchParams,
}: {
  searchParams: SearchQuery
}) {
  const { isMobileFiltersOpen, setMobileFiltersOpen } = useSearchStore()

  return (
    <div className="container mx-auto min-h-screen px-4 py-6 md:px-6 md:py-12">
      {/* Header section */}
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1
            className="font-serif text-3xl tracking-tight text-foreground md:text-5xl"
            dir="auto"
          >
            {searchParams.q
              ? `Results for "${searchParams.q}"`
              : "All Collection"}
          </h1>
          <p
            className="mt-2 max-w-md text-sm font-light text-muted-foreground md:text-base"
            dir="auto"
          >
            Explore our curated selection.
          </p>
        </div>

        {/* Mobile Filter Toggle Button */}
        <div className="md:hidden">
          <Button
            variant="outline"
            className="h-12 w-full border-border/50 bg-background text-xs font-semibold tracking-widest text-foreground uppercase hover:bg-secondary/20"
            onClick={() => setMobileFiltersOpen(true)}
          >
            <SlidersHorizontal className="mr-2 h-4 w-4" />
            Filter & Sort
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-8 md:flex-row">
        {/* Desktop / Tablet Filters (Hidden on Mobile) */}
        <aside className="hidden w-1/4 shrink-0 pr-4 md:block">
          <div className="sticky top-24">
            <SearchFilters />
          </div>
        </aside>

        {/* Mobile Filters (Sheet Drawer) */}
        <Sheet open={isMobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
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

        {/* Product Grid Area */}
        <main className="w-full flex-1">
          <SearchResults searchParams={searchParams} />
        </main>
      </div>
    </div>
  )
}
