"use client"

import React, { useState, useMemo, useEffect, useCallback } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { ShieldCheck, Truck, Heart, Share2, ChevronDown, Ruler } from "lucide-react"
import { toast } from "sonner"

import { Product } from "../queries"
import { cn } from "@workspace/ui/lib/utils"
import { Button } from "@workspace/ui/components/button"
import { AddToCartButton } from "@/components/add-to-cart-button"
import { OptimizedImage } from "@/components/optimized-image"
import { ImageMagnifier } from "@/components/image-magnifier"
import { ShareModal } from "@/components/share-modal"
import { useWishlistStore } from "@/store/wishlist-store"

// --- Helper Component for Collapsible Sections ---
function AccordionSection({ 
  title, 
  defaultOpen = false, 
  children 
}: { 
  title: string; 
  defaultOpen?: boolean; 
  children: React.ReactNode 
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className="border-b border-border/50 py-5">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between text-left outline-none group"
      >
        <span className="text-sm font-medium tracking-widest uppercase text-foreground group-hover:text-primary transition-colors">
          {title}
        </span>
        <ChevronDown 
          className={cn(
            "h-4 w-4 text-muted-foreground transition-transform duration-300", 
            isOpen && "rotate-180"
          )} 
        />
      </button>
      <div 
        className={cn(
          "grid transition-all duration-300 ease-in-out",
          isOpen ? "grid-rows-[1fr] opacity-100 mt-4" : "grid-rows-[0fr] opacity-0"
        )}
      >
        <div className="overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  )
}

export function DesktopProduct({ product, variantId }: { product: any, variantId?: string }) { // Temporarily cast product to any to handle schema flexbility
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlistStore()

  const [isSharing, setIsSharing] = useState(false)
  const [activeImageIndex, setActiveImageIndex] = useState(0)

  // 1. Initialize options resiliently (handles strings OR objects)
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

  // 2. Identify active variant (Checking for both optionValues AND combinations)
  const activeVariant = useMemo(() => {
    if (!product.variants?.length) return null
    return product.variants.find((variant: any) =>
      Object.entries(selectedOptions).every(([key, val]) => {
        // Look for variant map in either optionValues or combinations
        const variantOptionsMap = variant.optionValues || variant.combinations || {};
        return variantOptionsMap[key] === val;
      })
    ) || null
  }, [product.variants, selectedOptions])

  // 3. Filter images based on active variant
  const displayImages = useMemo(() => {
    if (!product.images) return []
    const variantImages = product.images.filter(
      (img: any) => img.variantId === activeVariant?.id
    )
    return variantImages.length > 0 ? variantImages : product.images
  }, [product.images, activeVariant])

  useEffect(() => {
    setActiveImageIndex(0)
  }, [displayImages])

  // 4. Handle Option Selection & URL Update
  const handleOptionSelect = useCallback((optionName: string, value: string) => {
    setSelectedOptions((prev) => ({ ...prev, [optionName]: value }))
    const params = new URLSearchParams(searchParams.toString())
    params.set(optionName.toLowerCase(), value)
    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }, [pathname, router, searchParams])

  // 5. Wishlist Handler
  const wishlistItemId = activeVariant ? `${product.id}-${activeVariant.id}` : product.id
  const inWishlist = isInWishlist(wishlistItemId)

  const handleWishlistToggle = () => {
    if (inWishlist) {
      removeFromWishlist(wishlistItemId)
      toast.success("Removed from wishlist")
    } else {
      addToWishlist({
        id: wishlistItemId,
        productId: product.id,
        variantId: activeVariant?.id,
        productName: product.title,
        productSlug: product.slug,
        price: Number(currentPrice),
        image: displayImages[0]?.url || displayImages[0]?.asset?.webp?.url || "",
        optionValues: selectedOptions,
        discountValue: Number(product.discount || 0),
        stockStatus: (activeVariant?.inventoryStatus || "in_stock") as any,
        createdAt: new Date().toISOString(),
      })
      toast.success("Added to wishlist")
    }
  }

  const currentPrice = activeVariant?.price || product.price
  const compareAtPrice = activeVariant?.compareAtPrice || (Number(product.discount) > 0 ? product.price : null)

  // Safe Dimension Parsing
  const dims: any = product.dimensions || {}
  const hasDimensions = dims.length || dims.width || dims.height || dims.weight

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 md:px-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
        
        {/* LEFT COLUMN: Amazon-style Gallery */}
        <div className="lg:col-span-7 flex flex-row gap-4 h-[650px] sticky top-24">
          <div className="flex flex-col gap-3 w-20 xl:w-24 overflow-y-auto shrink-0 pb-4 [&::-webkit-scrollbar]:hidden">
            {displayImages.map((img: any, i: number) => (
              <button
                key={img.id || i}
                onMouseEnter={() => setActiveImageIndex(i)}
                onClick={() => setActiveImageIndex(i)}
                className={cn(
                  "relative aspect-square w-full rounded-md overflow-hidden bg-muted transition-all duration-200",
                  activeImageIndex === i
                    ? "ring-2 ring-primary ring-offset-2"
                    : "opacity-60 hover:opacity-100 ring-1 ring-border"
                )}
              >
                <OptimizedImage
                  asset={img.asset || img.url}
                  fallbackUrl={img.url}
                  alt={`${product.title} view ${i + 1}`}
                  fill
                  className="object-cover"
                />
              </button>
            ))}
          </div>

          <div className="relative flex-1 aspect-square rounded-xl bg-secondary/20 border border-border overflow-hidden">
            {displayImages.length > 0 && displayImages[activeImageIndex] ? (
              <ImageMagnifier
                key={activeImageIndex}
                asset={displayImages[activeImageIndex].asset || displayImages[activeImageIndex].url}
                fallbackUrl={displayImages[activeImageIndex].url}
                alt={`${product.title} main view`}
                priority={true}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                No image available
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Product Info */}
        <div className="lg:col-span-5 flex flex-col gap-6 lg:sticky lg:top-24">
          
          <div className="space-y-4">
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-foreground">
              {product.title}
            </h1>
            <div className="flex items-baseline gap-4">
              <span className="text-3xl font-medium">
                ${Number(currentPrice).toFixed(2)}
              </span>
              {compareAtPrice && (
                <span className="text-xl text-muted-foreground line-through">
                  ${Number(compareAtPrice).toFixed(2)}
                </span>
              )}
            </div>
          </div>

          {/* Variants Selector */}
          {product.options && product.options.length > 0 && (
            <div className="space-y-6 pt-4">
              {product.options.map((option: any) => (
                <div key={option.name} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium tracking-wider uppercase text-foreground">
                      {option.name}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {selectedOptions[option.name]}
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {option.values.map((val: any, idx: number) => {
                      // Handle both strings ("Green") and objects ({value: "Green"})
                      const valueStr = typeof val === 'string' ? val : val.value;
                      const keyStr = typeof val === 'string' ? `${option.name}-${idx}` : val.id;
                      const isSelected = selectedOptions[option.name] === valueStr;
                      
                      return (
                        <button
                          key={keyStr}
                          onClick={() => handleOptionSelect(option.name, valueStr)}
                          className={cn(
                            "px-5 py-2.5 text-sm font-medium rounded-md border transition-all duration-200",
                            isSelected
                              ? "border-primary bg-primary text-primary-foreground shadow-sm ring-1 ring-primary ring-offset-1"
                              : "border-input bg-background text-foreground hover:bg-secondary/50"
                          )}
                        >
                          {valueStr}
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Action Area */}
          <div className="flex items-center gap-3 pt-6">
            <AddToCartButton
              product={{
                id: product.id,
                title: product.title,
                slug: product.slug,
                price: Number(currentPrice),
                imageUrl: displayImages[0]?.url || displayImages[0]?.asset?.webp?.url || "",
                sku: activeVariant?.sku || "",
                optionValues: selectedOptions,
                discountValue: Number(product.discount || 0),
                compareAtPrice: activeVariant?.compareAtPrice ? Number(activeVariant.compareAtPrice) : undefined,
              }}
              activeVariantId={activeVariant?.id || null}
              selectedOptions={selectedOptions}
              stock={activeVariant ? activeVariant.stock : product.variants?.reduce((acc: any, curr: any) => acc + curr.stock, 0) || 0}
              className="flex-1 h-12 text-sm uppercase tracking-widest transition-shadow hover:shadow-md"
              disabled={(product.options?.length ?? 0) > 0 && !activeVariant}
              disabledText={(product.options?.length ?? 0) > 0 && !activeVariant ? "Unavailable" : "Out of Stock"}
            />

            <Button
              variant="outline"
              size="icon"
              onClick={handleWishlistToggle}
              className={cn(
                "h-12 w-12 shrink-0 transition-colors",
                inWishlist ? "border-red-200 bg-red-50 hover:bg-red-100" : ""
              )}
            >
              <Heart className={cn("h-5 w-5", inWishlist ? "fill-red-500 text-red-500" : "")} />
            </Button>

            <Button
              variant="outline"
              size="icon"
              className="h-12 w-12 shrink-0"
              onClick={() => setIsSharing(true)}
            >
              <Share2 className="h-5 w-5" />
            </Button>
          </div>

          {/* Accordions Container */}
          <div className="mt-4 border-t border-border/50">
            
            {/* Description Accordion */}
            {product.description && (
              <AccordionSection title="Description" defaultOpen={true}>
                <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
                  {product.description}
                </p>
              </AccordionSection>
            )}

            {/* Dimensions Accordion */}
            {hasDimensions && (
              <AccordionSection title="Dimensions & Specifications">
                <div className="space-y-4 text-sm text-muted-foreground">
                  {(dims.length || dims.width || dims.height) && (
                    <div className="flex items-center gap-3">
                      <Ruler className="h-4 w-4 shrink-0" />
                      <span>
                        <strong className="font-medium text-foreground">Size: </strong>
                        {[dims.length, dims.width, dims.height].filter(Boolean).join(" × ")} 
                        {dims.lengthUnit && ` ${dims.lengthUnit}`}
                      </span>
                    </div>
                  )}
                  {dims.weight && (
                    <div className="flex items-center gap-3">
                      <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                      </svg>
                      <span>
                        <strong className="font-medium text-foreground">Weight: </strong>
                        {dims.weight} {dims.weightUnit}
                      </span>
                    </div>
                  )}
                </div>
              </AccordionSection>
            )}

            {/* Guarantees / Shipping Accordion */}
            <AccordionSection title="Shipping & Returns">
              <div className="flex flex-col gap-5 pt-1">
                <div className="flex items-start gap-4">
                  <Truck className="h-5 w-5 text-foreground shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-foreground">Complimentary Shipping</h4>
                    <p className="mt-1 text-sm text-muted-foreground">Free standard shipping on all orders.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <ShieldCheck className="h-5 w-5 text-foreground shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-foreground">Secure Checkout</h4>
                    <p className="mt-1 text-sm text-muted-foreground">Your payment information is processed securely.</p>
                  </div>
                </div>
              </div>
            </AccordionSection>

          </div>
        </div>
      </div>

      <ShareModal
        isOpen={isSharing}
        onClose={() => setIsSharing(false)}
        productName={product.title}
        url={typeof window !== "undefined" ? window.location.origin + pathname + "?" + searchParams.toString() : ""}
      />
    </div>
  )
}
