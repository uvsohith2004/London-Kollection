import * as React from "react"
import { ProductTable } from "./product-table"
import { ProductListCard } from "./product-list-card"
import { ProductBlockCard } from "./product-block-card"
import { ProductLayoutType } from "./product-layout-selection"

interface ProductGridProps {
  products: any[]
  layout: ProductLayoutType
  onEdit: (product: any) => void
  onDelete: (productId: string) => void
}

export function ProductGrid({ products, layout, onEdit, onDelete }: ProductGridProps) {
  if (layout === "table") {
    return <ProductTable products={products} onEdit={onEdit} onDelete={onDelete} />
  }

  if (layout === "list-card") {
    return (
      <div className="flex flex-col gap-4">
        {products.map(product => (
          <ProductListCard key={product.id} product={product} onEdit={onEdit} onDelete={onDelete} />
        ))}
      </div>
    )
  }

  // grid and block-card essentially use the same card, just different container columns
  const gridClass = layout === "block-card" 
    ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
    : "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4"

  return (
    <div className={gridClass}>
      {products.map(product => (
        <ProductBlockCard key={product.id} product={product} onEdit={onEdit} onDelete={onDelete} />
      ))}
    </div>
  )
}
