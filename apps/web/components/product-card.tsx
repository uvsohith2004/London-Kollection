"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { OptimizedImage, OptimizedImageAsset } from "./optimized-image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, AlertCircle } from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";
import StarRating from "./star-rating";

interface ProductCardProps {
  product: {
    id: string;
    slug?: string;
    title: string;

    price: string | number;
    discount?: string | number;
    images?: { url?: string; asset?: OptimizedImageAsset | null; isPrimary: boolean }[];
    options?: { name: string; values: { value: string }[] }[];
    variants?: { id: string; stock: number; isDefault?: boolean }[];
    isFeatured?: boolean;
    rating?: number;
  };
  className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  const primaryImage = product.images?.find((img) => img.isPrimary) || product.images?.[0];
  
  // Calculate stock
  const totalStock = product.variants?.reduce((acc, curr) => acc + curr.stock, 0) || 0;
  const isOutOfStock = product.variants && totalStock === 0;
  const isLowStock = !isOutOfStock && totalStock > 0 && totalStock <= 5;
  
  // Get sizes if available
  const sizeOption = product.options?.find(o => o.name.toLowerCase() === "size" || o.name.toLowerCase() === "sizes");
  const sizes = sizeOption ? sizeOption.values.map(v => v.value) : [];

  const defaultVariant = product.variants?.find((v) => v.isDefault) || product.variants?.[0];
  const variantId = defaultVariant?.id;
  const productUrl = `/products/${product.slug || product.id}${variantId ? `/${variantId}` : ""}`;

  const handleProductClick = (e: React.MouseEvent) => {
    // Prevent default if they clicked the quick view button (we'll let the link handle it naturally otherwise)
    const target = e.target as HTMLElement;
    if (target.closest(".quick-view-btn")) {
      e.preventDefault();
      router.push(productUrl);
    }
  };

  return (
    <motion.div
      whileHover={{ y: -5 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn("group relative flex flex-col h-full", className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={productUrl} className="block relative aspect-square w-full bg-secondary/30 overflow-hidden mb-4" onClick={handleProductClick}>
        
        {/* Image */}
        {primaryImage ? (
          <OptimizedImage
            asset={primaryImage.asset || primaryImage.url}
            fallbackUrl={primaryImage.url}
            alt={product.title}
            fill
            className={cn(
              "object-cover transition-all duration-700",
              isImageLoaded ? "opacity-100" : "opacity-0",
              isHovered && !isOutOfStock ? "scale-105" : ""
            )}
            onLoad={() => setIsImageLoaded(true)}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground/30">
            No image
          </div>
        )}

        {/* Badges Container */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
          {product.isFeatured && (
            <div className="bg-primary text-primary-foreground text-xs font-medium px-2 py-1 uppercase tracking-widest">
              Featured
            </div>
          )}
          
          {Number(product.discount) > 0 && (
            <div className="bg-destructive text-destructive-foreground text-xs font-bold px-2 py-1 uppercase tracking-widest">
              Sale
            </div>
          )}
        </div>

        {/* Out of stock overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-background/50 backdrop-blur-[2px] flex items-center justify-center z-10">
            <div className="bg-foreground text-background text-sm font-medium px-4 py-1 uppercase tracking-widest">
              Out of Stock
            </div>
          </div>
        )}

        {/* Quick view button on hover */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: isHovered && !isOutOfStock ? 1 : 0, y: isHovered && !isOutOfStock ? 0 : 10 }}
          transition={{ duration: 0.2 }}
          className="absolute bottom-4 right-4 z-20 quick-view-btn"
        >
          <div className="bg-background/90 backdrop-blur shadow-sm text-foreground p-3 rounded-full hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer">
            <Eye size={18} strokeWidth={1.5} />
          </div>
        </motion.div>
      </Link>

      <div className="flex flex-col gap-2 grow">
        <Link href={productUrl} className="block">
          <h3 className="font-serif text-lg tracking-wide group-hover:underline underline-offset-4 decoration-1 line-clamp-1">
            {product.title}
          </h3>
        </Link>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {Number(product.discount) > 0 ? (
              <>
                <span className="font-medium text-destructive">
                  ${(Number(product.price) - Number(product.discount)).toFixed(2)}
                </span>
                <span className="text-muted-foreground line-through text-sm">
                  ${Number(product.price).toFixed(2)}
                </span>
              </>
            ) : (
              <span className="font-medium">${Number(product.price).toFixed(2)}</span>
            )}
          </div>
        </div>

        {/* Rating */}
        <div className="mt-1">
          <StarRating rating={product.rating || 0} />
        </div>

        {/* Low stock warning */}
        {isLowStock && (
          <div className="mt-1 flex items-center text-amber-600 text-xs font-medium uppercase tracking-wider">
            <AlertCircle size={12} className="mr-1" />
            Only {totalStock} left
          </div>
        )}

        {/* Size chips */}
        {sizes.length > 0 && !isOutOfStock && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {sizes.slice(0, 4).map((size) => (
              <span key={size} className="text-xs px-2 py-0.5 border border-border text-muted-foreground bg-muted/10">
                {size}
              </span>
            ))}
            {sizes.length > 4 && (
              <span className="text-xs px-2 py-0.5 border border-border text-muted-foreground bg-muted/10">
                +{sizes.length - 4}
              </span>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
