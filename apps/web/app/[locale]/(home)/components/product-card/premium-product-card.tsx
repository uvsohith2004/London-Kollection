"use client"

import { useState } from "react"
import { OptimizedImage } from "@/components/optimized-image"
import Link from "next/link"
import { Heart, Star } from "lucide-react"
import { cn } from "@workspace/ui/lib/utils"
import { AddToCartButton } from "@/components/add-to-cart-button"
import type { Product } from "@/types/types"
import { useWishlistStore } from "@/store/wishlist-store"

interface PremiumProductCardProps {
  product: Product
  className?: string
  priority?: boolean
}

export function PremiumProductCard({
  product,
  className,
  priority = false,
}: PremiumProductCardProps) {
  const [isImageLoaded, setIsImageLoaded] = useState(false)

  // Wishlist integration
  const isInWishlist = useWishlistStore((s) => s.isInWishlist(product.id))
  const addToWishlist = useWishlistStore((s) => s.addToWishlist)
  const removeFromWishlist = useWishlistStore((s) => s.removeFromWishlist)

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
  const secondaryImgObj = (product as any).images?.find((img: any) => !img.isPrimary) || primaryImgObj
  
  const primaryImageUrl = primaryImgObj?.url || primaryImgObj?.asset?.webp?.url || ""

  const isSale =
    discountValue > 0 || (compareAtPrice != null && compareAtPrice > price)
  const originalPrice =
    compareAtPrice ?? (discountValue > 0 ? price + discountValue : price)
  const finalPrice = price - discountValue
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
        compareAtPrice,
        discountValue,
        stockStatus: defaultVariant?.inventoryStatus || "in_stock",
        createdAt: new Date().toISOString(),
      })
    }
  }

  return (
    <div className={cn("group flex w-full flex-col gap-3", className)}>
      <Link
        href={`/products/${product.slug}${variantId ? `/${variantId}` : ""}`}
        className="relative block aspect-square w-full overflow-hidden rounded-2xl bg-secondary/10 shadow-sm transition-shadow duration-300 hover:shadow-md"
      >
        {/* Image crossfade */}
        {primaryImgObj ? (
          <>
            <OptimizedImage
              asset={primaryImgObj.asset || primaryImgObj.url}
              fallbackUrl={primaryImgObj.url}
              alt={product.title}
              fill
              className={cn(
                "object-cover transition-opacity duration-700 ease-in-out",
                isImageLoaded ? "opacity-100" : "opacity-0",
                "group-hover:opacity-0"
              )}
              onLoad={() => setIsImageLoaded(true)}
              priority={priority}
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
            />
            {secondaryImgObj && (
              <OptimizedImage
                asset={secondaryImgObj.asset || secondaryImgObj.url}
                fallbackUrl={secondaryImgObj.url}
                alt={`${product.title} alternate view`}
                fill
                className="absolute inset-0 object-cover opacity-0 transition-opacity duration-700 ease-in-out group-hover:opacity-100"
                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
              />
            )}
          </>
        ) : (
          <div className="flex h-full w-full items-center justify-center font-light text-muted-foreground/30">
            No image
          </div>
        )}

        {/* Rating Badge - Always Visible in Corner */}
        {product.averageRating > 0 && (
          <div className="pointer-events-none absolute bottom-3 left-3 z-10">
            <div className="flex items-center gap-1 rounded-full bg-background/95 px-2 py-1 shadow-sm backdrop-blur-md">
              <Star className="h-3.5 w-3.5 fill-foreground text-foreground" />
              <span className="text-[10px] font-semibold text-foreground">
                {product.averageRating}
              </span>
            </div>
          </div>
        )}

        {/* Badges */}
        <div
          className="absolute top-3 left-3 z-10 flex flex-col gap-2"
          dir="auto"
        >
          {product.isNewArrival && (
            <div className="rounded-full bg-background/90 px-3 py-1.5 text-[10px] font-medium tracking-widest text-foreground uppercase shadow-sm backdrop-blur-sm">
              New
            </div>
          )}
          {isSale && (
            <div className="rounded-full bg-red-500/95 px-3 py-1.5 text-[10px] font-medium tracking-widest text-white uppercase shadow-sm backdrop-blur-sm">
              -{discountPercentage}%
            </div>
          )}
        </div>

        {/* Wishlist Button - ONLY VISIBLE ON HOVER on Desktop */}
        <button
          onClick={handleWishlist}
          className="absolute top-3 right-3 z-10 flex h-8 w-8 translate-y-2 transform items-center justify-center rounded-full bg-background opacity-0 shadow-sm transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100"
        >
          <Heart
            className={cn(
              "h-4 w-4 transition-colors",
              isInWishlist ? "fill-red-500 text-red-500" : "text-foreground"
            )}
          />
        </button>
      </Link>

      <div className="mt-1 flex flex-col gap-2">
        <Link
          href={`/products/${product.slug}${variantId ? `/${variantId}` : ""}`}
          className="transition-colors group-hover:text-foreground/70"
        >
          <h3
            className="line-clamp-1 font-serif text-lg tracking-wide text-foreground"
            dir="auto"
            title={product.title}
          >
            {product.title}
          </h3>
        </Link>

        <div className="flex items-center gap-3">
          <span className="text-lg font-semibold text-foreground" dir="auto">
            {finalPrice.toFixed(2)} KWD
          </span>
          {isSale && (
            <span
              className="text-sm font-light text-muted-foreground line-through"
              dir="auto"
            >
              {originalPrice.toFixed(2)} KWD
            </span>
          )}
        </div>

        {/* Add to Bag */}
        <div className="mt-2 w-full">
          <AddToCartButton
            product={{
              id: product.id,
              title: product.title,
              slug: product.slug,
              price: finalPrice,
              imageUrl: primaryImageUrl,
              sku: defaultVariant?.sku || "",
              optionValues: defaultVariant?.optionValues || {},
              discountValue,
              compareAtPrice,
            }}
            activeVariantId={variantId}
            selectedOptions={defaultVariant?.optionValues || {}}
            stock={stock}
            className="h-10 text-xs"
          />
        </div>
      </div>
    </div>
  )
}
