import { Card } from "@workspace/ui/components/card"
import { Separator } from "@workspace/ui/components/separator"
import { Switch } from "@workspace/ui/components/switch"
import React from "react"
import { Label } from "@workspace/ui/components/label"
import { UseFormReturn } from "react-hook-form"
import { ProductFormValues } from "../use-product-form"

const PublishSection = ({form}: {form: UseFormReturn<ProductFormValues>}) => {
  return (
    <Card className="p-6">
      <h3 className="mb-5 text-lg font-semibold text-foreground">
        Publishing Status
      </h3>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label className="text-base">Published</Label>
            <p className="text-sm text-muted-foreground">
              Visible on storefront
            </p>
          </div>
          <Switch
            checked={form.watch("published")}
            onCheckedChange={(checked) =>
              form.setValue("published", checked, { shouldDirty: true })
            }
          />
        </div>

        <Separator className="bg-border/50" />

        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label className="text-base">Featured</Label>
            <p className="text-sm text-muted-foreground">
              Show in featured lists
            </p>
          </div>
          <Switch
            checked={form.watch("featured")}
            onCheckedChange={(checked) =>
              form.setValue("featured", checked, { shouldDirty: true })
            }
          />
        </div>

        <Separator className="bg-border/50" />

        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label className="text-base">New Arrival</Label>
            <p className="text-sm text-muted-foreground">Add "New" badge</p>
          </div>
          <Switch
            checked={form.watch("isNewArrival")}
            onCheckedChange={(checked) =>
              form.setValue("isNewArrival", checked, {
                shouldDirty: true,
              })
            }
          />
        </div>
      </div>
    </Card>
  )
}

export default PublishSection
