"use client"

import * as React from "react"
import { ArrowLeft, Save, Loader2, Plus } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { useProductForm } from "./use-product-form"
import { StickySaveBar } from "@workspace/ui/components/sticky-save-bar"
import { BasicInformation } from "./sections/basic-infomation"
import { PricingSection } from "./sections/PricingSection"
import { OrganizationSection } from "./sections/OrganizationSection"
import { ReturnsSection } from "./sections/ReturnsSection"
import { VisibilitySection } from "./sections/VisibilitySection"
import { SEOSection } from "./sections/seo-section"
import { OptionBuilder } from "./option-builder"
import { VariantManager } from "./variant-manager"
import { Switch } from "@workspace/ui/components/switch"
import { Label } from "@workspace/ui/components/label"
import { Card } from "@workspace/ui/components/card"
import { Separator } from "@workspace/ui/components/separator"

interface ProductFormProps {
  initialData?: any
  onSuccess?: () => void
  onCancel?: () => void
}

export function ProductForm({
  initialData,
  onSuccess,
  onCancel,
}: ProductFormProps) {
  const {
    form,
    onSubmit,
    isPending,
    isEditing,
    optionFields,
    appendOption,
    removeOption,
    variantFields,
    removeVariant,
    referenceData,
  } = useProductForm(initialData, onSuccess)

  const hasOptions = optionFields.length > 0
  const isValid = form.formState.isValid
  const formErrors = Object.keys(form.formState.errors).length

  return (
    <section>
      <form id="product-form" onSubmit={onSubmit} className="flex flex-col min-w-0 space-y-10 pb-12">
        <BasicInformation form={form} isEditing={isEditing} />

        {/* IMPROVEMENT: Increased grid gap from 4 to 8/10 for better column separation */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:gap-10">
          {/* IMPROVEMENT: Added space-y-8 to stack Pricing and Publishing nicely */}
          <div className="flex flex-col space-y-8">
            <PricingSection
              form={form}
              currency={referenceData.currency}
              taxClasses={referenceData.taxClasses}
              isLoadingTaxes={referenceData.isLoading}
            />
            <VisibilitySection form={form} />
          </div>

          {/* Organization Section Column */}
          <div className="flex flex-col space-y-8">
            <OrganizationSection form={form} referenceData={referenceData} />
            <ReturnsSection form={form} referenceData={referenceData} />
          </div>
        </div>

        {/* IMPROVEMENT: Removed redundant div, let the <section> handle the block */}
        <section className="flex flex-col space-y-6 pt-2" id="variants">
          <div className="flex flex-col space-y-1 px-1">
            <h2 className="text-xl font-semibold tracking-tight text-foreground">
              Options & Variants
            </h2>
            <p className="text-sm text-muted-foreground">
              Manage product variations like size and color
            </p>
          </div>

          <div className="flex flex-col space-y-4">
            {optionFields.map((field, index) => (
              <OptionBuilder
                key={field.id}
                form={form}
                index={index}
                onRemove={() => removeOption(index)}
              />
            ))}

            <Button
              type="button"
              variant="outline"
              className="mt-2 w-full border-dashed py-6 text-muted-foreground hover:text-foreground"
              onClick={() => appendOption({ name: "", values: [] })}
            >
              <Plus className="mr-2 h-4 w-4" /> Add Option
            </Button>
          </div>

          {hasOptions && (
            <div className="mt-6">
              <VariantManager
                form={form}
                variantFields={variantFields}
                removeVariant={removeVariant}
                currency={referenceData.currency}
              />
            </div>
          )}
        </section>

        {/* IMPROVEMENT: Removed unnecessary wrapper div */}
        <SEOSection form={form} />

        {/* Error Validation Card */}
        {!isValid && formErrors > 0 && (
          <Card className="mt-4 border-destructive/20 bg-destructive/5 p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold text-destructive">
              Please fix the following issues to save:
            </h3>
            <ul className="list-inside list-disc space-y-1.5 text-sm text-destructive/90">
              {Object.entries(form.formState.errors).map(
                ([key, error]: any) => (
                  <li key={key}>
                    {error?.message?.toString() || `${key} is invalid`}
                  </li>
                )
              )}
            </ul>
          </Card>
        )}
      </form>
      
      <StickySaveBar 
        formId="product-form"
        onCancel={onCancel}
        isPending={isPending}
        saveActionLabel={isEditing ? "Save Changes" : "Create Product"}
        infoPanel={
          <div className="flex items-center gap-2">
            <span className="font-medium text-foreground">{form.watch("title") || "New Product"}</span>
            <span className="text-muted-foreground">&bull;</span>
            <span>{hasOptions ? `${variantFields.length} Variants` : "Standard Product"}</span>
            <span className="text-muted-foreground">&bull;</span>
            <span className="capitalize">{form.watch("status") || "draft"}</span>
          </div>
        }
      />
    </section>
  )
}
