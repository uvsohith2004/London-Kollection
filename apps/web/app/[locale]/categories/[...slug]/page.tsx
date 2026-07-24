import {
  HydrationBoundary,
  dehydrate,
  QueryClient,
} from "@tanstack/react-query"
import { productQueries } from "@/queries/products.queries"
import { CategoryDetailsClientPage } from "./client-page"
import { SearchQuery } from "@workspace/api-contracts"
import { Metadata, ResolvingMetadata } from "next"
import { serverApi } from "@/api-client/server"

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string[] }> },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { slug: slugArray } = await params
  const slug = slugArray[slugArray.length - 1]!

  try {
    const category = await serverApi.get<any>(`/categories/slug/${slug}`)
    
    if (!category) return {}

    const title = category.seo?.title || category.name
    const description = category.seo?.description || category.description || `Browse our latest ${category.name} collection.`
    
    const primaryImage = category.image?.url || category.image?.avif?.url || category.image?.webp?.url
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://londonkollection.com"
    const url = `${siteUrl}/categories/${slugArray.join('/')}`

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        url,
        type: "website",
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

export default async function CategoryDetailsPage({
  params,
}: {
  params: Promise<{ slug: string[] }>
}) {
  const { slug: slugArray } = await params

  // Get the leaf slug (the last segment of the path) for database querying
  const slug = slugArray[slugArray.length - 1]!

  const queryClient = new QueryClient()
  const queryParams: SearchQuery = { categoryId: slug, limit: "50" }

  await queryClient.prefetchQuery(productQueries.list(queryParams))

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <CategoryDetailsClientPage slug={slug} />
    </HydrationBoundary>
  )
}
