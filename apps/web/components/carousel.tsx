"use client"

import { useCallback, useEffect, useState } from "react"
import { OptimizedImage, OptimizedImageAsset } from "./optimized-image"
import { useTheme } from "next-themes"
import { cn } from "@workspace/ui/lib/utils"
import AutoPlay from "embla-carousel-autoplay"
import { flushSync } from "react-dom"
import type { StaticImageData } from "next/image"

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
}

export function ImageCarousel({ images }: { images: HeroSlide[] }) {

  const [api, setApi] = useState<CarouselApi>()
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([])
  const [isDesktop, setIsDesktop] = useState(true)
  const [parallaxValues, setParallaxValues] = useState<number[]>([])

  const scrollTo = useCallback((index: number) => api && api.scrollTo(index), [api])

  const onSelect = useCallback(() => {
    if (!api) return
    setSelectedIndex(api.selectedScrollSnap())
  }, [api])

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
                <OptimizedImage
                  asset={image.asset || image.imageUrl}
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
                "w-2 h-2 rounded-full transition-all duration-300 ease-in-out border border-slate-400",
                selectedIndex === index ? "bg-primary w-4" : "bg-primary/50 hover:bg-primary/75",
              )}
              onClick={() => scrollTo(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
