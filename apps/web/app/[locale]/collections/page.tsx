import { CollectionService } from "@/services/collection.service"
import { ProductService } from "@/services/product.service"
import { ProductCard } from "@/components/product-card"
import { OptimizedImage } from "@/components/optimized-image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

async function CollectionSection({ collection, index }: { collection: any, index: number }) {
  const response = await ProductService.search({ collectionId: collection.id, limit: "4" })
  const products = response?.items || []

  if (products.length === 0) return null

  // Alternate image placement (left vs right) based on index
  const isImageRight = index % 2 !== 0

  return (
    <section className="min-h-[80vh] flex flex-col justify-center py-24 border-b border-border/40 last:border-0 relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <div className={`flex flex-col lg:flex-row items-center gap-16 ${isImageRight ? 'lg:flex-row-reverse' : ''}`}>
          
          {/* Text Content */}
          <div className="flex-1 w-full max-w-2xl space-y-8">
            <h2 className="font-heading text-5xl md:text-7xl font-bold tracking-tighter uppercase leading-none">
              {collection.name}
            </h2>
            
            {collection.description && (
              <p className="text-muted-foreground text-lg md:text-xl font-light leading-relaxed">
                {collection.description}
              </p>
            )}

            <div className="pt-4">
              <Link 
                href={`/collections/${collection.slug}`} 
                className="group inline-flex items-center gap-3 text-sm font-semibold uppercase tracking-widest hover:text-primary transition-colors border-b-2 border-primary/20 hover:border-primary pb-1"
              >
                Explore Collection
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-2" />
              </Link>
            </div>
          </div>

          {/* Featured Image */}
          {collection.image && (
            <div className="flex-1 w-full relative">
              <div className="aspect-4/5 md:aspect-square w-full rounded-2xl overflow-hidden shadow-2xl relative group">
                <OptimizedImage
                  asset={collection.image}
                  fallbackUrl={typeof collection.image === 'string' ? collection.image : undefined}
                  alt={collection.name}
                  fill
                  priority={index === 0}
                  className="object-cover transition-transform duration-[20s] ease-linear group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/10 transition-opacity group-hover:bg-black/0" />
              </div>
            </div>
          )}

        </div>

        {/* Featured Products Row */}
        <div className="mt-24">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-serif text-2xl">Featured Pieces</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {products.map((product: any, idx: number) => (
              <ProductCard 
                key={product.id} 
                product={product} 
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default async function CollectionsPage() {
  const response = await CollectionService.getAdminAll()
  const collections = Array.isArray(response) ? response : (response?.items || [])

  const activeCollections = collections.filter((c: any) => c.isActive !== false)

  return (
    <div className="bg-background">
      <div className="pt-24 pb-12 md:pt-32 md:pb-16 text-center container mx-auto px-4">
        <h1 className="font-heading text-6xl md:text-8xl font-bold tracking-tighter uppercase mb-6">
          Collections
        </h1>
        <p className="text-muted-foreground text-lg md:text-xl font-light max-w-2xl mx-auto">
          Our exclusive curations. Where concept meets execution in limited-edition capsules.
        </p>
      </div>

      <div className="flex flex-col">
        {activeCollections.map((collection: any, index: number) => (
          <CollectionSection key={collection.id} collection={collection} index={index} />
        ))}

        {activeCollections.length === 0 && (
          <div className="py-32 text-center text-muted-foreground">
            No collections found.
          </div>
        )}
      </div>
    </div>
  )
}
