import { SearchQuery } from "@workspace/api-contracts"

export function SearchEmpty({
  searchParams,
  onClearFilters,
}: {
  searchParams: SearchQuery
  onClearFilters: () => void
}) {
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
        className="max-w-sm text-sm font-light text-muted-foreground mb-6"
        dir="auto"
      >
        We couldn't find anything matching your current filters. Try adjusting
        your search criteria or clearing some filters.
      </p>
      <button
        onClick={onClearFilters}
        className="inline-flex h-10 items-center justify-center whitespace-nowrap rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
      >
        Clear Filters
      </button>
    </div>
  )
}
