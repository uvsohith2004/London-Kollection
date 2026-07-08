"use client"

import Link from "next/link"
import { OptimizedImage } from "@/components/optimized-image"
import { useRecentlyUpdatedCategoriesQuery } from "../../services/queries"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { cn } from "@workspace/ui/lib/utils"

export function HomeBentoCollections() {
  const { data: categories, isLoading } = useRecentlyUpdatedCategoriesQuery()

  return (
    <div className="w-full">
      <div className="container mx-auto px-4 md:px-6 mb-8 text-center md:text-start">
        <h2 className="text-3xl md:text-5xl font-serif tracking-tight" dir="auto">The Collections</h2>
        <p className="text-muted-foreground mt-2 font-light max-w-md mx-auto md:mx-0" dir="auto">
          Curated edits for the modern wardrobe.
        </p>
      </div>

      <div className="container mx-auto px-4 md:px-6">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 md:grid-rows-2 gap-4 h-200 md:h-150">
            <Skeleton className="w-full h-full md:col-span-2 md:row-span-2 rounded-xl" />
            <Skeleton className="w-full h-full rounded-xl" />
            <Skeleton className="w-full h-full rounded-xl" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 md:grid-rows-2 gap-4 h-auto md:h-162.5">
            {categories?.slice(0, 3).map((category: any, idx: number) => (
              <Link 
                key={category.slug} 
                href={`/categories/${category.slug}`} 
                className={cn(
                  "group relative block overflow-hidden bg-secondary/10",
                  idx === 0 
                    ? "md:col-span-2 md:row-span-2 aspect-square md:aspect-auto" 
                    : "aspect-4/3 md:aspect-auto"
                )}
              >
                {(category.imageUrl || category.image) ? (
                  <OptimizedImage
                    asset={category.imageUrl || category.image}
                    fallbackUrl={typeof (category.imageUrl || category.image) === "string" ? (category.imageUrl || category.image) : undefined}
                    alt={category.name}
                    fill
                    className="object-cover transition-transform duration-[1.5s] group-hover:scale-105 ease-out"
                    sizes={idx === 0 ? "(max-width: 768px) 100vw, 66vw" : "(max-width: 768px) 100vw, 33vw"}
                  />
                ) : null}
                
                {/* Subtle gradient for text readability */}
                <div className="absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-transparent opacity-60" />

                <div className={cn(
                  "absolute flex flex-col",
                  idx === 0 ? "bottom-8 left-8 md:bottom-12 md:left-12" : "bottom-6 left-6"
                )}>
                  <h3 className={cn(
                    "text-white font-serif tracking-wider",
                    idx === 0 ? "text-3xl md:text-5xl" : "text-2xl"
                  )} dir="auto">
                    {category.name}
                  </h3>
                  <span className="text-white/80 text-xs uppercase tracking-[0.2em] font-semibold mt-3 group-hover:text-white transition-colors" dir="auto">
                    Shop Collection
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
