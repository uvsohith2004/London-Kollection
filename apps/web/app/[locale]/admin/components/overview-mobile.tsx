"use client"

import * as React from "react"
import {
  Download,
  Loader2,
  TrendingUp,
  ShoppingBag,
  Repeat2,
  Undo2,
  Radio,
} from "lucide-react"

import { Button } from "@workspace/ui/components/button"

import { useDashboardQuery } from "../queries"
import { useExportReportMutation } from "../mutations"

import { MetricCard } from "./metric-card"
import { RevenueTrajectoryChart } from "./revenue-trajectory-chart"
import { DivisionSplitChart } from "./division-split-chart"
import { TerritorialPerformance } from "./territorial-performance"
import { ProductInsightsPanel } from "./product-insights-panel"
import { LiveActivityFeed } from "./live-activity-feed"
import { DetailSheet } from "./detail-sheet"
import { InsightDetailSheet } from "./insight-detail-sheet"
import { useFormatCurrency } from "@/lib/format"
import type {
  DashboardDetailKey,
  ProductInsight,
} from "../../../../types/overview-types"

/**
 * Mobile composition — a stacked, swipeable, thumb-driven layout built to feel
 * like a native iOS/Android app: sticky compact app bar, horizontal snap rail
 * for KPIs, and bottom sheets instead of side panels for every drill-down.
 */
export default function OverviewPageMobile() {
  const formatCurrency = useFormatCurrency()
  const { data, isLoading, isError } = useDashboardQuery()
  const { mutate: exportReport, isPending: isExporting } =
    useExportReportMutation()

  const [activeDetail, setActiveDetail] =
    React.useState<DashboardDetailKey | null>(null)
  const [selectedInsight, setSelectedInsight] =
    React.useState<ProductInsight | null>(null)

  if (isLoading) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center space-y-4">
        <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
        <span className="text-[11px] font-medium tracking-[0.2em] text-muted-foreground uppercase">
          Compiling Telemetry...
        </span>
      </div>
    )
  }

  if (isError || !data) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-4">
        <div className="rounded-3xl border border-destructive/20 bg-destructive/5 p-6 text-center text-sm text-destructive">
          Failed to synchronize regional data. Pull down to retry.
        </div>
      </div>
    )
  }

  const lastUpdated = new Date(data.lastUpdatedAt)

  return (
    <div className="relative mx-auto max-w-md pb-28 font-sans">
      {/* Sticky compact app bar */}
      <div className="sticky top-0 z-10 -mx-4 mb-6 border-b border-border/40 bg-background/90 px-4 pt-5 pb-4 backdrop-blur-md">
        <p className="text-[10px] font-semibold tracking-[0.2em] text-muted-foreground uppercase">
          Kuwait · Executive Registry
        </p>
        <div className="mt-1 flex items-center justify-between">
          <h2 className="font-heading text-2xl font-light tracking-tight text-foreground">
            Overview
          </h2>
          <span className="flex items-center gap-1 text-[10px] font-medium text-muted-foreground">
            <Radio className="h-3 w-3 text-primary" />
            {lastUpdated.toLocaleTimeString()}
          </span>
        </div>
      </div>

      <div className="space-y-8 px-4">
        {/* Swipeable KPI rail */}
        <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <MetricCard
            title="Gross Volume"
            value={formatCurrency(data.grossVolume.current)}
            trend={data.grossVolume.trend}
            icon={TrendingUp}
            onClick={() => setActiveDetail("volume")}
            size="app"
          />
          <MetricCard
            title="Average Order"
            value={formatCurrency(data.aov.current)}
            trend={data.aov.trend}
            icon={ShoppingBag}
            onClick={() => setActiveDetail("aov")}
            size="app"
          />
          <MetricCard
            title="Returning"
            value={`${data.returningCustomerRate.current}%`}
            trend={data.returningCustomerRate.trend}
            icon={Repeat2}
            onClick={() => setActiveDetail("returning")}
            size="app"
          />
          <MetricCard
            title="Return Rate"
            value={`${data.returnRate.current}%`}
            trend={data.returnRate.trend}
            icon={Undo2}
            onClick={() => setActiveDetail("returns")}
            size="app"
            invertTrendColors
          />
        </div>

        {/* Revenue */}
        <div className="overflow-hidden rounded-3xl border border-border/40 bg-card p-5 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="text-xs font-bold tracking-widest text-foreground uppercase">
              Revenue
            </h3>
            <span className="text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">
              FY 2026
            </span>
          </div>
          <RevenueTrajectoryChart
            data={data.revenueChart}
            height={220}
            compact
          />
        </div>

        {/* Division split */}
        <div className="overflow-hidden rounded-3xl border border-border/40 bg-card p-5 shadow-sm">
          <h3 className="mb-5 text-xs font-bold tracking-widest text-foreground uppercase">
            Division Split
          </h3>
          <DivisionSplitChart data={data.categorySplit} height={190} />
        </div>

        {/* Territorial performance */}
        <div className="overflow-hidden rounded-3xl border border-border/40 bg-card p-5 shadow-sm">
          <h3 className="mb-5 text-xs font-bold tracking-widest text-foreground uppercase">
            Top Regions
          </h3>
          <TerritorialPerformance data={data.topRegions} height={220} />
        </div>

        {/* Product insights */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-xs font-bold tracking-widest text-foreground uppercase">
              Needs Attention
            </h3>
            <span className="text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">
              {data.productInsights.length} flagged
            </span>
          </div>
          <ProductInsightsPanel
            insights={data.productInsights}
            variant="cards"
            onSelect={setSelectedInsight}
          />
        </div>

        {/* Live activity */}
        <div className="overflow-hidden rounded-3xl border border-border/40 bg-card p-5 shadow-sm">
          <h3 className="mb-1 text-xs font-bold tracking-widest text-foreground uppercase">
            Live Activity
          </h3>
          <LiveActivityFeed events={data.liveActivity} limit={6} />
        </div>
      </div>

      {/* Floating export action */}
      <Button
        size="icon"
        disabled={isExporting}
        onClick={() => exportReport({ format: "csv" })}
        className="fixed right-6 bottom-6 h-14 w-14 rounded-full shadow-xl"
      >
        {isExporting ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <Download className="h-5 w-5" />
        )}
      </Button>

      <DetailSheet
        activeDetail={activeDetail}
        onOpenChange={(open) => !open && setActiveDetail(null)}
        data={data}
        onExportPdf={() =>
          exportReport({ format: "pdf", detailKey: activeDetail ?? undefined })
        }
        isExporting={isExporting}
        side="bottom"
      />

      <InsightDetailSheet
        insight={selectedInsight}
        onOpenChange={(open) => !open && setSelectedInsight(null)}
        side="bottom"
      />
    </div>
  )
}
