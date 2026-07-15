import { useState, useMemo, useEffect } from "react"
import { OptimizedImage } from "@/components/optimized-image"
import { Product } from "../queries"
import { Button } from "@workspace/ui/components/button"
import { toast } from "sonner"
import { cn } from "@workspace/ui/lib/utils"
import { ShieldCheck, Truck, Heart, Share2 } from "lucide-react"
import { AddToCartButton } from "@/components/add-to-cart-button"
import { useWishlistStore } from "@/store/wishlist-store"
import { ShareModal } from "@/components/share-modal"
import { usePathname, useSearchParams, useRouter } from "next/navigation"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@workspace/ui/components/accordion"
import { Price } from "@/components/price"

export function TabProduct({ product, variantId }: { product: Product, variantId?: string }) {
  const router = useRouter()
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlistStore()
  const [isSharing, setIsSharing] = useState(false)
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {}
    product.options?.forEach((opt: any) => {
      const urlValue = searchParams.get(opt.name.toLowerCase())
      
      const isValidUrlValue = opt.values.some((v: any) => {
        const vStr = typeof v === 'string' ? v : v.value;
        return vStr === urlValue;
      })

      if (urlValue && isValidUrlValue) {
        initial[opt.name] = urlValue
      } else if (opt.values && opt.values.length > 0) {
        const firstVal = opt.values[0];
        initial[opt.name] = typeof firstVal === 'string' ? firstVal : firstVal.value;
      }
    })
    return initial
  })

  const activeVariant = useMemo(() => {
    if (!product.variants || product.variants.length === 0) return null
    return (
      product.variants.find((variant: any) => {
        return Object.entries(selectedOptions).every(([key, val]) => {
          const variantOptionsMap = variant.optionValues || variant.combinations || {};
          return variantOptionsMap[key] === val;
        })
      }) || null
    )
  }, [product.variants, selectedOptions])

  const displayImages = useMemo(() => {
    if (!product.images) return [];
    const variantImages = product.images.filter(
      (img: any) => img.variantId === activeVariant?.id
    );
    return variantImages.length > 0 ? variantImages : product.images;
  }, [product.images, activeVariant]);

  useEffect(() => {
    setActiveImageIndex(0);
  }, [displayImages]);

  const currentPrice = activeVariant?.price || product.price

  const handleOptionSelect = (optionName: string, value: string) => {
    setSelectedOptions((prev) => ({ ...prev, [optionName]: value }))
    const params = new URLSearchParams(searchParams.toString())
    params.set(optionName.toLowerCase(), value)
    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
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
          {displayImages && displayImages.length > 0 && displayImages[activeImageIndex] ? (
            <OptimizedImage
              asset={displayImages[activeImageIndex]!.asset || displayImages[activeImageIndex]!.url}
              fallbackUrl={displayImages[activeImageIndex]!.url}
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
              <Price amount={currentPrice} className="text-xl font-medium" />
              {Number(product.discount) > 0 && !activeVariant?.price && (
                <Price amount={product.price} className="text-muted-foreground line-through" />
              )}
            </div>

            {/* Options */}
            {product.options &&
              product.options.map((option: any, idx: number) => (
                <div key={option.id || option.name || idx} className="flex flex-col gap-4 border-t border-border/50 pt-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium tracking-widest uppercase">
                      {option.name}
                    </h3>
                    <span className="text-sm text-muted-foreground">
                      {selectedOptions[option.name]}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-3 pb-2">
                    {option.values.map((val: any, vIdx: number) => {
                      const valueStr = typeof val === 'string' ? val : val.value
                      const keyStr = typeof val === 'string' ? `${option.name}-${vIdx}` : val.id
                      const isSelected = selectedOptions[option.name] === valueStr
                      return (
                        <button
                          key={keyStr}
                          onClick={() => handleOptionSelect(option.name, valueStr)}
                          className={cn(
                            "rounded-md border px-6 py-3 text-sm font-medium transition-all",
                            isSelected
                              ? "border-primary bg-primary text-primary-foreground shadow-sm"
                              : "border-border/40 text-foreground hover:border-foreground/40 hover:bg-secondary/20"
                          )}
                        >
                          {valueStr}
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
        </div>
      </div>

      {/* Thumbnails below image */}
      <div className="no-scrollbar flex gap-4 overflow-x-auto mt-6 pb-2 w-1/2">
        {displayImages?.map((img: any, i: number) => (
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
