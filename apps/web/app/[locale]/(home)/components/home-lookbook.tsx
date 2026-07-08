"use client"

import { OptimizedImage } from "@/components/optimized-image"
import Link from "next/link"
import { useLookbookQuery } from "../services/queries"
import { Skeleton } from "@workspace/ui/components/skeleton"

export function HomeLookbook() {
  const { data: lookbook, isLoading } = useLookbookQuery()

  if (isLoading) {
    return (
      <div className="w-full bg-secondary/5 py-12 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <Skeleton className="w-full h-[60vh]" />
        </div>
      </div>
    )
  }

  if (!lookbook) return null;

  return (
    <div className="w-full bg-secondary/5 py-12 md:py-24">
      <div className="container mx-auto px-4 md:px-6">
        
        <div className="flex flex-col md:flex-row items-center gap-12 md:gap-24">
          
          {/* Image Side */}
          <div className="w-full md:w-1/2 relative aspect-3/4 md:aspect-4/5 bg-secondary/20 overflow-hidden">
            <OptimizedImage
              asset={lookbook.imageUrl}
              fallbackUrl={typeof lookbook.imageUrl === 'string' ? lookbook.imageUrl : undefined}
              alt={lookbook.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>

          {/* Typography Side */}
          <div className="w-full md:w-1/2 flex flex-col justify-center">
            <h2 className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-6 font-semibold" dir="auto">{lookbook.subtitle}</h2>
            <h3 className="text-4xl md:text-5xl lg:text-7xl font-serif leading-[1.1] mb-8 text-foreground" dir="auto">
              {lookbook.title.split(' ').map((word: string, i: number) => (
                <span key={i}>{word}<br /></span>
              ))}
            </h3>
            
            <p className="text-muted-foreground leading-relaxed font-light mb-10 max-w-md text-base md:text-lg" dir="auto">
              {lookbook.description}
            </p>
            
            <div className="pt-8 border-t border-border w-full max-w-md">
              <Link href={lookbook.link} className="text-sm font-semibold uppercase tracking-widest hover:text-muted-foreground transition-colors inline-block border-b border-foreground pb-1">
                {lookbook.linkText}
              </Link>
            </div>
          </div>

        </div>

      </div>
    </div>
  )
}
