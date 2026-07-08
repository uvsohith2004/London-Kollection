"use client"

import * as React from "react"
import { ArrowUpRight, ArrowDownRight } from "lucide-react"
import { cn } from "@workspace/ui/lib/utils"

export interface MetricCardProps {
  title: string
  value: string
  trend: number
  icon: React.ElementType
  /** Flip good/bad coloring — used for metrics where "up" is actually bad, e.g. return rate. */
  invertTrendColors?: boolean
  onClick?: () => void
  /**
   * "app" -> tighter, touch-sized, built for horizontal swipe rails on mobile.
   * "panel" -> original dense desktop treatment.
   */
  size?: "app" | "panel"
  className?: string
}

/**
 * A single KPI tile. Shared by both the desktop and mobile overview pages —
 * only spacing/sizing changes between them, never color or type.
 */
export function MetricCard({
  title,
  value,
  trend,
  icon: Icon,
  invertTrendColors = false,
  onClick,
  size = "panel",
  className,
}: MetricCardProps) {
  const isPositive = trend >= 0
  const isGood = invertTrendColors ? !isPositive : isPositive
  const isApp = size === "app"

  return (
    <div
      onClick={onClick}
      role={onClick ? "button" : undefined}
      className={cn(
        "group relative cursor-pointer overflow-hidden rounded-3xl border border-border/40 bg-card shadow-sm transition-all duration-300 hover:bg-foreground hover:shadow-xl active:scale-[0.98]",
        isApp ? "w-[210px] shrink-0 snap-start p-5" : "p-6 hover:scale-[1.02] sm:p-8",
        className
      )}
    >
      <div className="flex items-center justify-between transition-colors duration-300 group-hover:text-background">
        <span className={cn(
          "font-bold tracking-widest text-muted-foreground uppercase group-hover:text-background/70",
          isApp ? "text-[10px]" : "text-xs"
        )}>
          {title}
        </span>
        <div className={cn(
          "flex items-center justify-center rounded-xl bg-muted/40 text-foreground transition-colors duration-300 group-hover:bg-background/20 group-hover:text-background",
          isApp ? "h-8 w-8" : "h-10 w-10"
        )}>
          <Icon className={isApp ? "h-3.5 w-3.5" : "h-4 w-4"} />
        </div>
      </div>

      <div className={cn("flex items-baseline gap-4", isApp ? "mt-5" : "mt-8")}>
        <h3 className={cn(
          "font-light tracking-tight text-foreground transition-colors duration-300 group-hover:text-background",
          isApp ? "text-2xl" : "text-4xl"
        )}>
          {value}
        </h3>
      </div>

      <div className={cn("flex items-center gap-2", isApp ? "mt-3" : "mt-4")}>
        <span className={cn(
          "flex items-center rounded-full px-2.5 py-1 font-bold tracking-wider uppercase transition-colors duration-300",
          isApp ? "text-[9px]" : "text-[10px]",
          isGood
            ? "bg-primary/10 text-primary group-hover:bg-background/20 group-hover:text-background"
            : "bg-destructive/10 text-destructive group-hover:bg-background/20 group-hover:text-background"
        )}>
          {isPositive ? <ArrowUpRight className="mr-1 h-3 w-3" /> : <ArrowDownRight className="mr-1 h-3 w-3" />}
          {Math.abs(trend)}%
        </span>
        {!isApp && (
          <span className="text-xs font-medium text-muted-foreground group-hover:text-background/50">
            vs prior period
          </span>
        )}
      </div>
    </div>
  )
}
