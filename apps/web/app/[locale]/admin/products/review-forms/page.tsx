import { ReviewFormBuilder } from "./components/review-form-builder"

export default function AdminReviewFormsPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Review Forms</h2>
      </div>
      <p className="text-muted-foreground">
        Create and manage dynamic review forms to ask specific questions about your products.
      </p>
      
      <ReviewFormBuilder />
    </div>
  )
}
