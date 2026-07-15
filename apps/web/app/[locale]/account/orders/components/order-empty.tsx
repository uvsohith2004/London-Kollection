import { Package } from "lucide-react"
import React from "react"

const OrderEmpty = () => {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-12 text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl border border-border/40 bg-muted/30">
        <Package className="h-6 w-6 text-muted-foreground/60" />
      </div>
      <h3 className="mb-1 text-lg font-semibold tracking-tight text-foreground">
        No orders found
      </h3>
    </div>
  )
}

export default OrderEmpty
