import { SearchOrchestrator } from "./components/search-orchestrator"
import { SearchParams } from "@/lib/api/index"

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedParams = await searchParams

  // Transform next.js searchParams into our typed SearchParams
  const params: SearchParams = {
    q: typeof resolvedParams.q === "string" ? resolvedParams.q : undefined,
    category:
      typeof resolvedParams.category === "string"
        ? resolvedParams.category
        : undefined,
    minPrice:
      typeof resolvedParams.minPrice === "string"
        ? Number(resolvedParams.minPrice)
        : undefined,
    maxPrice:
      typeof resolvedParams.maxPrice === "string"
        ? Number(resolvedParams.maxPrice)
        : undefined,
    sort:
      typeof resolvedParams.sort === "string" ? resolvedParams.sort : undefined,
  }

  return (
    <div className="bg-background">
      <SearchOrchestrator searchParams={params} />
    </div>
  )
}
