import { Star } from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";

interface StarRatingProps {
  rating: number;
  maxStars?: number;
  className?: string;
}

export default function StarRating({ rating, maxStars = 5, className }: StarRatingProps) {
  return (
    <div className={cn("flex items-center gap-0.5", className)}>
      {Array.from({ length: maxStars }).map((_, i) => {
        const isFilled = i < Math.floor(rating);
        const isHalf = i === Math.floor(rating) && rating % 1 !== 0;

        return (
          <div key={i} className="relative">
            <Star className="w-3.5 h-3.5 text-muted-foreground/30" />
            {(isFilled || isHalf) && (
              <Star
                className={cn(
                  "w-3.5 h-3.5 text-amber-500 fill-amber-500 absolute top-0 left-0",
                  isHalf ? "overflow-hidden" : ""
                )}
                style={isHalf ? { clipPath: "polygon(0 0, 50% 0, 50% 100%, 0 100%)" } : undefined}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
