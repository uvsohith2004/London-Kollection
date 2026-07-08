import { useState, useMemo } from "react"
import { OptimizedImage } from "@/components/optimized-image"
import { Product } from "../queries"
import { useCartStore } from "@/store/cart-store"
import { Button } from "@workspace/ui/components/button"
import { toast } from "sonner"
import { cn } from "@workspace/ui/lib/utils"
import { ShieldCheck, Truck, Heart, Share2 } from "lucide-react"
import { AddToCartButton } from "@/components/add-to-cart-button"
import { useWishlistStore } from "@/store/wishlist-store"
import { ShareModal } from "@/components/share-modal"
import { useRouter, usePathname } from "@/i18n/routing"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@workspace/ui/components/accordion"

export function TabProduct({ product, variantId }: { product: Product, variantId?: string }) {
  const router = useRouter()
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlistStore()
  const [isSharing, setIsSharing] = useState(false)
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const pathname = usePathname()

  const [selectedOptions, setSelectedOptions] = useState<
    Record<string, string>
  >(() => {
    if (variantId && product.variants) {
      const v = product.variants.find(v => v.id === variantId)
      if (v && v.combinations) {
        return v.combinations
      }
    }
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
          ([key, val]) => variant.combinations?.[key] === val
        )
      }) || null
    )
  }, [product.variants, selectedOptions])

  const currentPrice = activeVariant?.price || product.price

  const handleOptionSelect = (optionName: string, value: string) => {
    const newOptions = { ...selectedOptions, [optionName]: value }
    setSelectedOptions(newOptions)
    
    // Find the variant with these new options and update URL
    if (product.variants) {
      const newVariant = product.variants.find(v => 
        Object.entries(newOptions).every(([k, val]) => v.combinations?.[k] === val)
      )
      if (newVariant) {
        router.replace(`/products/${product.slug}/${newVariant.id}` as any)
      }
    }
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
    <div className="mx-auto flex flex-col max-w-4xl px-8 py-8">
      {/* Top Section: Images & Basic Info */}
      <div className="flex gap-10">
         {/* Main Image */}
        <div className="relative aspect-4/5 w-1/2 overflow-hidden rounded-2xl bg-secondary/30">
          {product.images && product.images.length > 0 ? (
            <OptimizedImage
              asset={product.images[activeImageIndex]!.asset || product.images[activeImageIndex]!.url}
              fallbackUrl={product.images[activeImageIndex]!.url}
              alt={`${product.title} main view`}
              fill
              className="object-cover"
              priority={true}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground">
              No images available
            </div>
          )}
        </div>

        <div className="w-1/2 flex flex-col pt-4">
           <h1 className="mb-2 font-serif text-3xl leading-tight tracking-tight">
              {product.title}
            </h1>
            <div className="flex items-center gap-3 mb-8">
              <span className="text-xl font-medium">
                ${Number(currentPrice).toFixed(2)}
              </span>
              {Number(product.discount) > 0 && !activeVariant?.price && (
                <span className="text-muted-foreground line-through">
                  ${Number(product.price).toFixed(2)}
                </span>
              )}
            </div>

            {/* Options */}
            {product.options &&
              product.options.map((option, idx) => (
                <div key={option.id || option.name || idx} className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium tracking-widest uppercase">
                      {option.name}
                    </h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {option.values.map((val, vIdx) => {
                      const isSelected = selectedOptions[option.name] === val.value
                      return (
                        <button
                          key={val.id || val.value || vIdx}
                          onClick={() => handleOptionSelect(option.name, val.value)}
                          className={cn(
                            "rounded-md border px-4 py-2 text-sm transition-all",
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

            <div className="mt-4 flex gap-3">
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
                stock={activeVariant ? activeVariant.stock : product.variants?.reduce((acc, curr) => acc + curr.stock, 0) || 0}
                className="flex-1 h-12"
                disabled={(product.options?.length ?? 0) > 0 && !activeVariant}
                disabledText={(product.options?.length ?? 0) > 0 && !activeVariant ? "Unavailable" : "Out of Stock"}
              />

              <Button
                variant="outline"
                size="icon"
                className={cn("h-12 w-12 shrink-0 rounded-xl", inWishlist ? "border-red-200 bg-red-50/50" : "")}
                onClick={handleWishlistToggle}
              >
                <Heart className={cn("h-5 w-5", inWishlist ? "fill-red-500 text-red-500" : "")} />
              </Button>

              <Button
                variant="outline"
                size="icon"
                className="h-12 w-12 shrink-0 rounded-xl"
                onClick={() => setIsSharing(true)}
              >
                <Share2 className="h-5 w-5" />
              </Button>
            </div>
        </div>
      </div>

      {/* Thumbnails below image */}
      <div className="no-scrollbar flex gap-4 overflow-x-auto mt-6 pb-2 w-1/2">
        {product.images?.map((img, i) => (
          <button
            key={img.id}
            onClick={() => setActiveImageIndex(i)}
            className={cn(
              "relative aspect-square w-16 shrink-0 overflow-hidden rounded-lg transition-all",
              activeImageIndex === i
                ? "ring-2 ring-primary ring-offset-2"
                : "opacity-70 hover:opacity-100"
            )}
          >
            <OptimizedImage asset={img.asset || img.url} fallbackUrl={img.url} alt={`${product.title} thumbnail ${i + 1}`} fill className="object-cover" />
          </button>
        ))}
      </div>

          {/* Details & Guarantees */}
          <div className="mt-8">
            <Accordion type="single" collapsible className="w-full" defaultValue="details">
              {product.description && (
                <AccordionItem value="details" className="border-border/50">
                  <AccordionTrigger className="text-sm font-medium tracking-widest uppercase hover:no-underline">
                    Description
                  </AccordionTrigger>
                  <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                    {product.description}
                  </AccordionContent>
                </AccordionItem>
              )}
              
              {product.specifications && product.specifications.length > 0 && (
                <AccordionItem value="specifications" className="border-border/50">
                  <AccordionTrigger className="text-sm font-medium tracking-widest uppercase hover:no-underline">
                    Specifications
                  </AccordionTrigger>
                  <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                    <ul className="list-disc pl-4 space-y-1">
                      {product.specifications.map((spec: any, idx: number) => (
                        <li key={idx}><strong>{spec.name}:</strong> {spec.value}</li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              )}

              {product.dimensions && (
                <AccordionItem value="dimensions" className="border-border/50">
                  <AccordionTrigger className="text-sm font-medium tracking-widest uppercase hover:no-underline">
                    Dimensions & Weight
                  </AccordionTrigger>
                  <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                    <ul className="list-disc pl-4 space-y-1">
                      {product.dimensions.length && <li>Length: {product.dimensions.length} {product.dimensions.lengthUnit}</li>}
                      {product.dimensions.width && <li>Width: {product.dimensions.width} {product.dimensions.lengthUnit}</li>}
                      {product.dimensions.height && <li>Height: {product.dimensions.height} {product.dimensions.lengthUnit}</li>}
                      {product.dimensions.weight && <li>Weight: {product.dimensions.weight} {product.dimensions.weightUnit}</li>}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              )}

              <AccordionItem value="shipping" className="border-border/50">
                <AccordionTrigger className="text-sm font-medium tracking-widest uppercase hover:no-underline">
                  Shipping & Returns
                </AccordionTrigger>
                <AccordionContent className="space-y-4">
                  <div className="flex items-start gap-3 text-muted-foreground">
                    <Truck className="h-4 w-4 mt-0.5 shrink-0" />
                    <div>
                      <h4 className="text-sm font-medium text-foreground">Complimentary Shipping</h4>
                      <p className="mt-1 text-xs leading-relaxed">Free standard shipping on all orders. Express delivery available at checkout.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 text-muted-foreground">
                    <ShieldCheck className="h-4 w-4 mt-0.5 shrink-0" />
                    <div>
                      <h4 className="text-sm font-medium text-foreground">Secure Checkout</h4>
                      <p className="mt-1 text-xs leading-relaxed">Your payment information is processed securely with end-to-end encryption.</p>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

      <ShareModal
        isOpen={isSharing}
        onClose={() => setIsSharing(false)}
        productName={product.title}
        url={typeof window !== "undefined" ? window.location.origin + pathname : ""}
      />
    </div>
  )
}
