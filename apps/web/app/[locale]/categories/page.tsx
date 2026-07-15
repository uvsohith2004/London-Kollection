import { CategoryService } from "@/services/category.service"
import { categoryQueries } from "@/queries/category.queries"
import { HydrationBoundary, dehydrate, QueryClient } from "@tanstack/react-query"
import { CategoriesClientPage } from "./client-page"

export default async function CategoriesPage() {
  const queryClient = new QueryClient()
  await queryClient.prefetchQuery(categoryQueries.list())

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <CategoriesClientPage />
    </HydrationBoundary>
  )
}
