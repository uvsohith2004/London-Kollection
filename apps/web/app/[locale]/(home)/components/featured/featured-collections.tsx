"use client"

import Link from "next/link"
import { OptimizedImage } from "@/components/optimized-image"
import { MoveRight } from "lucide-react"
import { useFeaturedCollectionsQuery } from "../../services/queries"
import { Skeleton } from "@workspace/ui/components/skeleton"

export function HomeFeaturedCollections() {
  const { data: collections, isLoading } = useFeaturedCollectionsQuery()

  return (
    <div className="w-full">
      <div className="container mx-auto mb-8 px-4 text-center md:px-6 md:text-start">
        <h2
          className="font-serif text-3xl tracking-tight md:text-5xl"
          dir="auto"
        >
          Featured Collections
        </h2>
        <p
          className="mx-auto mt-2 max-w-md font-light text-muted-foreground md:mx-0"
          dir="auto"
        >
          Discover our meticulously crafted seasonal stories.
        </p>
      </div>

      <div className="container mx-auto px-4 md:px-6">
        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-8">
            <Skeleton className="aspect-4/5 w-full md:aspect-square" />
            <Skeleton className="aspect-4/5 w-full md:aspect-square" />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 md:gap-8">
            {collections?.map((collection: any, idx: number) => (
              <Link
                key={idx}
                href={`/collections/${collection.slug}`}
                className="group relative block aspect-4/5 overflow-hidden bg-secondary/10 md:aspect-square"
              >
                <OptimizedImage
                  asset={collection.image}
                  fallbackUrl={typeof collection.image === 'string' ? collection.image : undefined}
                  alt={collection.name}
                  fill
                  className="object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-black/20 transition-colors duration-500 group-hover:bg-black/30" />

                <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-12">
                  <div className="max-w-md translate-y-4 transform bg-background/90 p-6 backdrop-blur-md transition-transform duration-500 group-hover:translate-y-0 md:p-8">
                    <h3
                      className="mb-2 font-serif text-2xl text-foreground md:text-3xl"
                      dir="auto"
                    >
                      {collection.name}
                    </h3>
                    <p
                      className="mb-6 text-sm font-light text-muted-foreground md:text-base"
                      dir="auto"
                    >
                      {collection.description}
                    </p>
                    <span
                      className="flex items-center gap-2 text-xs font-semibold tracking-widest text-foreground uppercase transition-colors group-hover:text-muted-foreground"
                      dir="auto"
                    >
                      Explore{" "}
                      <MoveRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
