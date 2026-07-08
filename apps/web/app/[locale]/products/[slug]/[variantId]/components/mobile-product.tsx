import { useState, useMemo, useEffect } from "react";
import { OptimizedImage } from "@/components/optimized-image";
import { Product } from "../queries";
import { useCartStore } from "@/store/cart-store";
import { Button } from "@workspace/ui/components/button";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { cn } from "@workspace/ui/lib/utils";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { Heart, Share2 } from "lucide-react";
import { useWishlistStore } from "@/store/wishlist-store";
import { ShareModal } from "@/components/share-modal";
import { useRouter, usePathname } from "@/i18n/routing";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi
} from "@workspace/ui/components/carousel";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@workspace/ui/components/accordion";

export function MobileProduct({ product, variantId }: { product: Product, variantId?: string }) {
  const router = useRouter();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlistStore();
  const [isSharing, setIsSharing] = useState(false);
  const pathname = usePathname();
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  // Track active slide
  useEffect(() => {
    if (!api) return;

    setCurrent(api.selectedScrollSnap());

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  // Initialize state with first available values for options
  const [selectedOptions, setSelectedOptions] = useState<
    Record<string, string>
  >(() => {
    if (variantId && product.variants) {
      const v = product.variants.find(v => v.id === variantId);
      if (v && v.combinations) {
        return v.combinations;
      }
    }
    const initial: Record<string, string> = {};
    product.options?.forEach((opt) => {
      const firstVal = opt.values[0];
      if (firstVal) {
        initial[opt.name] = firstVal.value;
      }
    });
    return initial;
  });


  const activeVariant = useMemo(() => {
    if (!product.variants || product.variants.length === 0) return null;
    return (
      product.variants.find((variant) => {
        return Object.entries(selectedOptions).every(
          ([key, val]) => variant.combinations?.[key] === val
        );
      }) || null
    );
  }, [product.variants, selectedOptions]);

  // Determine price to show
  const currentPrice = activeVariant?.price || product.price;

  const handleOptionSelect = (optionName: string, value: string) => {
    const newOptions = { ...selectedOptions, [optionName]: value };
    setSelectedOptions(newOptions);
    
    // Find the variant with these new options and update URL
    if (product.variants) {
      const newVariant = product.variants.find(v => 
        Object.entries(newOptions).every(([k, val]) => v.combinations?.[k] === val)
      );
      if (newVariant) {
        router.replace(`/products/${product.slug}/${newVariant.id}` as any);
      }
    }
  };

  const handleWishlistToggle = () => {
    const wishlistItem = {
      id: activeVariant ? `${product.id}-${activeVariant.id}` : product.id,
      productId: product.id,
      variantId: activeVariant?.id,
      productName: product.title,
      productSlug: product.slug,
      price: Number(currentPrice),
      image: product.images?.find((img) => img.isPrimary)?.url || product.images?.[0]?.url || product.images?.find((img) => img.isPrimary)?.asset?.webp?.url || product.images?.[0]?.asset?.webp?.url || "",
      optionValues: selectedOptions,
      discountValue: Number(product.discount || 0),
      stockStatus: (activeVariant?.inventoryStatus || "in_stock") as "in_stock" | "out_of_stock" | "pre_order" | "coming_soon",
      createdAt: new Date().toISOString(),
    };

    if (isInWishlist(wishlistItem.id)) {
      removeFromWishlist(wishlistItem.id);
      toast.success("Removed from wishlist");
    } else {
      addToWishlist(wishlistItem);
      toast.success("Added to wishlist");
    }
  };

  const inWishlist = isInWishlist(activeVariant ? `${product.id}-${activeVariant.id}` : product.id);

  return (
    <div className="flex flex-col min-h-screen bg-background pb-32">
      {/* Top Header */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-background/50 backdrop-blur-md p-4 flex items-center justify-between">
        <Link href="/">
          <Button variant="ghost" size="icon" className="rounded-full bg-background/50">
            <ChevronLeft className="w-5 h-5" />
          </Button>
        </Link>
      </div>

      {/* Image Carousel */}
      <div className="relative w-full h-[60vh] bg-secondary/30">
        {product.images && product.images.length > 0 ? (
          <>
            <Carousel setApi={setApi} className="w-full h-full">
              <CarouselContent className="h-full ml-0">
                {product.images.map((img) => (
                  <CarouselItem key={img.id} className="relative w-full h-[60vh] pl-0">
                    <OptimizedImage
                      asset={img.asset || img.url}
                      fallbackUrl={img.url}
                      alt={product.title}
                      fill
                      className="object-cover"
                      priority={img.isPrimary || product.images![0]?.id === img.id}
                    />
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
            
            {/* Dot Indicators */}
            {product.images.length > 1 && (
              <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2 z-10">
                {product.images.map((_, index) => (
                  <div
                    key={index}
                    className={cn(
                      "w-1.5 h-1.5 rounded-full transition-all duration-300",
                      current === index ? "bg-primary w-4" : "bg-primary/30"
                    )}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            No image available
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="px-6 py-8 flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-serif tracking-tight leading-tight">{product.title}</h1>
          <div className="flex items-center gap-3">
            <span className="text-xl font-medium">${Number(currentPrice).toFixed(2)}</span>
            {Number(product.discount) > 0 && !activeVariant?.price && (
              <span className="text-sm text-muted-foreground line-through">
                ${Number(product.price).toFixed(2)}
              </span>
            )}
          </div>
        </div>

        {/* Options Selector */}
        {product.options && product.options.map((option, idx) => (
          <div key={option.id || option.name || idx} className="flex flex-col gap-3">
            <h3 className="text-sm font-medium uppercase tracking-widest">{option.name}</h3>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {option.values.map((val, vIdx) => {
                const isSelected = selectedOptions[option.name] === val.value;
                return (
                  <button
                    key={val.id || val.value || vIdx}
                    onClick={() => handleOptionSelect(option.name, val.value)}
                    className={cn(
                      "px-6 py-3 rounded-md border text-sm font-medium whitespace-nowrap transition-all",
                      isSelected 
                        ? "border-primary bg-primary text-primary-foreground shadow-sm" 
                        : "border-border/40 text-foreground hover:border-foreground/40 hover:bg-secondary/20"
                    )}
                  >
                    {val.value}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {/* Description */}
        {product.description && (
          <div className="pt-4 border-t border-border/50">
            <h3 className="text-sm font-medium uppercase tracking-widest mb-3">Details</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {product.description}
            </p>
          </div>
        )}
      </div>

      {/* Sticky Bottom Add to Cart Bar (sits above the global bottom navbar) */}
      <div 
        className="fixed left-0 right-0 p-4 bg-background/80 backdrop-blur-xl border-t border-border/50 z-40"
        style={{ bottom: "calc(4rem + env(safe-area-inset-bottom))" }}
      >
        <div className="flex gap-3">
          <AddToCartButton
              product={{
                id: product.id,
                title: product.title,
                slug: product.slug,
                price: Number(currentPrice),
                imageUrl: product.images?.find((img) => img.isPrimary)?.url || product.images?.[0]?.url || product.images?.find((img) => img.isPrimary)?.asset?.webp?.url || product.images?.[0]?.asset?.webp?.url || "",
                sku: activeVariant?.sku || "",
                optionValues: selectedOptions,
                discountValue: Number(product.discount || 0),
                compareAtPrice: activeVariant?.compareAtPrice || undefined,
              }}
            activeVariantId={activeVariant?.id || null}
            selectedOptions={selectedOptions}
            stock={activeVariant ? activeVariant.stock : (product.variants?.reduce((acc, curr) => acc + curr.stock, 0) || 0)}
            className="flex-1 h-14 py-0"
            disabled={product.options?.length > 0 && !activeVariant}
            disabledText={product.options?.length > 0 && !activeVariant ? "Unavailable" : "Out of Stock"}
          />
          
          <Button
            variant="outline"
            size="icon"
            className={cn("h-14 w-14 rounded-full shrink-0 transition-colors", inWishlist ? "bg-red-50/50 border-red-200" : "")}
            onClick={handleWishlistToggle}
          >
            <Heart className={cn("w-5 h-5", inWishlist ? "fill-red-500 text-red-500" : "text-foreground")} />
          </Button>
          
          <Button
            variant="outline"
            size="icon"
            className="h-14 w-14 rounded-full shrink-0"
            onClick={() => setIsSharing(true)}
          >
            <Share2 className="w-5 h-5" />
          </Button>
        </div>
      </div>
      
      <ShareModal
        isOpen={isSharing}
        onClose={() => setIsSharing(false)}
        productName={product.title}
        url={typeof window !== "undefined" ? window.location.origin + pathname : ""}
      />
    </div>
  );
}
