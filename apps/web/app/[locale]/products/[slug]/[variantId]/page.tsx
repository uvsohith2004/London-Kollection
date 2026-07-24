import {
  HydrationBoundary,
  dehydrate,
  QueryClient,
} from "@tanstack/react-query"
import { productQueries } from "@/queries/products.queries"
import { ClientProductView } from "./client-product-view"

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string; variantId: string }>
}) {
  const { slug, variantId } = await params

  const queryClient = new QueryClient()

  // Prefetch the main product
  await queryClient.prefetchQuery(productQueries.detailBySlug(slug))

  // To prefetch related products, we need the product ID.
  // We can fetch it, then prefetch related.
  const product = queryClient.getQueryData(
    productQueries.detailBySlug(slug).queryKey
  ) as any
  if (product?.id) {
    await queryClient.prefetchQuery(productQueries.relatedProducts(product.id))
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ClientProductView slug={slug} variantId={variantId} />
    </HydrationBoundary>
  )
}
