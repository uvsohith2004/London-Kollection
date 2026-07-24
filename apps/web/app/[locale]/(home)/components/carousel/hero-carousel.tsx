"use client"

import { useHeroCarouselQuery } from "../../services/queries"
import { ImageCarousel } from "@/components/carousel"
import { Skeleton } from "@workspace/ui/components/skeleton"

export function HomeCarousel() {
  const { data: heroes, isLoading } = useHeroCarouselQuery()

  if (isLoading) {
    return (
      <div className="w-full h-[60vh] md:h-[80vh] bg-secondary/20 flex items-center justify-center">
         <Skeleton className="w-full h-full" />
      </div>
    )
  }

  return <ImageCarousel images={heroes?.map((h: any) => ({ 
    id: h.id,
    title: h.title,
    subtitle: h.description,
    link: h.linkUrl,
    linkText: h.buttonText,
    mediaType: h.mediaType,
    asset: h.mediaType === "video" ? h.video : h.image, 
    imageUrl: h.mediaType === "video" 
      ? (h.video?.webm?.url || h.video?.mp4?.url) 
      : (typeof h.image === 'string' ? h.image : (h.image?.avif?.url || h.image?.url))
  })) || []} />
}
