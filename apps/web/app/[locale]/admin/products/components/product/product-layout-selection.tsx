"use client"

import * as React from "react"
import { LayoutGrid, List, LayoutList, AlignJustify } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"

export type ProductLayoutType = "table" | "list-card" | "block-card" | "grid"

interface ProductLayoutSelectionProps {
  layout: ProductLayoutType
  setLayout: (layout: ProductLayoutType) => void
}

export function ProductLayoutSelection({ layout, setLayout }: ProductLayoutSelectionProps) {
  const options: { value: ProductLayoutType, icon: React.ReactNode, label: string }[] = [
    { value: "table", icon: <AlignJustify className="h-4 w-4" />, label: "Table" },
    { value: "list-card", icon: <List className="h-4 w-4" />, label: "List" },
    { value: "block-card", icon: <LayoutList className="h-4 w-4" />, label: "Block" },
    { value: "grid", icon: <LayoutGrid className="h-4 w-4" />, label: "Grid" },
  ]

  return (
    <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-full border border-border/50">
      {options.map((opt) => (
        <Button
          key={opt.value}
          variant="ghost"
          size="icon"
          onClick={() => setLayout(opt.value)}
          className={cn(
            "h-8 w-8 rounded-full transition-all duration-200",
            layout === opt.value 
              ? "bg-background shadow-sm text-foreground" 
              : "text-muted-foreground hover:text-foreground"
          )}
          title={opt.label}
        >
          {opt.icon}
        </Button>
      ))}
    </div>
  )
}
