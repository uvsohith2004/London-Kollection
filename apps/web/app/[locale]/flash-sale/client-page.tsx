"use client"

import * as React from "react"
import { useFlashSaleQuery } from "../(home)/services/queries"
import { ProductCard } from "@/components/product-card"
import { Loader2, Timer } from "lucide-react"

export default function FlashSalePage() {
  const { data: products, isLoading } = useFlashSaleQuery()

  return (
    <div className="container mx-auto px-4 md:px-6 py-12 md:py-24 animate-in fade-in duration-700">
      <div className="flex flex-col items-center justify-center text-center mb-16">
        <div className="inline-flex items-center gap-2 mb-6 bg-destructive/10 text-destructive px-4 py-1.5 rounded-full">
          <Timer className="w-4 h-4" />
          <span className="text-sm font-semibold tracking-widest uppercase">Limited Time</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-serif tracking-tight mb-4 text-foreground">Flash Sale</h1>
        <p className="text-muted-foreground max-w-2xl text-lg font-light">
          Exclusive discounts on selected pieces. Once they're gone, they're gone.
        </p>
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-10 sm:gap-x-6 sm:gap-y-12">
          {products?.map((product: any, index: number) => (
            <ProductCard key={product.id} product={product} priority={index < 4} />
          ))}
        </div>
      )}

      {products?.length === 0 && (
        <div className="text-center py-24 text-muted-foreground font-light text-lg">
          There are no active flash sales right now. Check back later!
        </div>
      )}
    </div>
  )
}
