import { fetchSearchProducts } from "@/lib/api"
import { PremiumProductCard } from "@/app/[locale]/(home)/components/product-card/premium-product-card"

export default async function CategoryDetailsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  // Fetch products for this specific category
  const response = await fetchSearchProducts({ category: slug, limit: 50 })
  const products = response?.items || []

  // Capitalize category name for the header
  const categoryName = slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, ' ');

  return (
    <div className="container mx-auto px-4 py-16 md:py-24 min-h-screen">
      <div className="mb-12 text-center">
        <h1 className="font-heading text-5xl md:text-7xl font-bold tracking-tighter uppercase mb-4">
          {categoryName}
        </h1>
        <p className="text-muted-foreground text-lg md:text-xl font-light">
          Explore our exclusive collection of {categoryName.toLowerCase()}.
        </p>
      </div>

      {products.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
          {products.map((product: any, idx: number) => (
            <PremiumProductCard 
              key={product.id} 
              product={product} 
              priority={idx < 4}
            />
          ))}
        </div>
      ) : (
        <div className="py-32 flex flex-col items-center justify-center text-center">
          <p className="text-muted-foreground text-xl mb-6">No products found in this category.</p>
        </div>
      )}
    </div>
  );
}
