"use client"

import * as React from "react"
import {
  Download,
  Loader2,
  TrendingUp,
  ShoppingBag,
  Repeat2,
  Undo2,
} from "lucide-react"

import { Button } from "@workspace/ui/components/button"

import { useDashboardQuery } from "../queries"
import { useExportReportMutation } from "../mutations"

import { MetricCard } from "./metric-card"
import { RevenueTrajectoryChart } from "./revenue-trajectory-chart"
import { DivisionSplitChart } from "./division-split-chart"
import { TerritorialPerformance } from "./territorial-performance"
import { ProductInsightsPanel } from "./product-insights-panel"
import { LiveActivityFeed } from "@/lib/live-activity-feed"
import { DetailSheet } from "./detail-sheet"
import { InsightDetailSheet } from "./insight-detail-sheet"
import { useFormatCurrency } from "@/lib/format"
import type {
  DashboardDetailKey,
  ProductInsight,
} from "../../../../types/overview-types"

/**
 * Desktop composition — dense, multi-pane, built to feel like a native analyst
 * workstation: persistent live-activity rail, a scannable insights table, hover
 * states everywhere. Pairs with OverviewPageMobile for the small-screen layout.
 */
export default function OverviewPageDesktop() {
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
      <div className="flex min-h-[80vh] flex-col items-center justify-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="text-xs font-medium tracking-[0.2em] text-muted-foreground uppercase">
          Compiling Telemetry...
        </span>
      </div>
    )
  }

  if (isError || !data) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center">
        <div className="rounded-3xl border border-destructive/20 bg-destructive/5 p-8 text-center text-destructive">
          Failed to synchronize regional data. Please verify your connection.
        </div>
      </div>
    )
  }

  const lastUpdated = new Date(data.lastUpdatedAt)

  return (
    <div className="mx-auto max-w-[1600px] space-y-10 pb-24 font-sans">
      {/* Toolbar */}
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <h2 className="font-heading text-4xl font-light tracking-tight text-foreground">
            Executive Registry
          </h2>
          <div className="flex items-center gap-3">
            <p className="text-sm font-medium tracking-widest text-muted-foreground uppercase">
              Commercial Performance — State of Kuwait
            </p>
            <span className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
              </span>
              Synced {lastUpdated.toLocaleTimeString()}
            </span>
          </div>
        </div>
        <div className="flex shrink-0 gap-3">
          <Button
            variant="outline"
            className="h-12 rounded-full border-border/60 bg-transparent px-8 text-xs font-bold tracking-[0.15em] uppercase hover:bg-foreground hover:text-background"
            disabled={isExporting}
            onClick={() => exportReport({ format: 'csv' } as any)}
          >
            {isExporting ? (
              <Loader2 className="mr-3 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-3 h-4 w-4" />
            )}
            Export Dossier
          </Button>
        </div>
      </div>

      {/* Main content + persistent live rail */}
      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          {/* KPI row */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              title="Gross Volume"
              value={formatCurrency(data.grossVolume.current)}
              trend={data.grossVolume.trend}
              icon={TrendingUp}
              onClick={() => setActiveDetail("volume")}
            />
            <MetricCard
              title="Average Order"
              value={formatCurrency(data.aov.current)}
              trend={data.aov.trend}
              icon={ShoppingBag}
              onClick={() => setActiveDetail("aov")}
            />
            <MetricCard
              title="Returning Customers"
              value={`${data.returningCustomerRate.current}%`}
              trend={data.returningCustomerRate.trend}
              icon={Repeat2}
              onClick={() => setActiveDetail("returning")}
            />
            <MetricCard
              title="Return Rate"
              value={`${data.returnRate.current}%`}
              trend={data.returnRate.trend}
              icon={Undo2}
              onClick={() => setActiveDetail("returns")}
              invertTrendColors
            />
          </div>

          {/* Revenue + division split */}
          <div className="grid gap-6 lg:grid-cols-7">
            <div className="flex flex-col overflow-hidden rounded-3xl border border-border/40 bg-card p-6 shadow-sm sm:p-8 lg:col-span-5">
              <div className="mb-8 flex items-center justify-between border-b border-border/40 pb-4">
                <h3 className="text-sm font-bold tracking-widest text-foreground uppercase">
                  Revenue Trajectory
                </h3>
                <span className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                  FY 2026
                </span>
              </div>
              <RevenueTrajectoryChart data={data.revenueChart} />
            </div>

            <div className="flex flex-col overflow-hidden rounded-3xl border border-border/40 bg-card p-6 shadow-sm sm:p-8 lg:col-span-2">
              <h3 className="mb-8 border-b border-border/40 pb-4 text-sm font-bold tracking-widest text-foreground uppercase">
                Division Split
              </h3>
              <DivisionSplitChart data={data.categorySplit} />
            </div>
          </div>

          {/* Territorial performance */}
          <div className="overflow-hidden rounded-3xl border border-border/40 bg-card p-6 shadow-sm sm:p-8">
            <h3 className="mb-8 border-b border-border/40 pb-4 text-sm font-bold tracking-widest text-foreground uppercase">
              Territorial Performance
            </h3>
            <TerritorialPerformance data={data.topRegions} showGrowthList />
          </div>

          {/* Product insights — "which product is down, and why" */}
          <div className="overflow-hidden rounded-3xl border border-border/40 bg-card p-6 shadow-sm sm:p-8">
            <div className="mb-6 flex items-center justify-between border-b border-border/40 pb-4">
              <h3 className="text-sm font-bold tracking-widest text-foreground uppercase">
                Product Signals
              </h3>
              <span className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                {data.productInsights.length} flagged
              </span>
            </div>
            <ProductInsightsPanel
              insights={data.productInsights}
              variant="table"
              onSelect={setSelectedInsight}
            />
          </div>
        </div>

        {/* Persistent live activity rail */}
        <aside className="sticky top-6 h-fit overflow-hidden rounded-3xl border border-border/40 bg-card p-6 shadow-sm">
          <h3 className="mb-2 text-sm font-bold tracking-widest text-foreground uppercase">
            Live Activity
          </h3>
          <LiveActivityFeed events={data.liveActivity} limit={12} />
        </aside>
      </div>

      <DetailSheet
        activeDetail={activeDetail}
        onOpenChange={(open) => !open && setActiveDetail(null)}
        data={data}
        onExportPdf={() =>
          exportReport({ format: "pdf", detailKey: activeDetail ?? undefined } as any)
        }
        isExporting={isExporting}
        side="right"
      />

      <InsightDetailSheet
        insight={selectedInsight}
        onOpenChange={(open) => !open && setSelectedInsight(null)}
        side="right"
      />
    </div>
  )
}
