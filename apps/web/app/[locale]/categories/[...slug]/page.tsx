import { HydrationBoundary, dehydrate, QueryClient } from "@tanstack/react-query"
import { productQueries } from "@/queries/products.queries"
import { CategoryDetailsClientPage } from "./client-page"
import { SearchQuery } from "@workspace/api-contracts"

export default async function CategoryDetailsPage({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug: slugArray } = await params;
  
  // Get the leaf slug (the last segment of the path) for database querying
  const slug = slugArray[slugArray.length - 1]!;
  
  const queryClient = new QueryClient();
  const queryParams: SearchQuery = { categoryId: slug, limit: "50" };
  
  await queryClient.prefetchQuery(productQueries.list(queryParams));

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <CategoryDetailsClientPage slug={slug} />
    </HydrationBoundary>
  );
}
