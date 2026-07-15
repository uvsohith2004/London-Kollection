"use client"

import { Button } from "@workspace/ui/components/button"
import { LayoutList, List, AlignJustify } from "lucide-react"

export type OrderLayoutType = "table" | "list-card" | "block-card"

interface OrderLayoutSelectionProps {
  layout: OrderLayoutType
  setLayout: (layout: OrderLayoutType) => void
}

export function OrderLayoutSelection({ layout, setLayout }: OrderLayoutSelectionProps) {
  return (
    <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-full border border-border/50">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setLayout("table")}
        className={`h-8 w-8 rounded-full transition-all duration-200 ${layout === "table" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
        title="Table View"
      >
        <AlignJustify className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setLayout("list-card")}
        className={`h-8 w-8 rounded-full transition-all duration-200 ${layout === "list-card" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
        title="List View"
      >
        <List className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setLayout("block-card")}
        className={`h-8 w-8 rounded-full transition-all duration-200 ${layout === "block-card" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
        title="Grid View"
      >
        <LayoutList className="h-4 w-4" />
      </Button>
    </div>
  )
}
