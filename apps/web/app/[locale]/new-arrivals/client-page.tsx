"use client"

import * as React from "react"
import { useNewArrivalsQuery } from "../(home)/services/queries"
import { ProductCard } from "@/components/product-card"
import { Loader2 } from "lucide-react"

export default function NewArrivalsPage() {
  const { data: products, isLoading } = useNewArrivalsQuery()

  return (
    <div className="container mx-auto px-4 md:px-6 py-12 md:py-24 animate-in fade-in duration-700">
      <div className="flex flex-col items-center justify-center text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-serif tracking-tight mb-4 text-foreground">New Arrivals</h1>
        <p className="text-muted-foreground max-w-2xl text-lg font-light">
          Discover the latest additions to our collection. Curated pieces designed for the modern wardrobe.
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
          No new arrivals found at the moment.
        </div>
      )}
    </div>
  )
}
