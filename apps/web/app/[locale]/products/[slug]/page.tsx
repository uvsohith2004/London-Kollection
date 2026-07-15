import { redirect } from "next/navigation";
import { ProductService } from "@/services/product.service";

export default async function ProductRedirectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  
  try {
    const product = await ProductService.getBySlug(slug);
    
    if (product && product.variants && product.variants.length > 0) {
      const defaultVariant = product.variants.find((v: any) => v.isDefault) || product.variants[0];
      if (defaultVariant) {
        redirect(`/products/${slug}/${defaultVariant.id}`);
      }
    }
  } catch (error) {

  }

  return (
    <div className="flex h-screen w-full items-center justify-center bg-background px-4">
      <div className="text-center">
        <h1 className="text-3xl font-serif tracking-tight mb-4">Product Not Found</h1>
        <p className="text-muted-foreground mb-8 text-center max-w-md">
          We couldn't find the product you're looking for. It may have been removed or the link is incorrect.
        </p>
      </div>
    </div>
  );
}
