"use client"

import { useCustomerReviewsQuery } from "../../services/queries"
import { Star } from "lucide-react"
import type { CustomerReview } from "@/types/types"

export function HomeCustomerReviews() {
  const { data: reviews, isLoading } = useCustomerReviewsQuery()

  return (
    <div className="w-full bg-secondary/5 py-16 md:py-24">
      <div className="container mx-auto mb-10 px-4 text-center md:px-6">
        <h2
          className="font-serif text-3xl tracking-tight md:text-5xl"
          dir="auto"
        >
          The Verdict
        </h2>
        <p
          className="mx-auto mt-3 max-w-md text-sm font-light text-muted-foreground md:text-base"
          dir="auto"
        >
          Don't just take our word for it. Hear from our community.
        </p>
      </div>

      <div className="container mx-auto px-4 md:px-6">
        {isLoading ? (
          <div className="flex justify-center gap-4 overflow-hidden md:gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-50 w-75 shrink-0 animate-pulse rounded-xl bg-secondary/20"
              />
            ))}
          </div>
        ) : (
          <div
            dir="ltr"
            className="no-scrollbar flex snap-x snap-mandatory justify-start gap-4 overflow-x-auto px-4 pb-8 md:gap-6 md:px-6 lg:justify-center"
          >
            {reviews?.map((review: CustomerReview) => (
              <div
                key={review.id}
                className="flex w-[85vw] shrink-0 snap-center flex-col gap-4 border border-border/50 bg-background p-6 md:w-100 md:p-8"
              >
                <div className="flex gap-1 text-foreground">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${i < (review.rating || 0) ? "fill-foreground" : "fill-none text-muted-foreground opacity-30"}`}
                    />
                  ))}
                </div>
                <p
                  className="font-serif text-lg leading-relaxed text-foreground italic md:text-xl"
                  dir="auto"
                >
                  "{review.description}"
                </p>
                <div className="mt-auto flex items-center justify-between border-t border-border/40 pt-4">
                  <span
                    className="text-xs font-semibold tracking-widest text-muted-foreground uppercase"
                    dir="auto"
                  >
                    {review.name || "Anonymous"}
                  </span>
                  {review.verifiedPurchase && (
                    <span className="text-[10px] tracking-widest text-muted-foreground/50 uppercase">
                      Verified Buyer
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
