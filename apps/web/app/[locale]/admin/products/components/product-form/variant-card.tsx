"use client"

import * as React from "react"
import { MediaUploader } from "@/components/media-uploader"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { UseFormReturn } from "react-hook-form"
import { ProductFormValues } from "./use-product-form"
import { Trash2, ChevronDown, ChevronRight, Image as ImageIcon } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Badge } from "@workspace/ui/components/badge"
import { Checkbox } from "@workspace/ui/components/checkbox"
import { cn } from "@workspace/ui/lib/utils"

interface VariantCardProps {
  form: UseFormReturn<ProductFormValues>
  index: number
  onRemove?: () => void
  isExpanded?: boolean
  hideToggle?: boolean
  isSelected?: boolean
  onSelect?: (selected: boolean) => void
}

export function VariantCard({ 
  form, 
  index, 
  onRemove, 
  isExpanded: defaultExpanded = false,
  hideToggle = false,
  isSelected = false,
  onSelect
}: VariantCardProps) {
  const [isExpanded, setIsExpanded] = React.useState(defaultExpanded)
  const variant = form.watch(`variants.${index}`)
  const imagesError = form.formState.errors.variants?.[index]?.images?.message

  const images = variant.images || []
  const imageUrls = images.map(img => img.url)

  const handleImagesChange = (urls: string | string[]) => {
    const urlsArray = Array.isArray(urls) ? urls : [urls]
    const newImages = urlsArray.slice(0, 6).map((url, i) => ({
      url,
      isPrimary: i === 0
    }))
    form.setValue(`variants.${index}.images`, newImages, { shouldValidate: true })
  }

  return (
    <div className={cn(
      "bg-card border rounded-xl overflow-hidden transition-all duration-200",
      isSelected ? "border-primary/50 ring-1 ring-primary/20" : "border-border/50 shadow-sm",
      isExpanded ? "pb-5" : ""
    )}>
      {/* Collapsed/Header view */}
      <div className="flex items-center gap-3 p-3 sm:p-4">
        {onSelect && (
          <Checkbox 
            checked={isSelected} 
            onCheckedChange={(checked: boolean) => onSelect(!!checked)}
            className="mt-0.5"
          />
        )}
        
        {!hideToggle && (
          <button 
            type="button" 
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </button>
        )}

        <div className="flex-1 flex flex-wrap items-center gap-2">
          {variant.combinationsRaw ? (
            variant.combinationsRaw.split(",").map((combo, i) => {
              const [key, val] = combo.split(":")
              return (
                <Badge key={i} variant="secondary" className="font-medium text-xs">
                  {val?.trim()}
                </Badge>
              )
            })
          ) : (
            <Badge variant="outline" className="text-xs">Base variant</Badge>
          )}

          {variant.combinationsRaw?.split(",").length === 1 && (
             <span className="text-sm text-muted-foreground ml-2">Main variant</span>
          )}
        </div>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="hidden sm:block min-w-[60px]">{variant.price ? `KWD ${variant.price}` : "—"}</div>
          <div className="hidden sm:block min-w-[60px]">{variant.stock || 0} in stock</div>
          <div className="hidden md:flex items-center gap-1.5 min-w-[60px]">
            <ImageIcon className="w-4 h-4" /> {images.length}
          </div>
        </div>

        {onRemove && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onRemove}
            className="h-8 w-8 shrink-0 text-muted-foreground hover:bg-destructive/10 hover:text-destructive rounded-full"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
      
      {/* Expanded view */}
      {isExpanded && (
        <div className="px-5 sm:px-6 mt-2 space-y-5 animate-in fade-in slide-in-from-top-2 duration-200">
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1.5 flex flex-col justify-end">
              <Label className="text-xs font-medium text-muted-foreground">SKU</Label>
              <Input placeholder="Variant SKU" {...form.register(`variants.${index}.sku`)} className="h-9" />
              {form.formState.errors.variants?.[index]?.sku && (
                <p className="text-xs text-destructive">{form.formState.errors.variants[index].sku.message}</p>
              )}
            </div>

            <div className="space-y-1.5 flex flex-col justify-end">
              <Label className="text-xs font-medium text-muted-foreground">Stock</Label>
              <Input
                type="number"
                min="0"
                placeholder="0"
                {...form.register(`variants.${index}.stock`)}
                className="h-9"
              />
              {form.formState.errors.variants?.[index]?.stock && (
                <p className="text-xs text-destructive">{form.formState.errors.variants[index].stock.message}</p>
              )}
            </div>

            <div className="space-y-1.5 flex flex-col justify-end">
              <Label className="text-xs font-medium text-muted-foreground truncate" title="Price override">Price Override</Label>
              <Input
                type="number"
                step="0.01"
                placeholder="Inherits base"
                {...form.register(`variants.${index}.price`)}
                className="h-9"
              />
              {form.formState.errors.variants?.[index]?.price && (
                <p className="text-xs text-destructive">{form.formState.errors.variants[index].price.message}</p>
              )}
            </div>

            <div className="space-y-1.5 flex flex-col justify-end">
              <Label className="text-xs font-medium text-muted-foreground">Status</Label>
              <Select
                onValueChange={(val) => form.setValue(`variants.${index}.inventoryStatus`, val as any)}
                defaultValue={form.getValues(`variants.${index}.inventoryStatus`) || "in_stock"}
              >
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="in_stock">In stock</SelectItem>
                  <SelectItem value="out_of_stock">Out of stock</SelectItem>
                  <SelectItem value="pre_order">Pre-order</SelectItem>
                  <SelectItem value="coming_soon">Coming soon</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between mb-1">
              <Label className="text-xs font-medium text-muted-foreground">
                Variant Images
              </Label>
              <span className="text-xs text-muted-foreground">{images.length} / 6</span>
            </div>
            <MediaUploader
              multiple
              value={imageUrls}
              onChange={handleImagesChange}
              className="max-h-[220px] overflow-y-auto"
            />
            {imagesError && <p className="text-xs text-destructive">{imagesError}</p>}
          </div>
        </div>
      )}
    </div>
  )
}
