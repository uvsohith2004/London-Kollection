"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useFlashSaleQuery } from "../../services/queries"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { useDevice } from "@/hooks/use-media-query"
import { PremiumProductCard } from "../product-card/premium-product-card"
import { PremiumMobileProductCard } from "../product-card/premium-mobile-product-card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@workspace/ui/components/carousel"
import { Product } from "@/types/types"

export function HomeFlashSale() {
  const { data, isLoading } = useFlashSaleQuery()
  const products = data?.items || []
  const sale = data?.sale
  const { isMobile } = useDevice()

  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
  })

  useEffect(() => {
    if (!sale?.scheduleEnd) return;

    const calculateTimeLeft = () => {
      const difference = new Date(sale.scheduleEnd).getTime() - new Date().getTime();
      if (difference > 0) {
        setTimeLeft({
          hours: Math.floor((difference / (1000 * 60 * 60))),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [sale?.scheduleEnd])

  const formatTime = (val: number) => val.toString().padStart(2, "0")

  if (!isLoading && (!products || products.length === 0)) {
    return null; // Don't show flash sale if no products or not active
  }

  return (
    <div className="w-full bg-secondary/5 py-12 md:py-16">
      <div className="container mx-auto mb-8 flex flex-col justify-between gap-4 px-4 md:flex-row md:items-end md:px-6">
        <div>
          <h2
            className="font-serif text-3xl tracking-tight text-destructive md:text-5xl"
            dir="auto"
          >
            The Flash Edit
          </h2>
          <p
            className="mt-2 max-w-md text-sm font-light text-muted-foreground md:text-base"
            dir="auto"
          >
            Exceptional pieces at exceptional prices. Very limited quantities.
          </p>
        </div>

        <div className="flex items-center gap-3 font-serif text-lg">
          <div className="flex flex-col items-center">
            <span className="rounded-md border border-border/50 bg-background px-3 py-2 shadow-sm">
              {formatTime(timeLeft.hours)}
            </span>
            <span className="mt-1 text-[10px] tracking-widest text-muted-foreground uppercase">
              Hrs
            </span>
          </div>
          <span className="pb-4 text-muted-foreground">:</span>
          <div className="flex flex-col items-center">
            <span className="rounded-md border border-border/50 bg-background px-3 py-2 shadow-sm">
              {formatTime(timeLeft.minutes)}
            </span>
            <span className="mt-1 text-[10px] tracking-widest text-muted-foreground uppercase">
              Min
            </span>
          </div>
          <span className="pb-4 text-muted-foreground">:</span>
          <div className="flex flex-col items-center">
            <span className="rounded-md border border-border/50 bg-background px-3 py-2 text-destructive shadow-sm">
              {formatTime(timeLeft.seconds)}
            </span>
            <span className="mt-1 text-[10px] tracking-widest text-muted-foreground uppercase">
              Sec
            </span>
          </div>
        </div>
      </div>

      <div className="w-full">
        {isLoading ? (
          <div className="container mx-auto flex gap-4 overflow-hidden px-4 pb-8 md:gap-6 md:px-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="w-[85vw] shrink-0 sm:w-[45vw] md:w-[33vw] lg:w-[25vw]"
              >
                <Skeleton className="aspect-3/4 w-full" />
                <Skeleton className="mt-4 h-5 w-3/4" />
                <Skeleton className="mt-2 h-4 w-1/4" />
              </div>
            ))}
          </div>
        ) : (
          <div dir="ltr" className="container mx-auto px-4 pb-8 md:px-6">
            <Carousel
              opts={{ align: "start", dragFree: true }}
              className="w-full"
            >
              <CarouselContent className="-ml-4 md:-ml-6">
                {products?.map((product:Product) => (
                  <CarouselItem
                    key={product.id}
                    className="basis-[85vw] pl-4 sm:basis-[45vw] md:basis-[33vw] md:pl-6 lg:basis-[25vw]"
                  >
                    {isMobile ? (
                      <PremiumMobileProductCard product={product} />
                    ) : (
                      <PremiumProductCard product={product} />
                    )}
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
          </div>
        )}
      </div>
    </div>
  )
}
