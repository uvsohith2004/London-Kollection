"use client"

import { useEffect, useState } from "react"
import { Star, X, Loader2, Upload } from "lucide-react"
import { toast } from "sonner"
import { 
  useCreateReviewDraft, 
  useReviewDraft, 
  useSubmitReviewDraft 
} from "./reviews.queries"

function useModalBehavior(isOpen: boolean, onClose: () => void) {
  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [isOpen, onClose])
}

export function ReviewModal({
  orderId,
  orderItemId,
  productName,
  onClose,
}: {
  orderId: string
  orderItemId: string
  productName: string
  onClose: () => void
}) {
  useModalBehavior(true, onClose)

  const [reviewId, setReviewId] = useState<string | null>(null)
  
  const createDraft = useCreateReviewDraft()
  const submitDraft = useSubmitReviewDraft()
  
  // State for form
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [title, setTitle] = useState("")
  const [comment, setComment] = useState("")
  const [answers, setAnswers] = useState<Record<string, any>>({})

  useEffect(() => {
    createDraft.mutate({ orderId, orderItemId }, {
      onSuccess: (data: any) => {
        setReviewId(data.id)
        if (data.rating) setRating(data.rating)
        if (data.title) setTitle(data.title)

      },
      onError: (err: any) => {
        toast.error(err?.message || "Failed to initialize review")
        onClose()
      }
    })
  }, [orderId, orderItemId])

  const { data: draftData, isLoading: isLoadingDraft } = useReviewDraft(reviewId)


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (rating === 0) {
      toast.error("Please provide a rating")
      return
    }


    submitDraft.mutate({
      reviewId: reviewId!,
      payload: {
        rating,
        title,
        comment
      }
    }, {
      onSuccess: () => {
        toast.success("Review submitted successfully!")
        onClose()
      },
      onError: (err: any) => {
        toast.error(err?.message || "Failed to submit review")
      }
    })
  }



  return (
    <div
      className="fixed inset-0 z-50 flex animate-in items-center justify-center bg-background/80 p-4 backdrop-blur-sm duration-200 fade-in"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="write-review-title"
        className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto animate-in rounded-xl border border-border bg-background p-6 shadow-xl duration-200 zoom-in-95"
      >
        <button
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute top-4 right-4 rounded-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:outline-none"
        >
          <X className="h-5 w-5" />
        </button>

        <h3 id="write-review-title" className="mb-1 text-xl font-semibold">
          Write a Review
        </h3>
        <p className="mb-6 line-clamp-1 text-sm text-muted-foreground">
          {productName}
        </p>

        {(!reviewId || isLoadingDraft) ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Base Fields */}
            <div>
              <label className="mb-3 block text-sm font-medium">Rating <span className="text-destructive">*</span></label>
              <div className="flex gap-1" onMouseLeave={() => setHoverRating(0)}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    aria-label={`${star} star${star > 1 ? "s" : ""}`}
                    className="rounded-md p-1 transition-colors hover:bg-muted focus:ring-2 focus:ring-primary/40 focus:outline-none"
                  >
                    <Star
                      className={`h-7 w-7 transition-colors ${
                        (hoverRating || rating) >= star
                          ? "fill-amber-500 text-amber-500"
                          : "fill-transparent text-muted-foreground/30"
                      }`}
                      strokeWidth={1.5}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="review-title" className="mb-2 block text-sm font-medium">
                Headline
              </label>
              <input
                id="review-title"
                className="w-full rounded-md border border-border bg-background p-3 text-sm focus:ring-2 focus:ring-primary/50 focus:outline-none"
                placeholder="What's most important to know?"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="review-text" className="mb-2 block text-sm font-medium">
                Written Review
              </label>
              <textarea
                id="review-text"
                rows={4}
                className="w-full resize-none rounded-md border border-border bg-background p-3 text-sm focus:ring-2 focus:ring-primary/50 focus:outline-none"
                placeholder="What did you like or dislike?"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </div>



            <div className="mt-8 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitDraft.isPending || rating === 0}
                className="flex-1 flex justify-center items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
              >
                {submitDraft.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit Review"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
