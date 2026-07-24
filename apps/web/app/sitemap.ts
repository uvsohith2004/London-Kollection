import { MetadataRoute } from 'next'
import { serverApi } from "@/api-client/server"
import type { Product, ProductsResponse } from "@workspace/api-contracts"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://londonkollection.com"
  
  // Static routes
  const routes: MetadataRoute.Sitemap = [
    {
      url: `${siteUrl}/en`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${siteUrl}/en/products`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${siteUrl}/en/categories`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    }
  ]

  try {
    // Fetch all products (limit to 1000 for sitemap)
    const productsRes = await serverApi.get<ProductsResponse>("/products/search?limit=1000")
    if (productsRes && productsRes.items) {
      const productRoutes: MetadataRoute.Sitemap = productsRes.items.map((product) => ({
        url: `${siteUrl}/en/products/${product.slug}`,
        lastModified: product.updatedAt ? new Date(product.updatedAt) : new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      }))
      routes.push(...productRoutes)
    }

    // Fetch all categories
    const categories = await serverApi.get<any[]>("/categories")
    if (Array.isArray(categories)) {
      const categoryRoutes: MetadataRoute.Sitemap = categories.map((category) => ({
        // Assuming category has a slug field
        url: `${siteUrl}/en/categories/${category.slug}`,
        lastModified: category.updatedAt ? new Date(category.updatedAt) : new Date(),
        changeFrequency: 'weekly',
        priority: 0.7,
      }))
      routes.push(...categoryRoutes)
    }
  } catch (e) {
    console.error("Error generating sitemap", e)
  }

  return routes
}
