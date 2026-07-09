"use client"

import type { ElementType } from "react"
import { Eye, ShoppingCart, CreditCard, Heart, Search, XCircle, Star } from "lucide-react"
import { cn } from "@workspace/ui/lib/utils"
import { useFormatCurrency, formatRelativeTime } from "@/lib/format"
import type { AuditEvent, AuditEventType } from "@/types/overview-types"

export interface LiveActivityFeedProps {
  events: AuditEvent[]
  className?: string
  /** Caps how many rows render — desktop rail keeps more, mobile sheet keeps it short. */
  limit?: number
}

const TYPE_ICON: Record<AuditEventType, ElementType> = {
  view: Eye,
  add_to_cart: ShoppingCart,
  purchase: CreditCard,
  wishlist: Heart,
  search: Search,
  checkout_abandon: XCircle,
  review: Star,
}

function describeEvent(event: AuditEvent, formatCurrency: (val: number) => string): string {
  switch (event.type) {
    case "view":
      return `viewed ${event.productName ?? "a product"}`
    case "add_to_cart":
      return `added ${event.productName ?? "an item"} to cart`
    case "purchase":
      return `purchased ${event.productName ?? "an order"}${event.value ? ` — ${formatCurrency(event.value)}` : ""}`
    case "wishlist":
      return `saved ${event.productName ?? "an item"} to wishlist`
    case "search":
      return `searched "${event.query ?? ""}"`
    case "checkout_abandon":
      return `abandoned checkout${event.value ? ` — ${formatCurrency(event.value)}` : ""}`
    case "review":
      return `reviewed ${event.productName ?? "a product"}`
    default:
      return "interacted with the store"
  }
}

/**
 * Real-time audit trail of storefront behavior — what's being viewed, searched,
 * carted, and bought right now, so drops or spikes upstream can be traced to a cause.
 */
export function LiveActivityFeed({ events, className, limit }: LiveActivityFeedProps) {
  const visible = limit ? events.slice(0, limit) : events
  const formatCurrency = useFormatCurrency()

  return (
    <div className={cn("flex flex-col", className)}>
      <div className="flex items-center gap-2 pb-4">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
        </span>
        <span className="text-[10px] font-bold tracking-[0.2em] text-muted-foreground uppercase">Live</span>
      </div>

      <div className="flex flex-col divide-y divide-border/40">
        {visible.map((event) => {
          const Icon = TYPE_ICON[event.type] as React.ElementType as React.ElementType
          return (
            <div key={event.id} className="flex items-center gap-3 py-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted/40">
                <Icon className="h-4 w-4 text-foreground" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-foreground">
                  <span className="font-semibold">{event.customerLabel}</span>{" "}
                  <span className="text-muted-foreground">{describeEvent(event, formatCurrency)}</span>
                </p>
                {event.region && (
                  <p className="text-[11px] text-muted-foreground/70">{event.region}</p>
                )}
              </div>
              <span className="shrink-0 text-[11px] font-medium text-muted-foreground">
                {formatRelativeTime(event.timestamp)}
              </span>
            </div>
          )
        })}

        {visible.length === 0 && (
          <p className="py-8 text-center text-xs text-muted-foreground">No activity captured yet.</p>
        )}
      </div>
    </div>
  )
}
