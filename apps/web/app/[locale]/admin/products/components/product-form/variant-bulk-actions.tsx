"use client"

import * as React from "react"
import { Button } from "@workspace/ui/components/button"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@workspace/ui/components/dropdown-menu"
import { ChevronDown, DollarSign, Package, Activity, Copy, Trash } from "lucide-react"

interface VariantBulkActionsProps {
  onBulkPrice: () => void
  onBulkInventory: () => void
  onBulkStatus: () => void
  onBulkImages: () => void
  onBulkDelete: () => void
}

export function VariantBulkActions({ 
  onBulkPrice, 
  onBulkInventory, 
  onBulkStatus, 
  onBulkImages,
  onBulkDelete
}: VariantBulkActionsProps) {
  return (
    <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg border border-border/50">
      <span className="text-sm font-medium text-muted-foreground px-2">Bulk Actions:</span>
      <Button variant="outline" size="sm" type="button" onClick={onBulkPrice}>
        <DollarSign className="w-4 h-4 mr-2" /> Price
      </Button>
      <Button variant="outline" size="sm" type="button" onClick={onBulkInventory}>
        <Package className="w-4 h-4 mr-2" /> Inventory
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3">
          More <ChevronDown className="w-4 h-4 ml-2" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={onBulkStatus}>
            <Activity className="w-4 h-4 mr-2" /> Update Status
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onBulkImages}>
            <Copy className="w-4 h-4 mr-2" /> Assign Images
          </DropdownMenuItem>
          <DropdownMenuItem className="text-destructive" onClick={onBulkDelete}>
            <Trash className="w-4 h-4 mr-2" /> Delete Selected
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
