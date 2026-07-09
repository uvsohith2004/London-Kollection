"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts"
import { ArrowUpRight, ArrowDownRight } from "lucide-react"
import { cn } from "@workspace/ui/lib/utils"
import { useFormatCurrency } from "@/lib/format"
import type { RegionPerformance } from "../../../../types/overview-types"

export interface TerritorialPerformanceProps {
  data: RegionPerformance[]
  height?: number
  /** Shows a per-region growth badge column beside the chart — desktop-only real estate. */
  showGrowthList?: boolean
  className?: string
}

export function TerritorialPerformance({ data, height = 280, showGrowthList = false, className }: TerritorialPerformanceProps) {
  const formatCurrency = useFormatCurrency()
  return (
    <div className={cn("w-full", showGrowthList && "grid gap-6 lg:grid-cols-[1fr_220px]", className)}>
      <div className="w-full" style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 0, right: 0, left: 20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" opacity={0.5} />
            <XAxis type="number" hide />
            <YAxis
              dataKey="region"
              type="category"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "hsl(var(--foreground))", fontWeight: 500 }}
              width={140}
            />
            <RechartsTooltip
              cursor={{ fill: "hsl(var(--muted))", opacity: 0.4 }}
              contentStyle={{ backgroundColor: "hsl(var(--background))", borderRadius: "12px", border: "1px solid hsl(var(--border))", color: "hsl(var(--foreground))" }}
              itemStyle={{ color: "hsl(var(--foreground))", fontWeight: 600 }}
              formatter={(value: any) => [formatCurrency(Number(value)), "Volume"]}
            />
            <Bar dataKey="sales" fill="hsl(var(--foreground))" radius={[0, 6, 6, 0]} barSize={28} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {showGrowthList && (
        <div className="flex flex-col justify-center gap-3 border-l border-border/40 pl-6">
          {data.map((region) => {
            const isUp = region.growth >= 0
            return (
              <div key={region.region} className="flex items-center justify-between text-xs">
                <span className="truncate font-medium text-muted-foreground">{region.region}</span>
                <span className={cn("flex items-center font-bold", isUp ? "text-primary" : "text-destructive")}>
                  {isUp ? <ArrowUpRight className="mr-0.5 h-3 w-3" /> : <ArrowDownRight className="mr-0.5 h-3 w-3" />}
                  {Math.abs(region.growth)}%
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
