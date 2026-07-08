"use client"

import * as React from "react"
import { ProductsTab } from "./components/products-tab"

export default function ProductsPage() {
  return (
    <div className="mx-auto max-w-[1400px] space-y-12 pb-24 font-sans">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <h2 className="font-heading text-4xl font-light tracking-tight text-foreground uppercase">
            Products
          </h2>
          <p className="text-sm font-medium tracking-widest text-muted-foreground uppercase">
            Inventory Management
          </p>
        </div>
      </div>

      <div className="animate-in fade-in duration-500">
        <ProductsTab />
      </div>
    </div>
  )
}
