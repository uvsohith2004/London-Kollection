"use client"

import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts"
import { cn } from "@workspace/ui/lib/utils"
import type { CategorySplitItem } from "../../../../types/overview-types"

export interface DivisionSplitChartProps {
  data: CategorySplitItem[]
  height?: number
  innerRadius?: number
  outerRadius?: number
  /** Renders the legend beneath the ring — turn off when the parent supplies its own legend layout. */
  showLegend?: boolean
  className?: string
}

const FILLS = [
  "hsl(var(--foreground))",
  "hsl(var(--muted-foreground))",
  "hsl(var(--border))",
  "hsl(var(--muted))",
]

const LEGEND_BG = ["bg-foreground", "bg-muted-foreground", "bg-border", "bg-muted"]

export function DivisionSplitChart({
  data,
  height = 220,
  innerRadius = 65,
  outerRadius = 95,
  showLegend = true,
  className,
}: DivisionSplitChartProps) {
  return (
    <div className={cn("w-full", className)}>
      <div className="relative w-full" style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              innerRadius={innerRadius}
              outerRadius={outerRadius}
              paddingAngle={4}
              dataKey="value"
              stroke="none"
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={FILLS[index % FILLS.length]} />
              ))}
            </Pie>
            <RechartsTooltip
              contentStyle={{
                backgroundColor: "hsl(var(--background))",
                borderRadius: "12px",
                border: "1px solid hsl(var(--border))",
                color: "hsl(var(--foreground))",
              }}
              itemStyle={{ color: "hsl(var(--foreground))", fontWeight: 500 }}
              formatter={(value: any) => [`${value}%`, "Share"]}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {showLegend && (
        <div className="mt-8 grid grid-cols-2 gap-y-4 gap-x-2">
          {data.map((cat, index) => (
            <div key={cat.name} className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <div className={cn("h-2.5 w-2.5 shrink-0 rounded-full", LEGEND_BG[index % LEGEND_BG.length])} />
              <span className="truncate">{cat.name}</span>
              <span className="ml-auto shrink-0 font-semibold text-foreground">{cat.value}%</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
