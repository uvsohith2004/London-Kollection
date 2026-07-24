"use client"

import { useCallback, useEffect, useState, useRef } from "react"
import { OptimizedImage, OptimizedImageAsset } from "./optimized-image"
import { useTheme } from "next-themes"
import { cn } from "@workspace/ui/lib/utils"
import AutoPlay from "embla-carousel-autoplay"
import { flushSync } from "react-dom"
import type { StaticImageData } from "next/image"
import { Play } from "lucide-react"

// Import the reusable carousel components
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@workspace/ui/components/carousel"

export interface HeroSlide {
  id: string
  imageUrl?: string
  asset?: OptimizedImageAsset | string | null
  title: string
  subtitle?: string
  link?: string
  linkText?: string
  mediaType?: "image" | "video"
}

export function ImageCarousel({ images }: { images: HeroSlide[] }) {

  const [api, setApi] = useState<CarouselApi>()
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([])
  const [isDesktop, setIsDesktop] = useState(true)
  const [parallaxValues, setParallaxValues] = useState<number[]>([])
  
  // Ref array for video elements
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([])

  const scrollTo = useCallback((index: number) => api && api.scrollTo(index), [api])

  const onSelect = useCallback(() => {
    if (!api) return
    const activeIndex = api.selectedScrollSnap()
    setSelectedIndex(activeIndex)

    const isVideo = images[activeIndex]?.mediaType === "video"
    const autoplay = api.plugins().autoplay as any

    if (isVideo) {
      autoplay?.stop()
    } else {
      autoplay?.reset()
      autoplay?.play()
    }

    // Play active video, pause others
    videoRefs.current.forEach((video, index) => {
      if (video) {
        if (index === activeIndex) {
          video.currentTime = 0
          video.play().catch(e => console.log("Autoplay prevented", e))
        } else {
          video.pause()
          video.currentTime = 0
        }
      }
    })
  }, [api, images])

  const onScroll = useCallback(() => {
    if (!api) return
    const scrollProgress = api.scrollProgress()
    const styles = api.scrollSnapList().map((scrollSnap: number) => {
      const diffToTarget = scrollSnap - scrollProgress
      const translateX = diffToTarget * -25
      return translateX
    })
    setParallaxValues(styles)
  }, [api])


  useEffect(() => {
    if (!api) return
    onSelect()
    setScrollSnaps(api.scrollSnapList())
    api.on("select", onSelect)
    api.on("reInit", onSelect)

    onScroll()
    api.on("scroll", () => {
      flushSync(() => onScroll())
    })
    api.on("reInit", onScroll)
  }, [api, onSelect, onScroll])


  useEffect(() => {
    const checkIsDesktop = () => {
      setIsDesktop(window.innerWidth >= 768) 
    }
    checkIsDesktop()
    window.addEventListener("resize", checkIsDesktop)
    return () => {
      window.removeEventListener("resize", checkIsDesktop)
    }
  }, [])

  return (
    <div className={cn("relative w-full overflow-hidden aspect-[16/9]")}>
      
      <Carousel
        setApi={setApi}
        opts={{ loop: true }}
        plugins={[AutoPlay({ delay: 5000, stopOnInteraction: false })]}
        className="h-full w-full"
      >
 
        <CarouselContent className="h-full ml-0">
          {images.map((image, index) => (
            <CarouselItem key={index} className="relative h-full pl-0 basis-full">
              <div className="relative h-full w-full overflow-hidden group">
                {image.mediaType === "video" ? (
                  <video
                    ref={(el) => {
                      if (el) videoRefs.current[index] = el
                    }}
                    className="w-full h-full object-cover bg-black select-none pointer-events-none"
                    style={{
                      transform: `translateX(${parallaxValues[index] || 0}px)`,
                      transition: "transform 0.3s ease-out",
                    }}
                    muted
                    playsInline
                    onEnded={() => api?.scrollNext()}
                    preload="metadata"
                    poster={(image.asset as any)?.thumbnail?.url}
                  >
                    {(image.asset as any)?.webm?.url && (
                      <source src={(image.asset as any).webm.url} type="video/webm" />
                    )}
                    {(image.asset as any)?.mp4?.url && (
                      <source src={(image.asset as any).mp4.url} type="video/mp4" />
                    )}
                    {image.imageUrl && (
                      <source src={image.imageUrl} type="video/mp4" />
                    )}
                  </video>
                ) : (
                  <OptimizedImage
                    asset={image.asset as any}
                    fallbackUrl={image.imageUrl}
                    alt={image.title || `Carousel image ${index + 1}`}
                    fill
                    priority={index < 2}
                    className="object-cover bg-black select-none"
                    sizes={isDesktop ? "100vw" : "(max-width: 768px) 100vw, 50vw"}
                    style={{
                      transform: `translateX(${parallaxValues[index] || 0}px)`,
                      transition: "transform 0.3s ease-out",
                    }}
                  />
                )}
                <div className="absolute inset-0 bg-black/30 pointer-events-none transition-opacity group-active:bg-black/40" />
                
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 z-20 pointer-events-none">
                  {image.title && (
                    <h2 className="text-3xl md:text-5xl lg:text-7xl font-bold text-white mb-4 drop-shadow-lg font-heading tracking-tight">
                      {image.title}
                    </h2>
                  )}
                  {image.subtitle && (
                    <p className="text-sm md:text-lg lg:text-xl text-white/90 max-w-2xl drop-shadow-md mb-8">
                      {image.subtitle}
                    </p>
                  )}
                  {(image.linkText || image.link) && (
                    <a
                      href={image.link || "#"}
                      className="pointer-events-auto bg-white text-black px-8 py-3 rounded-full font-semibold uppercase tracking-wider text-sm hover:bg-white/90 transition-transform hover:scale-105 active:scale-95 shadow-xl"
                    >
                      {image.linkText || "Shop Now"}
                    </a>
                  )}
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      {/* Gradient Bottom Overlay */}
      <div className="absolute h-32 bg-linear-to-t from-black opacity-75 w-full bottom-0 z-10 pointer-events-none" />

      {/* Custom Dots Navigation */}
      <div className="absolute bottom-4 left-0 right-0 z-20">
        <div className="flex items-center justify-center gap-2">
          {scrollSnaps.map((_, index) => (
            <button
              key={index}
              className={cn(
                "transition-all duration-300 ease-in-out border border-slate-400 flex items-center justify-center text-[10px]",
                images[index]?.mediaType === "video"
                  ? "w-6 h-6 rounded-full" 
                  : (selectedIndex === index ? "bg-primary w-4 h-2 rounded-full" : "bg-primary/50 hover:bg-primary/75 w-2 h-2 rounded-full")
              )}
              onClick={() => scrollTo(index)}
              aria-label={`Go to slide ${index + 1}`}
            >
              {images[index]?.mediaType === "video" && <Play className="w-3 h-3 text-primary-foreground fill-current" />}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
