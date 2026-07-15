import { ReturnFormBuilder } from "./components/return-form-builder"

export default function AdminReturnFormsPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between space-y-2">
        <h3 className="text-xl font-bold tracking-tight">Custom Return Forms</h3>
      </div>
      <p className="text-sm text-muted-foreground">
        Build dynamic forms that customers must fill out when returning a product. 
        You can attach these forms to specific products in the product catalog.
      </p>
      
      <ReturnFormBuilder />
    </div>
  )
}
