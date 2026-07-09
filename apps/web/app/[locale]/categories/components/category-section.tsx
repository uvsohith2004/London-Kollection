import Link from "next/link"
import { PremiumProductCard } from "@/app/[locale]/(home)/components/product-card/premium-product-card"
import { fetchSearchProducts } from "@/lib/api"
import { ArrowRight } from "lucide-react"
import { OptimizedImage } from "@/components/optimized-image"

interface CategorySectionProps {
  category: {
    id: string
    name: string
    slug: string
    description?: string
    image?: any
  }
}

export async function CategorySection({ category }: CategorySectionProps) {
  // Fetch products for this category
  const response = await fetchSearchProducts({ category: category.slug, limit: 8 })
  const products = response?.items || []

  if (products.length === 0) return null

  return (
    <section id={`category-${category.slug}`} className="mb-24 scroll-mt-24">
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="font-heading text-4xl md:text-5xl font-bold tracking-tight mb-3">
            {category.name}
          </h2>
          {category.description && (
            <p className="text-muted-foreground max-w-2xl text-lg">
              {category.description}
            </p>
          )}
        </div>
        
        <Link 
          href={`/products?category=${category.slug}`} 
          className="group flex items-center gap-2 text-sm font-medium uppercase tracking-wider hover:text-primary transition-colors"
        >
          View all
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      {category.image && (
        <div className="relative w-full h-[40vh] md:h-[50vh] mb-12 rounded-3xl overflow-hidden group">
           <OptimizedImage
              asset={category.image}
              fallbackUrl={typeof category.image === 'string' ? category.image : undefined}
              alt={category.name}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
           />
           <div className="absolute inset-0 bg-black/10 transition-opacity group-hover:bg-black/0" />
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
        {products.map((product: any, idx: number) => (
          <PremiumProductCard 
            key={product.id} 
            product={product} 
            priority={idx < 4}
          />
        ))}
      </div>
    </section>
  )
}
