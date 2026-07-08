import { useState, useMemo } from "react"
import { OptimizedImage } from "@/components/optimized-image"
import { Product } from "../queries"
import { Button } from "@workspace/ui/components/button"
import { toast } from "sonner"
import { cn } from "@workspace/ui/lib/utils"
import { ShieldCheck, Truck, Heart, Share2 } from "lucide-react"
import { AddToCartButton } from "@/components/add-to-cart-button"
import { useWishlistStore } from "@/store/wishlist-store"
import { ShareModal } from "@/components/share-modal"
import { ImageMagnifier } from "@/components/image-magnifier"
import { usePathname } from "next/navigation"

export function DesktopProduct({ product }: { product: Product }) {
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlistStore()
  const [isSharing, setIsSharing] = useState(false)
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const pathname = usePathname()

  const [selectedOptions, setSelectedOptions] = useState<
    Record<string, string>
  >(() => {
    const initial: Record<string, string> = {}
    product.options?.forEach((opt) => {
      const firstVal = opt.values[0]
      if (firstVal) {
        initial[opt.name] = firstVal.value
      }
    })
    return initial
  })

  const activeVariant = useMemo(() => {
    if (!product.variants || product.variants.length === 0) return null
    return (
      product.variants.find((variant) => {
        return Object.entries(selectedOptions).every(
          ([key, val]) => variant.combinations[key] === val
        )
      }) || null
    )
  }, [product.variants, selectedOptions])

  const currentPrice = activeVariant?.price || product.price

  const handleOptionSelect = (optionName: string, value: string) => {
    setSelectedOptions((prev) => ({ ...prev, [optionName]: value }))
  }

  const handleWishlistToggle = () => {
    const wishlistItem = {
      id: activeVariant ? `${product.id}-${activeVariant.id}` : product.id,
      productId: product.id,
      variantId: activeVariant?.id,
      productName: product.title,
      productSlug: product.slug,
      price: Number(currentPrice),
      image:
        product.images?.find((img) => img.isPrimary)?.url ||
        product.images?.[0]?.url || product.images?.find((img) => img.isPrimary)?.asset?.webp?.url || product.images?.[0]?.asset?.webp?.url || "",
      optionValues: selectedOptions,
      discountValue: Number(product.discount || 0),
      stockStatus: (activeVariant?.inventoryStatus || "in_stock") as "in_stock" | "out_of_stock" | "pre_order" | "coming_soon",
      createdAt: new Date().toISOString(),
    }

    if (isInWishlist(wishlistItem.id)) {
      removeFromWishlist(wishlistItem.id)
      toast.success("Removed from wishlist")
    } else {
      addToWishlist(wishlistItem)
      toast.success("Added to wishlist")
    }
  }

  const inWishlist = isInWishlist(
    activeVariant ? `${product.id}-${activeVariant.id}` : product.id
  )

  return (
    <div className="mx-auto flex max-w-7xl items-start gap-16 px-8 py-8 xl:gap-24">
      {/* Left Column: Image Gallery (Amazon Style) */}
      <div className="sticky top-32 flex h-fit flex-1 gap-4 xl:gap-6">
        {/* Thumbnails Column */}
        <div className="no-scrollbar flex max-h-[80vh] w-20 shrink-0 flex-col gap-4 overflow-y-auto pb-4 xl:w-24">
          {product.images?.map((img, i) => (
            <button
              key={img.id}
              onMouseEnter={() => setActiveImageIndex(i)}
              onClick={() => setActiveImageIndex(i)}
              className={cn(
                "relative aspect-4/5 w-full shrink-0 overflow-hidden rounded-md transition-all",
                activeImageIndex === i
                  ? "ring-1 ring-foreground ring-offset-2 ring-offset-background"
                  : "opacity-70 ring-1 ring-transparent hover:opacity-100 hover:ring-border"
              )}
            >
              <OptimizedImage
                asset={img.asset || img.url}
                fallbackUrl={img.url}
                alt={`${product.title} thumbnail ${i + 1}`}
                fill
                className="object-cover"
              />
            </button>
          ))}
        </div>

        {/* Main Image */}
        <div className="relative aspect-4/5 flex-1 overflow-hidden rounded-xl bg-secondary/30">
          {product.images && product.images.length > 0 ? (
            <ImageMagnifier
              key={activeImageIndex} 
              asset={product.images![activeImageIndex]!.asset || product.images![activeImageIndex]!.url}
              fallbackUrl={product.images![activeImageIndex]!.url}
              alt={`${product.title} main view`}
              priority={true}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground">
              No images available
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Sticky Product Info */}
      <div className="sticky top-32 w-26rem shrink-0">
        <div className="flex flex-col gap-8">
          <div>
            <h1 className="mb-4 font-serif text-4xl leading-tight tracking-tight">
              {product.title}
            </h1>
            <div className="flex items-center gap-4">
              <span className="text-2xl font-medium">
                ${Number(currentPrice).toFixed(2)}
              </span>
              {Number(product.discount) > 0 && !activeVariant?.price && (
                <span className="text-lg text-muted-foreground line-through">
                  ${Number(product.price).toFixed(2)}
                </span>
              )}
            </div>
          </div>

          {/* Options Selector */}
          {product.options &&
            product.options.map((option) => (
              <div
                key={option.id}
                className="flex flex-col gap-4 border-t border-border/50 pt-6"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium tracking-widest uppercase">
                    {option.name}
                  </h3>
                  <span className="text-sm text-muted-foreground">
                    {selectedOptions[option.name]}
                  </span>
                </div>
                <div className="flex flex-wrap gap-3">
                  {option.values.map((val) => {
                    const isSelected =
                      selectedOptions[option.name] === val.value
                    return (
                      <button
                        key={val.id}
                        onClick={() =>
                          handleOptionSelect(option.name, val.value)
                        }
                        className={cn(
                          "rounded-md border px-6 py-3 text-sm font-medium transition-all",
                          isSelected
                            ? "border-primary bg-primary text-primary-foreground shadow-sm"
                            : "border-border/40 text-foreground hover:border-foreground/40 hover:bg-secondary/20"
                        )}
                      >
                        {val.value}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}

          <div className="mt-6 flex gap-4">
            <AddToCartButton
              product={{
                id: product.id,
                title: product.title,
                slug: product.slug,
                price: Number(currentPrice),
                imageUrl:
                  product.images?.find((img) => img.isPrimary)?.url ||
                  product.images?.[0]?.url || product.images?.find((img) => img.isPrimary)?.asset?.webp?.url || product.images?.[0]?.asset?.webp?.url || "",
                sku: activeVariant?.sku || "",
                optionValues: selectedOptions,
                discountValue: Number(product.discount || 0),
                compareAtPrice: activeVariant?.compareAtPrice || undefined,
              }}
              activeVariantId={activeVariant?.id || null}
              selectedOptions={selectedOptions}
              stock={
                activeVariant
                  ? activeVariant.stock
                  : product.variants?.reduce(
                      (acc, curr) => acc + curr.stock,
                      0
                    ) || 0
              }
              className="flex-1"
              disabled={(product.options?.length ?? 0) > 0 && !activeVariant}
              disabledText={
                (product.options?.length ?? 0) > 0 && !activeVariant
                  ? "Unavailable"
                  : "Out of Stock"
              }
            />

            <Button
              variant="outline"
              size="icon"
              className={cn(
                "h-12 w-12 shrink-0 rounded-full transition-colors duration-300",
                inWishlist ? "border-red-200 bg-red-50/50" : ""
              )}
              onClick={handleWishlistToggle}
            >
              <Heart
                className={cn(
                  "h-5 w-5 transition-colors",
                  inWishlist ? "fill-red-500 text-red-500" : "text-foreground"
                )}
              />
            </Button>

            <Button
              variant="outline"
              size="icon"
              className="h-12 w-12 shrink-0 rounded-full"
              onClick={() => setIsSharing(true)}
            >
              <Share2 className="h-5 w-5" />
            </Button>
          </div>

          {/* Details & Guarantees */}
          <div className="mt-8 flex flex-col gap-6">
            {product.description && (
              <div className="border-t border-border/50 pt-6">
                <h3 className="mb-4 text-sm font-medium tracking-widest uppercase">
                  Details
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {product.description}
                </p>
              </div>
            )}

            <div className="flex flex-col gap-4 border-t border-border/50 pt-6">
              <div className="flex items-start gap-4 text-muted-foreground">
                <Truck className="h-5 w-5 shrink-0" />
                <div>
                  <h4 className="text-sm font-medium text-foreground">
                    Complimentary Shipping
                  </h4>
                  <p className="mt-1 text-sm">
                    Free standard shipping on all orders.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4 text-muted-foreground">
                <ShieldCheck className="h-5 w-5 shrink-0" />
                <div>
                  <h4 className="text-sm font-medium text-foreground">
                    Secure Checkout
                  </h4>
                  <p className="mt-1 text-sm">
                    Your payment information is processed securely.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ShareModal
        isOpen={isSharing}
        onClose={() => setIsSharing(false)}
        productName={product.title}
        url={
          typeof window !== "undefined" ? window.location.origin + pathname : ""
        }
      />
    </div>
  )
}
