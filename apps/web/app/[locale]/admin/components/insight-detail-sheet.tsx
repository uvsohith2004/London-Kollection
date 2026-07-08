"use client"

import { ArrowUpRight, ArrowDownRight, CircleAlert } from "lucide-react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@workspace/ui/components/sheet"
import { cn } from "@workspace/ui/lib/utils"
import { formatRelativeTime } from "@/lib/format"
import type { ProductInsight } from "../../../../types/overview-types"

export interface InsightDetailSheetProps {
  insight: ProductInsight | null
  onOpenChange: (open: boolean) => void
  side?: "right" | "bottom"
  className?: string
}

/** Drill-down for a single flagged product — the full list of contributing signals. */
export function InsightDetailSheet({ insight, onOpenChange, side = "right", className }: InsightDetailSheetProps) {
  return (
    <Sheet open={!!insight} onOpenChange={onOpenChange}>
      <SheetContent
        side={side}
        className={cn(
          "border-border/40 bg-background p-0 shadow-2xl",
          side === "right" ? "w-full sm:max-w-md sm:rounded-l-[2rem]" : "max-h-[85vh] rounded-t-[2rem]",
          className
        )}
      >
        {insight && (
          <div className="flex h-full flex-col">
            <SheetHeader className="border-b border-border/40 p-8">
              <SheetTitle className="font-heading text-2xl font-light tracking-tight text-foreground">
                {insight.productName}
              </SheetTitle>
              <SheetDescription className="text-xs font-medium tracking-widest uppercase">
                {insight.category} · {insight.sku}
              </SheetDescription>
            </SheetHeader>

            <div className="flex-1 overflow-y-auto p-8">
              <div className="flex items-center justify-between rounded-2xl border border-border/40 bg-card p-5">
                <div>
                  <p className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">Current vs prior</p>
                  <p className="mt-1 text-2xl font-light text-foreground">
                    {insight.currentValue} <span className="text-sm text-muted-foreground">/ {insight.previousValue}</span>
                  </p>
                </div>
                <span className={cn(
                  "flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-bold",
                  insight.direction === "up" ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"
                )}>
                  {insight.direction === "up" ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
                  {Math.abs(insight.changePercent)}%
                </span>
              </div>

              <p className="mt-6 mb-3 text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
                Contributing signals
              </p>
              <div className="space-y-2">
                {insight.signals.map((signal: any, i: number) => (
                  <div key={i} className="flex items-start gap-3 rounded-xl border border-border/40 bg-card p-4">
                    <CircleAlert className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                    <p className="text-sm text-foreground">{signal}</p>
                  </div>
                ))}
              </div>

              <p className="mt-6 text-[11px] text-muted-foreground">
                Detected {formatRelativeTime(insight.detectedAt)}
              </p>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
