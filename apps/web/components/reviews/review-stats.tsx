import { Star } from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";

interface ReviewStatsProps {
  summary: {
    averageRating: string;
    totalReviews: number;
    distribution: Record<number, number>;
  };
}

export function ReviewStats({ summary }: ReviewStatsProps) {
  const { averageRating, totalReviews, distribution } = summary;
  
  // Calculate percentages for the bars
  const getPercentage = (count: number) => {
    if (totalReviews === 0) return 0;
    return Math.round((count / totalReviews) * 100);
  };

  return (
    <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
      {/* Average Score */}
      <div className="flex flex-col items-center justify-center min-w-35 gap-2">
        <h3 className="text-5xl md:text-6xl font-serif tracking-tight">{averageRating}</h3>
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={cn(
                "h-5 w-5",
                i < Math.round(Number(averageRating)) ? "fill-primary text-primary" : "fill-muted text-muted"
              )}
            />
          ))}
        </div>
        <p className="text-sm text-muted-foreground mt-1 uppercase tracking-widest">{totalReviews} Reviews</p>
      </div>

      {/* Distribution Bars */}
      <div className="flex flex-col gap-3 flex-1 w-full max-w-md">
        {[5, 4, 3, 2, 1].map((star) => {
          const count = distribution[star] || 0;
          const percentage = getPercentage(count);
          
          return (
            <div key={star} className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1 w-12 shrink-0">
                <span className="font-medium">{star}</span>
                <Star className="h-3.5 w-3.5 fill-muted-foreground text-muted-foreground" />
              </div>
              
              <div className="flex-1 h-2 md:h-2.5 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              
              <div className="w-10 text-right text-muted-foreground tabular-nums">
                {percentage}%
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
