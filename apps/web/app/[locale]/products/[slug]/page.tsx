"use client"

import { use } from "react"
import { useRouter } from "@/i18n/routing"
import { useEffect } from "react"
import { useProductQuery } from "./[variantId]/queries"
import { Loader2 } from "lucide-react"

export default function ProductRedirectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const router = useRouter()
  const { data: product, isLoading, error } = useProductQuery(slug)

  useEffect(() => {
    if (product && product.variants && product.variants.length > 0) {
      const defaultVariant = product.variants.find((v: any) => v.isDefault) || product.variants[0]
      router.replace(`/products/${slug}/${defaultVariant?.id}` as any)
    }
  }, [product, slug, router])

  if (error) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background px-4">
        <div className="text-center">
          <h1 className="text-3xl font-serif tracking-tight mb-4">Product Not Found</h1>
          <p className="text-muted-foreground mb-8 text-center max-w-md">
            We couldn't find the product you're looking for. It may have been removed or the link is incorrect.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
    </div>
  )
}
