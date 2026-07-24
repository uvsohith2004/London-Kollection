import { Skeleton } from "@workspace/ui/components/skeleton"

export function SearchSkeleton() {
  return (
    <div className="w-full">
      <Skeleton className="aspect-[3/4] w-full rounded-2xl" />
      <Skeleton className="mt-4 h-5 w-3/4" />
      <Skeleton className="mt-2 h-4 w-1/4" />
    </div>
  )
}
