import { serverApi } from "@/api-client/server";
import { ReviewFormsClient } from "./client-page";

export default async function AdminReviewFormsPage() {
  const forms = await serverApi.get('/admin/review-forms').catch(() => []);

  return (
    <div className="space-y-12 w-full font-sans">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <h2 className="font-heading text-4xl font-light tracking-tight text-foreground uppercase">
            Review Forms
          </h2>
          <p className="text-sm font-medium tracking-widest text-muted-foreground uppercase">
            Customer Feedback Management
          </p>
        </div>
      </div>

      <div className="animate-in fade-in duration-500 w-full">
        <ReviewFormsClient initialData={forms} />
      </div>
    </div>
  );
}
