"use client";

import { useQuery } from "@tanstack/react-query";
import { productQueries } from "@/queries/products.queries";
import { MobileProduct } from "./components/mobile-product";
import { DesktopProduct } from "./components/desktop-product";
import { TabProduct } from "./components/tab-product";
import { Loader2 } from "lucide-react";
import { Link } from "@/i18n/routing";
import { Button } from "@workspace/ui/components/button";
import { useDevice } from "@/hooks/use-media-query";
import { useEffect, useState } from "react";
import { ProductCard } from "@/components/product-card";
import { ProductReviews } from "@/components/reviews/product-reviews";

export function ClientProductView({ slug, variantId }: { slug: string; variantId: string }) {
  const { data: product, isLoading, error } = useQuery(productQueries.detailBySlug(slug));
  const { data: suggestionsData } = useQuery(productQueries.suggestions(product?.id || ""));
  
  const sameBrand = suggestionsData?.sameBrand || [];
  const otherBrands = suggestionsData?.otherBrands || [];
  
  // If the first item in the sameBrand list doesn't match the current product's brand, 
  // or if the current product has no brand, we know the backend fell back to category matching
  const isCategoryFallback = !product?.brandName || (sameBrand.length > 0 && sameBrand[0]?.brandName !== product.brandName);
  const primaryTitle = isCategoryFallback ? 'More from this category' : `More from ${product.brandName}`;
  
  const { isDesktop, isTablet, isMobile } = useDevice();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex flex-col h-screen w-full items-center justify-center bg-background px-4">
        <h1 className="text-3xl font-serif tracking-tight mb-4">Product Not Found</h1>
        <p className="text-muted-foreground mb-8 text-center max-w-md">
          We couldn't find the product you're looking for. It may have been removed or the link is incorrect.
        </p>
        <Link href="/">
          <Button className="rounded-full px-8 uppercase tracking-widest text-xs font-bold">
            Return Home
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background pt-8 max-md:pt-0">
      {isDesktop && <DesktopProduct product={product as any} variantId={variantId} />}
      {isTablet && <TabProduct product={product as any} variantId={variantId} />}
      {!isDesktop && !isTablet && <MobileProduct product={product as any} variantId={variantId} />}

      {/* Product Reviews */}
      <div className="container mx-auto px-4 md:px-8 py-16 md:py-24 border-t border-border/50">
        <div className="max-w-5xl mx-auto">
          <ProductReviews productId={product.id} />
        </div>
      </div>

      {/* Product Suggestions */}
      <div className="bg-muted/10 border-t border-border/50 overflow-hidden">
        <div className="py-16 md:py-24">
          
          {sameBrand.length > 0 && (
            <div className="mb-16 last:mb-0">
              <h2 className="text-2xl md:text-3xl font-serif tracking-wide mb-8 px-4 md:px-8 max-w-7xl mx-auto">
                {primaryTitle}
              </h2>
              <div className="flex overflow-x-auto snap-x snap-mandatory gap-6 px-4 md:px-8 pb-8 w-full" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                <style dangerouslySetInnerHTML={{ __html: `
                  .flex.overflow-x-auto::-webkit-scrollbar { display: none; }
                `}} />
                <div className="flex gap-6 mx-auto max-w-7xl w-full">
                  {sameBrand.map((p:any) => (
                    <div key={p.id} className="snap-start w-[280px] md:w-[320px] flex-shrink-0">
                      <ProductCard product={p as any} />
                    </div>
                  ))}
                  {/* Padding element for right edge spacing on mobile scroll */}
                  <div className="snap-start w-1 flex-shrink-0"></div>
                </div>
              </div>
            </div>
          )}

          {otherBrands.length > 0 && (
            <div className="mb-16 last:mb-0">
              <h2 className="text-2xl md:text-3xl font-serif tracking-wide mb-8 px-4 md:px-8 max-w-7xl mx-auto">
                You May Also Like
              </h2>
              <div className="flex overflow-x-auto snap-x snap-mandatory gap-6 px-4 md:px-8 pb-8 w-full" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                <div className="flex gap-6 mx-auto max-w-7xl w-full">
                  {otherBrands.map((p:any) => (
                    <div key={p.id} className="snap-start w-[280px] md:w-[320px] flex-shrink-0">
                      <ProductCard product={p as any} />
                    </div>
                  ))}
                  {/* Padding element for right edge spacing on mobile scroll */}
                  <div className="snap-start w-1 flex-shrink-0"></div>
                </div>
              </div>
            </div>
          )}

          {sameBrand.length === 0 && otherBrands.length === 0 && (
            <div className="container mx-auto px-4 md:px-8 max-w-7xl">
              <h2 className="text-2xl md:text-3xl font-serif tracking-wide mb-12 text-center">You May Also Like</h2>
              <div className="flex items-center justify-center min-h-[100px] text-muted-foreground text-sm uppercase tracking-widest">
                No related products found
              </div>
            </div>
          )}

        </div>
      </div>
    </main>
  );
}
