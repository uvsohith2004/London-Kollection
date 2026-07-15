import { Skeleton } from "@workspace/ui/components/skeleton"

export default function AccountOrdersLoading() {
  return (
    <section className="max-w-4xl animate-in space-y-6 py-8 duration-500 fade-in">
      {/* Header */}
      <div className="mb-6 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
        <div className="w-full md:w-auto">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="mt-2 h-4 w-64" />
        </div>
      </div>

      {/* Top bar (search + filter) */}
      <div className="mb-6 border-b border-border/60 pb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <Skeleton className="h-10.5 flex-1 rounded-xl" />
          <Skeleton className="h-10.5 w-full sm:w-28 rounded-xl" />
        </div>
      </div>

      {/* Order cards */}
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-card"
          >
            {/* Top info row */}
            <div className="grid grid-cols-2 gap-3 border-b border-border/60 bg-muted/20 px-4 py-3 sm:grid-cols-3">
              <div className="flex flex-col gap-1.5">
                <Skeleton className="h-2.5 w-20" />
                <Skeleton className="h-4 w-24" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Skeleton className="h-2.5 w-20" />
                <Skeleton className="h-4 w-20" />
              </div>
              <div className="col-span-2 flex flex-col gap-1.5 sm:col-span-1 sm:items-end">
                <Skeleton className="h-2.5 w-14" />
                <Skeleton className="h-4 w-16" />
              </div>
            </div>

            {/* Bottom content row */}
            <div className="flex flex-col justify-between gap-4 p-4 sm:flex-row sm:items-center">
              <div className="flex flex-1 items-center gap-4">
                <Skeleton className="h-16 w-16 shrink-0 rounded-xl sm:h-20 sm:w-20" />
                <div className="flex flex-col gap-2">
                  <Skeleton className="h-5 w-28" />
                </div>
              </div>

              <div className="mt-2 flex w-full shrink-0 flex-col items-start border-t border-border/40 pt-3 sm:mt-0 sm:w-auto sm:items-end sm:border-t-0 sm:pt-0">
                <Skeleton className="mb-2 h-2.5 w-16" />
                <div className="flex w-full gap-2 sm:w-auto">
                  <Skeleton className="h-8 w-full sm:w-28 rounded-lg" />
                  <Skeleton className="h-8 w-full sm:w-28 rounded-lg" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
