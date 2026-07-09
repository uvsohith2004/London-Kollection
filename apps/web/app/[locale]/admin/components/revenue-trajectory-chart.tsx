"use client"

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts"
import { cn } from "@workspace/ui/lib/utils"
import { useFormatCurrency, formatCompact } from "@/lib/format"
import type { RevenuePoint } from "../../../../types/overview-types"

export interface RevenueTrajectoryChartProps {
  data: RevenuePoint[]
  height?: number
  /** Hides axis chrome for the tighter mobile card. */
  compact?: boolean
  className?: string
}

export function RevenueTrajectoryChart({ data, height = 350, compact = false, className }: RevenueTrajectoryChartProps) {
  const formatCurrency = useFormatCurrency()
  return (
    <div className={cn("w-full", className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 0, left: compact ? -30 : -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--foreground))" stopOpacity={0.15} />
              <stop offset="95%" stopColor="hsl(var(--foreground))" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.5} />
          <XAxis
            dataKey="month"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: compact ? 10 : 11, fill: "hsl(var(--muted-foreground))", textAnchor: "middle" }}
            dy={15}
            interval={compact ? "preserveStartEnd" : 0}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
            tickFormatter={(val) => formatCompact(val)}
            width={compact ? 34 : undefined}
          />
          <RechartsTooltip
            contentStyle={{
              backgroundColor: "hsl(var(--background))",
              borderRadius: "16px",
              border: "1px solid hsl(var(--border))",
              color: "hsl(var(--foreground))",
              padding: "12px 16px",
              boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
            }}
            itemStyle={{ color: "hsl(var(--foreground))", fontSize: "14px", fontWeight: 600 }}
            labelStyle={{ color: "hsl(var(--muted-foreground))", fontSize: "12px", marginBottom: "4px" }}
            formatter={(value: any) => [formatCurrency(Number(value)), "Revenue"]}
          />
          <Area type="monotone" dataKey="target" stroke="hsl(var(--muted-foreground))" strokeDasharray="4 4" fill="none" strokeWidth={1.5} opacity={0.5} />
          <Area type="monotone" dataKey="revenue" stroke="hsl(var(--foreground))" fillOpacity={1} fill="url(#colorRev)" strokeWidth={2.5} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
