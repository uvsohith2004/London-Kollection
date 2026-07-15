import { ProductService } from "@/services/product.service"
import { CollectionService } from "@/services/collection.service"
import { ProductCard } from "@/components/product-card"

export default async function CollectionDetailsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  const collectionsRes = await CollectionService.getAdminAll();
  const collections = Array.isArray(collectionsRes) ? collectionsRes : (collectionsRes?.items || []);
  const collection = collections.find((c: any) => c.slug === slug);

  const collectionName = collection?.name || slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, ' ');

  const collectionId = collection?.id || slug;
  
  const response = await ProductService.search({ collectionId, limit: "50" })
  const products = response?.items || []

  return (
    <div className="container mx-auto px-4 py-16 md:py-24 min-h-screen">
      <div className="mb-12 text-center">
        <h1 className="font-heading text-5xl md:text-7xl font-bold tracking-tighter uppercase mb-4">
          {collectionName}
        </h1>
        {collection?.description ? (
           <p className="text-muted-foreground text-lg md:text-xl font-light max-w-2xl mx-auto">
             {collection.description}
           </p>
        ) : (
          <p className="text-muted-foreground text-lg md:text-xl font-light">
            Explore our exclusive {collectionName.toLowerCase()} collection.
          </p>
        )}
      </div>

      {products.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
          {products.map((product: any, idx: number) => (
            <ProductCard 
              key={product.id} 
              product={product} 
              priority={idx < 4}
            />
          ))}
        </div>
      ) : (
        <div className="py-32 flex flex-col items-center justify-center text-center">
          <p className="text-muted-foreground text-xl mb-6">No products found in this collection.</p>
        </div>
      )}
    </div>
  );
}
