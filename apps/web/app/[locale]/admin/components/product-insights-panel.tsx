"use client"

import type { ElementType } from "react"
import {
  ArrowUpRight,
  ArrowDownRight,
  AlertTriangle,
  TrendingUp,
  CircleAlert,
} from "lucide-react"
import { cn } from "@workspace/ui/lib/utils"
import type {
  ProductInsight,
  InsightSeverity,
} from "../../../../types/overview-types"

export interface ProductInsightsPanelProps {
  insights: ProductInsight[]
  onSelect?: (insight: ProductInsight) => void
  /** "table" for dense desktop scanning, "cards" for a tappable mobile stack. */
  variant?: "table" | "cards"
  className?: string
}

const SEVERITY_STYLE: Record<InsightSeverity, string> = {
  critical: "bg-destructive/10 text-destructive",
  warning: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  positive: "bg-primary/10 text-primary",
}

const SEVERITY_ICON: Record<InsightSeverity, ElementType> = {
  critical: CircleAlert,
  warning: AlertTriangle,
  positive: TrendingUp,
}

const METRIC_LABEL: Record<ProductInsight["metric"], string> = {
  sales: "Sales",
  views: "Traffic",
  conversion: "Conversion",
  return_rate: "Returns",
  stock: "Stock",
}

/**
 * Surfaces the "why" behind performance shifts: which SKUs moved, how much,
 * and the contributing signals the analytics pipeline attached to each one.
 */
export function ProductInsightsPanel({
  insights,
  onSelect,
  variant = "cards",
  className,
}: ProductInsightsPanelProps) {
  if (variant === "table") {
    return (
      <div
        className={cn(
          "overflow-hidden rounded-2xl border border-border/40",
          className
        )}
      >
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-muted/40 text-left text-[10px] font-bold tracking-[0.15em] text-muted-foreground uppercase">
              <th className="px-4 py-3 font-bold">Product</th>
              <th className="px-4 py-3 font-bold">Signal</th>
              <th className="px-4 py-3 text-right font-bold">Change</th>
              <th className="px-4 py-3 font-bold">Likely cause</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {insights.map((insight) => {
              const Icon = SEVERITY_ICON[insight.severity]
              return (
                <tr
                  key={insight.id}
                  onClick={() => onSelect?.(insight)}
                  className={cn(
                    "transition-colors",
                    onSelect && "cursor-pointer hover:bg-muted/20"
                  )}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted/40">
                        <Icon
                          className={cn(
                            "h-4 w-4",
                            insight.severity === "critical"
                              ? "text-destructive"
                              : insight.severity === "warning"
                                ? "text-amber-600 dark:text-amber-400"
                                : "text-primary"
                          )}
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-medium text-foreground">
                          {insight.productName}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {insight.category} · {insight.sku}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wide uppercase",
                        SEVERITY_STYLE[insight.severity]
                      )}
                    >
                      {METRIC_LABEL[insight.metric]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span
                      className={cn(
                        "flex items-center justify-end gap-0.5 font-bold",
                        insight.direction === "up"
                          ? "text-primary"
                          : "text-destructive"
                      )}
                    >
                      {insight.direction === "up" ? (
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      ) : (
                        <ArrowDownRight className="h-3.5 w-3.5" />
                      )}
                      {Math.abs(insight.changePercent)}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {insight.signals[0]}
                    {insight.signals.length > 1 && (
                      <span className="ml-1 text-muted-foreground/70">
                        +{insight.signals.length - 1} more
                      </span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    )
  }

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {insights.map((insight) => {
        const Icon = SEVERITY_ICON[insight.severity]
        return (
          <div
            key={insight.id}
            onClick={() => onSelect?.(insight)}
            className={cn(
              "rounded-2xl border border-border/40 bg-card p-4 transition-colors",
              onSelect && "cursor-pointer active:bg-muted/30"
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted/40">
                  <Icon
                    className={cn(
                      "h-4 w-4",
                      insight.severity === "critical"
                        ? "text-destructive"
                        : insight.severity === "warning"
                          ? "text-amber-600 dark:text-amber-400"
                          : "text-primary"
                    )}
                  />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {insight.productName}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {insight.category} · {METRIC_LABEL[insight.metric]}
                  </p>
                </div>
              </div>
              <span
                className={cn(
                  "flex shrink-0 items-center gap-0.5 text-sm font-bold",
                  insight.direction === "up"
                    ? "text-primary"
                    : "text-destructive"
                )}
              >
                {insight.direction === "up" ? (
                  <ArrowUpRight className="h-3.5 w-3.5" />
                ) : (
                  <ArrowDownRight className="h-3.5 w-3.5" />
                )}
                {Math.abs(insight.changePercent)}%
              </span>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
              {insight.signals.slice(0, 2).join(" · ")}
            </p>
          </div>
        )
      })}
    </div>
  )
}
