import { SearchOrchestrator } from "./components/search-orchestrator"
import { SearchQuery } from "@workspace/api-contracts"
import { HydrationBoundary, dehydrate, QueryClient } from "@tanstack/react-query"
import { productQueries } from "@/queries/products.queries"

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedParams = await searchParams

  const params: SearchQuery = {
    q: typeof resolvedParams.q === "string" ? resolvedParams.q : undefined,
    categoryId:
      typeof resolvedParams.category === "string"
        ? resolvedParams.category
        : undefined,
    minPrice:
      typeof resolvedParams.minPrice === "string"
        ? resolvedParams.minPrice
        : undefined,
    maxPrice:
      typeof resolvedParams.maxPrice === "string"
        ? resolvedParams.maxPrice
        : undefined,
    sortBy:
      typeof resolvedParams.sort === "string" ? (resolvedParams.sort as any) : undefined,
  }

  const queryClient = new QueryClient()
  await queryClient.prefetchQuery(productQueries.list(params))

  return (
    <div className="bg-background">
      <HydrationBoundary state={dehydrate(queryClient)}>
        <SearchOrchestrator searchParams={params} />
      </HydrationBoundary>
    </div>
  )
}
