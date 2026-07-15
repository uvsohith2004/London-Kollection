"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { ReviewStats } from "./review-stats";
import { ReviewFilterBar } from "./review-filter-bar";
import { ReviewCard } from "./review-card";
import { ReviewForm } from "./review-form";
import { useProductReviews, useProductRatingSummary, useUserReviewStatus } from "./reviews.queries";

export function ProductReviews({ productId }: { productId: string }) {
  const [filter, setFilter] = useState("");
  const [sort, setSort] = useState("top");

  const { data: summary, isLoading: isSummaryLoading } = useProductRatingSummary(productId);
  const { data: reviews, isLoading: isReviewsLoading } = useProductReviews(productId, { rating: filter, sort });
  const { data: userStatus, isLoading: isUserStatusLoading } = useUserReviewStatus(productId);

  return (
    <div className="w-full">
      {/* Top Section: Stats & Write Review */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* Left: Summary */}
        <div className="w-full">
          {isSummaryLoading ? (
            <div className="h-50 flex items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : summary ? (
            <ReviewStats summary={summary} />
          ) : null}
        </div>

        {/* Right: User's Review or Form */}
        <div className="w-full">
          {isUserStatusLoading ? (
            <div className="h-50 flex items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : userStatus?.eligible && userStatus.hasReviewed && userStatus.review ? (
            <div className="flex flex-col gap-4">
              <h3 className="text-xl font-serif">Your Review</h3>
              <ReviewCard 
                reviewData={{ 
                  review: userStatus.review, 
                  user: { id: "me", name: "You", image: null }, 
                  voteScore: 0, 
                  currentUserVote: 0 
                }} 
              />
            </div>
          ) : (
            <div className="bg-muted/30 border border-border/50 rounded-2xl p-8 h-full flex flex-col items-center justify-center text-center">
              <h3 className="text-xl font-serif mb-2">Write a Review</h3>
              <p className="text-muted-foreground text-sm max-w-sm mb-4">
                Reviews can only be submitted after your order has been delivered.
              </p>
              {userStatus?.eligible ? (
                <a href="/account/orders" className="text-primary hover:underline text-sm font-semibold uppercase tracking-widest">
                  Go to Orders
                </a>
              ) : (
                <p className="text-muted-foreground text-xs uppercase tracking-widest">
                  Purchased this? Check your orders.
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Filters and Review List */}
      <div className="mt-8">
        <ReviewFilterBar
          currentFilter={filter}
          onFilterChange={setFilter}
          currentSort={sort}
          onSortChange={setSort}
        />

        <div className="flex flex-col gap-6 mt-8">
          {isReviewsLoading ? (
            <div className="py-24 flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : reviews && reviews.length > 0 ? (
            reviews.map((reviewResponse:any) => (
              <ReviewCard key={reviewResponse.review.id} reviewData={reviewResponse} />
            ))
          ) : (
            <div className="py-24 text-center">
              <h4 className="text-lg font-serif mb-2">No Reviews Found</h4>
              <p className="text-muted-foreground text-sm">
                Try changing your filters or be the first to review if you've purchased this item.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
