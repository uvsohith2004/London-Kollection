"use client"

import * as React from "react"
import { UseFormReturn } from "react-hook-form"
import { ProductFormValues } from "./use-product-form"
import { VariantCard } from "./variant-card"
import { VariantBulkActions } from "./variant-bulk-actions"
import { PackagePlus } from "lucide-react"

interface VariantManagerProps {
  form: UseFormReturn<ProductFormValues>
  variantFields: any[]
  removeVariant: (index: number) => void
}

export function VariantManager({ form, variantFields, removeVariant }: VariantManagerProps) {
  const options = form.watch("options") || []
  const hasOptions = options.length > 0 && options.some(o => o.name?.trim() && o.values?.length > 0)

  // Group variants by first option
  const groupedVariants = React.useMemo(() => {
    const groups: Record<string, { field: any; idx: number }[]> = {}
    variantFields.forEach((field: any, idx) => {
      let primaryGroup = "Base Variant"
      if (field.combinationsRaw) {
        const parts = field.combinationsRaw.split(",")
        if (parts.length > 0) {
          primaryGroup = parts[0].trim()
        }
      }
      if (!groups[primaryGroup]) {
        groups[primaryGroup] = []
      }
      groups[primaryGroup]!.push({ field, idx })
    })
    return groups
  }, [variantFields])

  const [selectedVariants, setSelectedVariants] = React.useState<number[]>([])

  if (!hasOptions) {
    return (
      <div className="space-y-4">
        <VariantCard
          form={form}
          index={0}
          isExpanded={true}
          hideToggle={true}
        />
      </div>
    )
  }

  if (variantFields.length === 0) {
    return (
      <div className="border-2 border-dashed border-border/50 rounded-xl p-12 text-center bg-muted/50">
        <PackagePlus className="w-10 h-10 text-muted-foreground/50 mx-auto mb-3" />
        <p className="text-base font-medium text-foreground mb-1">No variants generated yet</p>
        <p className="text-sm text-muted-foreground">Add values to your options above to auto-generate variants.</p>
      </div>
    )
  }

  const handleBulkPrice = () => {
    const newPrice = window.prompt("Enter new price for selected variants:")
    if (newPrice) {
      selectedVariants.forEach(idx => {
        form.setValue(`variants.${idx}.price`, Number(newPrice), { shouldValidate: true })
      })
    }
  }

  const handleBulkInventory = () => {
    const newStock = window.prompt("Enter new stock for selected variants:")
    if (newStock) {
      selectedVariants.forEach(idx => {
        form.setValue(`variants.${idx}.stock`, Number(newStock), { shouldValidate: true })
      })
    }
  }

  return (
    <div className="space-y-6">
      {selectedVariants.length > 0 && (
        <VariantBulkActions 
          onBulkPrice={handleBulkPrice}
          onBulkInventory={handleBulkInventory}
          onBulkStatus={() => {}} // TODO: implement
          onBulkImages={() => {}} // TODO: implement
          onBulkDelete={() => {
            selectedVariants.sort((a, b) => b - a).forEach(idx => removeVariant(idx))
            setSelectedVariants([])
          }}
        />
      )}

      {variantFields.length >= 30 ? (
        <div className="border rounded-lg overflow-x-auto bg-card">
          {/* Table mode for many variants */}
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground text-xs uppercase font-semibold border-b">
              <tr>
                <th className="px-4 py-3">Variant</th>
                <th className="px-4 py-3">SKU</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Stock</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Images</th>
              </tr>
            </thead>
            <tbody>
              {variantFields.map((field, idx) => {
                const variant = form.watch(`variants.${idx}`)
                return (
                  <tr key={field.id} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium">
                      {variant.combinationsRaw?.replace(/,/g, " / ")}
                    </td>
                    <td className="px-4 py-3">
                      <input 
                        className="bg-transparent border-0 p-0 focus:ring-0 w-full"
                        placeholder="SKU"
                        {...form.register(`variants.${idx}.sku`)} 
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input 
                        type="number"
                        className="bg-transparent border-0 p-0 focus:ring-0 w-full"
                        placeholder="Price"
                        {...form.register(`variants.${idx}.price`)} 
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input 
                        type="number"
                        className="bg-transparent border-0 p-0 focus:ring-0 w-full"
                        placeholder="Stock"
                        {...form.register(`variants.${idx}.stock`)} 
                      />
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {variant.inventoryStatus}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {variant.images?.length || 0} img
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedVariants).map(([groupName, items]) => (
            <div key={groupName} className="space-y-4">
              {groupName !== "Base Variant" && (
                <h4 className="text-sm font-semibold text-foreground border-b border-border/50 pb-2 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  {groupName}
                </h4>
              )}
              <div className={groupName !== "Base Variant" ? "space-y-3 pl-4 border-l-2 border-border/30" : "space-y-3"}>
                {items.map(({ field, idx }) => (
                  <VariantCard
                    key={field.id}
                    form={form}
                    index={idx}
                    onRemove={() => removeVariant(idx)}
                    isSelected={selectedVariants.includes(idx)}
                    onSelect={(selected) => {
                      if (selected) setSelectedVariants(prev => [...prev, idx])
                      else setSelectedVariants(prev => prev.filter(i => i !== idx))
                    }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
