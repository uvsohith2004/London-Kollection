import { useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";

interface LoadMoreTriggerProps {
  onLoadMore: () => void;
  hasMore: boolean;
  isFetching: boolean;
}

export function LoadMoreTrigger({ onLoadMore, hasMore, isFetching }: LoadMoreTriggerProps) {
  const triggerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!hasMore || isFetching) return;

    const currentTrigger = triggerRef.current;
    if (!currentTrigger) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          onLoadMore();
        }
      },
      { threshold: 0.1, rootMargin: "200px" }
    );

    observer.observe(currentTrigger);

    return () => {
      observer.unobserve(currentTrigger);
    };
  }, [hasMore, isFetching, onLoadMore]);

  if (!hasMore) return null;

  return (
    <div ref={triggerRef} className="py-6 flex justify-center w-full">
      {isFetching ? (
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      ) : (
        <div className="h-6" /> // spacer to trigger intersection
      )}
    </div>
  );
}
