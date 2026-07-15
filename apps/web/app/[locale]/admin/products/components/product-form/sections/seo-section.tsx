"use client"

import * as React from "react"
import { UseFormReturn } from "react-hook-form"
import { ProductFormValues } from "../use-product-form"
import { SEOFormSection } from "../../../../components/seo-form-section"

interface SEOSectionProps {
  form: UseFormReturn<ProductFormValues>
}

export function SEOSection({ form }: SEOSectionProps) {
  return (
    <SEOFormSection 
      form={form} 
      titleKey="metaTitle" 
      descriptionKey="metaDescription" 
      keywordsKey="seoKeywords" 
    />
  )
}
