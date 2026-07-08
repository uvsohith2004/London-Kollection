import { useState } from "react";
import { Star, Loader2 } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { cn } from "@workspace/ui/lib/utils";
import { useSubmitReview } from "./reviews.queries";

export function ReviewForm({ productId, onSuccess }: { productId: string; onSuccess?: () => void }) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  
  const submitMutation = useSubmitReview();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) return;

    submitMutation.mutate(
      { productId, rating, title, comment },
      {
        onSuccess: () => {
          if (onSuccess) onSuccess();
        },
      }
    );
  };

  return (
    <div className="bg-card border border-border/50 rounded-2xl p-5 md:p-8 shadow-sm">
      <h3 className="text-lg md:text-xl font-serif mb-4">Write a Review</h3>
      
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Overall Rating *</label>
          <div className="flex items-center gap-1" onMouseLeave={() => setHoverRating(0)}>
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                className="p-1 focus:outline-none transition-transform hover:scale-110"
              >
                <Star
                  className={cn(
                    "h-8 w-8 md:h-10 md:w-10 transition-colors",
                    (hoverRating || rating) >= star ? "fill-primary text-primary" : "fill-muted text-muted"
                  )}
                />
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="title" className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Headline</label>
          <Input
            id="title"
            placeholder="What's most important to know?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="bg-muted/30 h-12"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="comment" className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Written Review</label>
          <textarea
            id="comment"
            placeholder="What did you like or dislike? What did you use this product for?"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="flex min-h-30 w-full rounded-md border border-input bg-muted/30 px-3 py-3 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>

        <Button 
          type="submit" 
          disabled={rating === 0 || submitMutation.isPending}
          className="w-full md:w-auto md:self-end h-12 px-8 uppercase tracking-widest text-xs font-bold rounded-full mt-2"
        >
          {submitMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          Submit Review
        </Button>
      </form>
    </div>
  );
}
