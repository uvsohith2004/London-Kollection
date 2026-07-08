"use client"

import Link from "next/link"
import { OptimizedImage } from "@/components/optimized-image"
import { useOccasionsQuery } from "../../services/queries"

export function HomeShopByOccasion() {
  const { data: occasions, isLoading } = useOccasionsQuery()

  return (
    <div className="w-full">
      <div className="container mx-auto mb-8 px-4 text-center md:px-6">
        <h2
          className="font-serif text-3xl tracking-tight md:text-4xl"
          dir="auto"
        >
          Shop by Occasion
        </h2>
      </div>

      <div className="container mx-auto px-4 md:px-6">
        {isLoading ? (
          <div className="flex justify-center gap-6 overflow-hidden md:gap-12">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex flex-col items-center gap-4">
                <div className="h-24 w-24 animate-pulse rounded-full bg-secondary md:h-32 md:w-32" />
                <div className="h-4 w-16 animate-pulse bg-secondary" />
              </div>
            ))}
          </div>
        ) : (
          <div
            dir="ltr"
            className="no-scrollbar flex snap-x justify-start gap-6 overflow-x-auto px-4 pb-6 md:justify-center md:gap-12 md:px-0"
          >
            {occasions?.map((occasion, idx) => (
              <Link
                key={occasion.slug}
                href={`/occasions/${occasion.slug}`}
                className="group flex shrink-0 snap-center flex-col items-center gap-4"
              >
                <div className="relative h-24 w-24 overflow-hidden rounded-full border border-border/40 p-1 transition-colors group-hover:border-foreground/50 md:h-36 md:w-36">
                  <div className="relative h-full w-full overflow-hidden rounded-full">
                    <OptimizedImage
                      asset={occasion.image}
                      fallbackUrl={typeof occasion.image === 'string' ? occasion.image : undefined}
                      alt={occasion.name}
                      fill
                      className="object-cover transition-transform duration-[2s] group-hover:scale-110 ease-out"
                      sizes="(max-width: 768px) 80vw, (max-width: 1200px) 40vw, 25vw"
                    />
                  </div>
                </div>
                <span
                  className="text-xs font-semibold tracking-widest text-foreground/80 uppercase transition-colors group-hover:text-foreground md:text-sm"
                  dir="auto"
                >
                  {occasion.name}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
