"use client";
import { useState } from 'react';
import { Star, Loader2 } from 'lucide-react';
import { useRouter } from '@/i18n/routing';
import { toast } from 'sonner';
import { useCreateReviewDraft } from '@/components/reviews/reviews.queries';

interface ReviewButtonProps {
  productId: string;
  productName: string;
  orderId: string;
  orderItemId: string;
  existingReview?: {
    id: string;
    status: string;
    rating?: number;
  } | null;
}

export function ReviewButton({ productId, productName, orderId, orderItemId, existingReview }: ReviewButtonProps) {
  const [hoveredStar, setHoveredStar] = useState(0);
  const router = useRouter();
  const createDraft = useCreateReviewDraft();

  const isSubmitted = existingReview && existingReview.status !== 'draft';
  const displayRating = existingReview?.rating || 0;

  const handleStarClick = async (rating: number) => {
    if (existingReview) {
      router.push(`/account/orders/${orderId}/review/${existingReview.id}?rating=${rating}`);
      return;
    }
    
    createDraft.mutate(
      { orderId, orderItemId },
      {
        onSuccess: (data: any) => {
          // Pass the clicked rating to the next page as a query parameter or let the user set it there
          // The draft might be created, then redirect
          router.push(`/account/orders/${orderId}/review/${data.id}?rating=${rating}`);
        },
        onError: (err: any) => {
          toast.error(err?.message || 'Failed to create review draft');
        },
      }
    );
  };

  return (
    <div className="mt-3">
      <div className="flex items-center gap-1 group" onMouseLeave={() => setHoveredStar(0)}>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => handleStarClick(star)}
            onMouseEnter={() => setHoveredStar(star)}
            disabled={createDraft.isPending || !!isSubmitted}
            className={`transition-colors focus:outline-none disabled:opacity-100 ${
              hoveredStar >= star || (!hoveredStar && displayRating >= star) ? 'text-yellow-400' : 'text-muted-foreground'
            }`}
            aria-label={`Rate ${star} stars`}
          >
            <Star className={`w-5 h-5 ${hoveredStar >= star || (!hoveredStar && displayRating >= star) ? 'fill-current' : ''}`} />
          </button>
        ))}
        {createDraft.isPending && <Loader2 className="w-4 h-4 animate-spin ml-2 text-muted-foreground" />}
        {!createDraft.isPending && (
          <div className="flex items-center ml-2">
            <span className={`text-xs font-medium transition-opacity ${isSubmitted ? 'text-yellow-600 opacity-100' : 'text-muted-foreground opacity-0 group-hover:opacity-100'}`}>
              {isSubmitted ? 'Review Submitted' : 'Write Review'}
            </span>
            {isSubmitted && (
              <button
                type="button"
                onClick={() => router.push(`/account/orders/${orderId}/review/${existingReview.id}`)}
                className="ml-3 text-xs font-medium text-primary hover:underline"
              >
                Edit
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
