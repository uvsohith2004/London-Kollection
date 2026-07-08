"use client";

import { use } from "react";
import { useProductQuery } from "./queries";
import { MobileProduct } from "./components/mobile-product";
import { DesktopProduct } from "./components/desktop-product";
import { TabProduct } from "./components/tab-product";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@workspace/ui/components/button";
import { ProductReviews } from "@/components/reviews/product-reviews";
import { useDevice } from "@/hooks/use-media-query";
import { useEffect, useState } from "react";

export default function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { data: product, isLoading, error } = useProductQuery(slug);
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
      {isDesktop && <DesktopProduct product={product} />}
      {isTablet && <TabProduct product={product} />}
      {!isDesktop && !isTablet && <MobileProduct product={product} />}

      {/* Product Reviews */}
      <div className="container mx-auto px-4 md:px-8 py-16 md:py-24 border-t border-border/50">
        <div className="max-w-350 mx-auto">
          <h2 className="text-2xl md:text-3xl font-serif tracking-wide mb-12">Customer Reviews</h2>
          <ProductReviews productId={product.id} />
        </div>
      </div>

      {/* Related Products Placeholder */}
      <div className="bg-muted/10 border-t border-border/50">
        <div className="container mx-auto px-4 md:px-8 py-16 md:py-24">
          <div className="max-w-350 mx-auto">
            <h2 className="text-2xl md:text-3xl font-serif tracking-wide mb-12">You May Also Like</h2>
            <div className="flex items-center justify-center min-h-100 bg-background border border-border/50 text-muted-foreground text-sm uppercase tracking-widest">
              Related products coming soon
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
