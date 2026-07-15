"use client";
import { useState, useEffect } from 'react';
import { useRouter } from '@/i18n/routing';
import { toast } from 'sonner';
import { Star, Loader2, Save, Check } from 'lucide-react';
import { useUpdateReviewDraft, useSubmitReviewDraft } from '@/components/reviews/reviews.queries';



interface ReviewFormClientProps {
  reviewId: string;
  orderId: string;
  initialRating: number;
  initialTitle?: string;
  initialComment?: string;
  isPublished?: boolean;
}

export function ReviewFormClient({ reviewId, orderId, initialRating, initialComment, isPublished }: ReviewFormClientProps) {
  const router = useRouter();
  const rating = initialRating || 0;
  const [comment, setComment] = useState(initialComment || '');

  const getTitleForRating = (r: number) => {
    switch (r) {
      case 1: return "Worse";
      case 2: return "Bad";
      case 3: return "Good";
      case 4: return "Great";
      case 5: return "Excellent";
      default: return "";
    }
  };

  const title = getTitleForRating(rating);
  
  const updateDraft = useUpdateReviewDraft();
  const submitDraft = useSubmitReviewDraft();

  const handleSaveDraft = async () => {
    updateDraft.mutate(
      { reviewId, payload: { rating, title, comment } },
      {
        onSuccess: () => toast.success('Draft saved successfully'),
        onError: (err: any) => toast.error(err?.message || 'Failed to save draft')
      }
    );
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error("Please provide an overall rating");
      return;
    }

    submitDraft.mutate(
      { reviewId, payload: { rating, title, comment } },
      {
        onSuccess: () => {
          toast.success(isPublished ? 'Review updated successfully' : 'Review submitted successfully');
          router.push(`/account/orders/${orderId}`);
        },
        onError: (err: any) => {
          toast.error(err?.message || 'Failed to submit review');
        }
      }
    );
  };


  return (
    <div className="space-y-8 pb-12">
      {/* Static Overall Rating that is always present */}
      <div className="space-y-3">
        <label className="font-semibold text-lg flex items-center gap-1">
          Product Rating <span className="text-red-500">*</span>
        </label>
        <div className="flex items-center gap-2 mb-4">
          <div className="flex">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-8 h-8 ${rating >= star ? 'text-yellow-400 fill-current' : 'text-muted-foreground'}`}
              />
            ))}
          </div>
          <span className="text-xl font-medium ml-2">{title}</span>
        </div>
      </div>




      <div className="space-y-3">
        <label className="font-semibold flex flex-col">Comments</label>
        <textarea
          className="w-full border rounded-md p-3 bg-background outline-none focus:border-primary min-h-[120px] resize-none"
          placeholder="What did you like or dislike?"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
      </div>

      <div className="flex gap-4 pt-4 border-t">
        {!isPublished && (
          <button
            onClick={handleSaveDraft}
            disabled={updateDraft.isPending || submitDraft.isPending}
            className="flex items-center gap-2 px-6 py-2.5 border rounded-md font-medium text-sm hover:bg-muted disabled:opacity-50"
          >
            {updateDraft.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Draft
          </button>
        )}
        <button
          onClick={handleSubmit}
          disabled={updateDraft.isPending || submitDraft.isPending || rating === 0}
          className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-md font-medium text-sm hover:bg-primary/90 disabled:opacity-50 ml-auto"
        >
          {submitDraft.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
          {isPublished ? 'Save Changes' : 'Submit Review'}
        </button>
      </div>
    </div>
  );
}
