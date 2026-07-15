"use client"

import { useState } from "react"
import { OptimizedImage } from "@/components/optimized-image"
import Link from "next/link"
import { Heart, Star } from "lucide-react"
import { cn } from "@workspace/ui/lib/utils"
import { AddToCartButton } from "@/components/add-to-cart-button"
import type { Product } from "@/types/types"
import { useWishlistStore } from "@/store/wishlist-store"
import { useInteractionStore } from "@/stores/use-interaction-store"
import { Price } from "@/components/price"

interface ProductCardProps {
  product: Product
  className?: string
  priority?: boolean
  locale?: string
}

export function ProductCard({
  product,
  className,
  priority = false,
  locale = "en",
}: ProductCardProps) {
  const [isImageLoaded, setIsImageLoaded] = useState(false)

  // Wishlist integration
  const isInWishlist = useWishlistStore((s) => s.isInWishlist(product.id))
  const addToWishlist = useWishlistStore((s) => s.addToWishlist)
  const removeFromWishlist = useWishlistStore((s) => s.removeFromWishlist)

  const getLocalizedUrl = (path: string) => {
    const localePrefix = locale === "en" ? "" : `/${locale}`
    return `${localePrefix}${path}`
  }

  const handleLinkClick = () => {
    useInteractionStore.getState().trackProductView(product.id)
  }

  // Derive default variant
  const defaultVariant =
    product.variants?.find((v) => v.isDefault) || product.variants?.[0]
  const price = defaultVariant ? defaultVariant.price : 0
  const discountValue = defaultVariant ? defaultVariant.discountValue : 0
  const compareAtPrice = defaultVariant?.compareAtPrice
  const stock = defaultVariant?.stock ?? 0
  const variantId = defaultVariant?.id ?? null

  // Images from product level
  const primaryImgObj = (product as any).images?.find((img: any) => img.isPrimary) || (product as any).images?.[0]
  const primaryImageUrl = primaryImgObj?.url || primaryImgObj?.asset?.webp?.url || ""

  // Fix: flash sale overridden prices set compareAtPrice in the backend
  const originalPrice = compareAtPrice ?? (price + discountValue)
  const finalPrice = (compareAtPrice != null && compareAtPrice > price) ? price : (price - discountValue)
  
  const isSale = originalPrice > finalPrice
  const discountPercentage = isSale
    ? Math.round(((originalPrice - finalPrice) / originalPrice) * 100)
    : 0

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault()
    if (isInWishlist) {
      removeFromWishlist(product.id)
    } else {
      addToWishlist({
        id: product.id,
        productId: product.id,
        variantId: variantId,
        productName: product.title,
        productSlug: product.slug,
        image: primaryImageUrl,
        optionValues: defaultVariant?.optionValues,
        price: finalPrice,
        compareAtPrice: originalPrice,
        discountValue: originalPrice - finalPrice,
        stockStatus: defaultVariant?.inventoryStatus || "in_stock",
        createdAt: new Date().toISOString(),
      })
    }
  }

  return (
    <div className={cn("group flex w-full flex-col gap-2", className)}>
      <Link
        href={getLocalizedUrl(`/products/${product.slug}${variantId ? `/${variantId}` : ""}`)}
        onClick={handleLinkClick}
        className="relative block aspect-[3/4] w-full overflow-hidden rounded-xl bg-secondary/10 shadow-sm"
      >
        {primaryImgObj ? (
          <OptimizedImage
            asset={primaryImgObj.asset || primaryImgObj.url}
            fallbackUrl={primaryImgObj.url}
            alt={product.title}
            fill
            className={cn(
              "object-cover transition-opacity duration-500",
              isImageLoaded ? "opacity-100" : "opacity-0"
            )}
            onLoad={() => setIsImageLoaded(true)}
            priority={priority}
            sizes="(max-width: 768px) 75vw, 45vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm font-light text-muted-foreground/30">
            No image
          </div>
        )}

        {/* Rating on Hover - adapted for mobile */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex justify-start p-3">
          {Number(product.averageRating) > 0 && (
          <div className="pointer-events-auto">
            <div className="flex items-center gap-1 rounded-full bg-background/95 px-2 py-1 shadow-sm backdrop-blur-md">
              <Star className="h-3 w-3 fill-foreground text-foreground" />
              <span className="text-[10px] font-semibold text-foreground">
                {Number(product.averageRating).toFixed(1)}
              </span>
            </div>
          </div>
        )}</div>

        {/* Badges */}
        {isSale && (
          <div
            className="absolute top-3 left-3 z-10 rounded-full bg-red-500/95 px-2 py-1 text-[10px] font-medium tracking-widest text-white uppercase shadow-sm backdrop-blur-sm"
            dir="auto"
          >
            -{discountPercentage}%
          </div>
        )}

        {/* Wishlist Button - ALWAYS VISIBLE */}
        <button
          onClick={handleWishlist}
          className="absolute top-3 right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-background/95 shadow-sm backdrop-blur-sm transition-transform active:scale-95"
          aria-label="Add to wishlist"
        >
          <Heart
            className={cn(
              "h-4 w-4 transition-colors",
              isInWishlist ? "fill-red-500 text-red-500" : "text-foreground"
            )}
          />
        </button>
      </Link>

      <div className="mt-1 flex flex-col gap-1.5 px-1">
        <h3
          className="line-clamp-1 font-serif text-base text-foreground"
          dir="auto"
          title={product.title}
        >
          {product.title}
        </h3>

        <div className="flex items-center justify-start gap-2">
          <Price amount={finalPrice} className="text-lg font-semibold text-foreground" />
          {isSale && (
            <Price amount={originalPrice} className="text-xs font-light text-muted-foreground line-through" />
          )}
        </div>

        {/* Add to Bag */}
        <div className="mt-3 w-full">
          <AddToCartButton
            product={{
              id: product.id,
              title: product.title,
              slug: product.slug,
              price: finalPrice,
              imageUrl: primaryImageUrl,
              sku: defaultVariant?.sku || "",
              optionValues: defaultVariant?.optionValues || {},
              discountValue: originalPrice - finalPrice,
              compareAtPrice: originalPrice,
            }}
            activeVariantId={variantId}
            selectedOptions={defaultVariant?.optionValues || {}}
            stock={stock}
            className="h-10 text-[10px]"
          />
        </div>
      </div>
    </div>
  )
}
