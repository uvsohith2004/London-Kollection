"use client"

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@workspace/ui/components/sheet"
import { Button } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"
import { formatCurrency } from "@/lib/format"
import type { DashboardDetailKey, DashboardOverviewResponse } from "@/types/overview-types"

export interface DetailSheetProps {
  activeDetail: DashboardDetailKey | null
  onOpenChange: (open: boolean) => void
  data: DashboardOverviewResponse
  onExportPdf: () => void
  isExporting?: boolean
  /** "right" reads as a desktop inspector panel, "bottom" reads as a native mobile sheet. */
  side?: "right" | "bottom"
  className?: string
}

const TITLES: Record<DashboardDetailKey, string> = {
  volume: "Gross Volume Metrics",
  aov: "Order Value Analysis",
  returning: "Returning Customer Analysis",
  returns: "Return Rate Breakdown",
}

const IS_CURRENCY: Record<DashboardDetailKey, boolean> = {
  volume: true,
  aov: true,
  returning: false,
  returns: false,
}

export function DetailSheet({ activeDetail, onOpenChange, data, onExportPdf, isExporting, side = "right", className }: DetailSheetProps) {
  const history = activeDetail
    ? activeDetail === "volume"
      ? data.grossVolume.history
      : activeDetail === "aov"
      ? data.aov.history
      : activeDetail === "returning"
      ? data.returningCustomerRate.history
      : data.returnRate.history
    : []

  const isCurrency = activeDetail ? IS_CURRENCY[activeDetail] : false

  return (
    <Sheet open={!!activeDetail} onOpenChange={onOpenChange}>
      <SheetContent
        side={side}
        className={cn(
          "border-border/40 bg-background p-0 shadow-2xl",
          side === "right" ? "w-full sm:max-w-md sm:rounded-l-[2rem]" : "max-h-[85vh] rounded-t-[2rem]",
          className
        )}
      >
        <div className="flex h-full flex-col">
          <SheetHeader className="border-b border-border/40 p-8">
            <SheetTitle className="font-heading text-2xl font-light tracking-tight text-foreground">
              {activeDetail ? TITLES[activeDetail] : ""}
            </SheetTitle>
            <SheetDescription className="text-xs font-medium tracking-widest uppercase">
              Trailing 7-Period Historical Log
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto p-8">
            {activeDetail && (
              <div className="overflow-hidden rounded-2xl border border-border/40 bg-card">
                <div className="grid grid-cols-3 bg-muted/40 p-4 text-[10px] font-bold tracking-[0.2em] text-muted-foreground uppercase">
                  <div>Period</div>
                  <div className="text-right">Current</div>
                  <div className="text-right">Previous</div>
                </div>
                <div className="divide-y divide-border/40">
                  {history.map((row, i) => (
                    <div key={i} className="grid grid-cols-3 p-4 text-sm transition-colors hover:bg-muted/20">
                      <div className="font-medium text-muted-foreground">{row.date}</div>
                      <div className="text-right font-medium text-foreground">
                        {isCurrency ? formatCurrency(row.value) : `${row.value.toFixed(1)}%`}
                      </div>
                      <div className="text-right text-muted-foreground">
                        {isCurrency ? formatCurrency(row.previousValue) : `${row.previousValue.toFixed(1)}%`}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-border/40 p-8">
            <Button className="h-14 w-full rounded-full text-xs font-bold tracking-widest uppercase" disabled={isExporting} onClick={onExportPdf}>
              Generate Detailed PDF
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
