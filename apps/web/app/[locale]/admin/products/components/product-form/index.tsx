"use client"

import * as React from "react"
import { DesktopForm } from "./desktop-form"
import { useProductForm } from "./use-product-form"
import { Loader2 } from "lucide-react"

interface ProductFormProps {
  initialData?: any
  onSuccess?: () => void
  onCancel?: () => void
}

export function ProductForm({ initialData, onSuccess, onCancel }: ProductFormProps) {
  const formHook = useProductForm(initialData, onSuccess)

  if (formHook.referenceData.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4 text-muted-foreground">
          <Loader2 className="w-8 h-8 animate-spin" />
          <p>Loading catalog data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full relative">
      <DesktopForm {...formHook} onCancel={onCancel} />

    </div>
  )
}
