import {
  HydrationBoundary,
  dehydrate,
  QueryClient,
} from "@tanstack/react-query"
import { productQueries } from "@/queries/products.queries"
import { ClientProductView } from "./client-product-view"

import { Metadata, ResolvingMetadata } from "next"
import { serverApi } from "@/api-client/server"
import type { Product } from "@workspace/api-contracts"

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string; variantId: string }> },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { slug } = await params
  try {
    // We fetch using serverApi directly to bypass client-only axios config
    const product = await serverApi.get<Product>(`/products/slug/${slug}`)
    
    if (!product) return {}

    const title = product.seo?.title || product.title
    const description = product.seo?.description || product.shortDescription
    
    // Pick the primary image (usually the first one from the first variant)
    const primaryImage = product.variants?.[0]?.images?.[0]?.url
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://londonkollection.com"
    const url = `${siteUrl}/products/${slug}`

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        url,
        type: "article",
        images: primaryImage ? [{ url: primaryImage }] : [],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: primaryImage ? [primaryImage] : [],
      }
    }
  } catch (error) {
    return {}
  }
}

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
