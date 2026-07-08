import { useState } from "react";
import { ReviewResponse, useVoteReview } from "./reviews.queries";
import { ThumbsUp, ThumbsDown, Star, User } from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";

export function ReviewCard({ reviewData }: { reviewData: ReviewResponse }) {
  const { review, user, voteScore, currentUserVote } = reviewData;
  const [localVote, setLocalVote] = useState(currentUserVote);
  const [localScore, setLocalScore] = useState(voteScore);
  const voteMutation = useVoteReview();

  const handleVote = (voteType: 1 | -1) => {
    let newVote: 1 | -1 | 0 = voteType;
    if (localVote === voteType) {
      newVote = 0; 
    }
    const diff = newVote - localVote;
    setLocalVote(newVote);
    setLocalScore(localScore + diff);

    voteMutation.mutate({ reviewId: review.id, vote: newVote });
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 p-5 md:p-6 bg-card border border-border/40 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
      
      {/* User Info (Mobile: Top, Desktop: Left side) */}
      <div className="flex items-center gap-3 md:flex-col md:w-32 md:items-start shrink-0">
        <div className="h-10 w-10 md:h-12 md:w-12 rounded-full overflow-hidden bg-muted flex items-center justify-center shrink-0 border border-border">
          {user.image ? (
            <img src={user.image} alt={user.name} className="h-full w-full object-cover" />
          ) : (
            <User className="h-5 w-5 text-muted-foreground" />
          )}
        </div>
        <div className="flex flex-col">
          <span className="font-medium text-sm md:text-base leading-tight">{user.name || "Anonymous"}</span>
          <span className="text-xs text-muted-foreground mt-0.5">Verified Buyer</span>
        </div>
      </div>

      {/* Review Content */}
      <div className="flex flex-col flex-1 min-w-0">
        <div className="flex items-center justify-between gap-4 mb-2">
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={cn(
                  "h-4 w-4 md:h-5 md:w-5",
                  i < review.rating ? "fill-primary text-primary" : "fill-muted text-muted"
                )}
              />
            ))}
          </div>
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {new Date(review.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
          </span>
        </div>

        {review.title && <h4 className="font-semibold text-base md:text-lg mb-2">{review.title}</h4>}
        {review.comment && <p className="text-sm md:text-base text-muted-foreground leading-relaxed whitespace-pre-wrap">{review.comment}</p>}

        {/* Voting UI */}
        <div className="flex items-center gap-4 mt-6 pt-4 border-t border-border/30">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Helpful?</span>
          
          <div className="flex items-center bg-muted/30 rounded-full border border-border/50">
            <button
              onClick={() => handleVote(1)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-l-full transition-colors",
                localVote === 1 ? "bg-primary text-primary-foreground" : "hover:bg-muted text-muted-foreground"
              )}
            >
              <ThumbsUp className="h-3.5 w-3.5" />
              <span className="text-xs font-medium">{localScore > 0 && localVote === 1 ? localScore : (localScore > 0 ? localScore : '')}</span>
            </button>
            <div className="w-px h-4 bg-border/50" />
            <button
              onClick={() => handleVote(-1)}
              className={cn(
                "flex items-center px-3 py-1.5 rounded-r-full transition-colors",
                localVote === -1 ? "bg-destructive/10 text-destructive" : "hover:bg-muted text-muted-foreground"
              )}
            >
              <ThumbsDown className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
