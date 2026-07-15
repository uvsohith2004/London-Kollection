"use client"

import * as React from "react"
import { format } from "date-fns"
import { ChevronDown, ChevronUp, MapPin, Receipt, Clock } from "lucide-react"
import { cn } from "@workspace/ui/lib/utils"
import { Button } from "@workspace/ui/components/button"
import { OrderWorkflowActions } from "./order-workflow-actions"
import { useDataView } from "@/components/data-view"
import { formatAddressLine } from "@/lib/format-address"

interface ExpandableOrderCardProps {
  order: any
  onUpdateStatus: (orderId: string, status: string, type: 'order' | 'payment', reason?: string, paymentMethod?: string) => void
}

export function ExpandableOrderCard({ order, onUpdateStatus }: ExpandableOrderCardProps) {
  const [isExpanded, setIsExpanded] = React.useState(false)
  const { enableDetailsModal } = useDataView()
  
  const statusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "pending":
      case "awaiting payment": return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
      case "confirmed": return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
      case "processing":
      case "preparing":
      case "packed": return "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400"
      case "shipped":
      case "out for delivery": return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
      case "delivered":
      case "completed": return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
      case "cancelled":
      case "refunded": return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
      default: return "bg-muted text-muted-foreground"
    }
  }

  const paymentColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "paid": return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
      case "failed": return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
      default: return "bg-muted text-muted-foreground"
    }
  }

  return (
    <div className={cn(
      "flex flex-col overflow-hidden rounded-3xl border border-border/40 bg-card transition-all hover:border-border/80 hover:shadow-md",
      isExpanded && "border-border/80 shadow-md ring-1 ring-primary/10"
    )}>
      {/* Header/Summary (The List Card Part) */}
      <div 
        className={cn("p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 cursor-pointer", isExpanded ? "bg-muted/10" : "")}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex flex-col gap-1 w-full sm:w-auto">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-bold text-foreground">{order.orderNumber}</h3>
            <span className={cn("px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider", statusColor(order.status))}>
              {order.status}
            </span>
            <span className={cn("px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider", paymentColor(order.paymentStatus))}>
              {order.paymentStatus || 'Payment Pending'}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            {format(new Date(order.createdAt), "MMM dd, yyyy h:mm a")} • {order.items?.length || 0} items
          </p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm font-medium">{order.shippingAddress?.phone || "No Phone"}</span>
            <span className="text-muted-foreground">•</span>
            <span className="text-sm font-medium">{order.shippingAddress?.email || "No Email"}</span>
          </div>
        </div>

        <div className="flex flex-col sm:items-end gap-2 sm:gap-4 w-full sm:w-auto">
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">Total Amount</p>
              <p className="font-mono text-xl font-bold">{Number(order.totalAmount).toFixed(3)} KWD</p>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 rounded-full bg-background/50 backdrop-blur hover:bg-background/80"
              onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}
            >
              {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Expanded Accordion Details */}
      {isExpanded && (
        <div className="border-t border-border/40 p-5 bg-card/50 flex flex-col gap-8">
          
          {/* Action Bar */}
          <div className="flex items-center justify-between border-b border-border/40 pb-4">
            <h4 className="text-sm font-semibold tracking-wider text-muted-foreground uppercase">Workflow Actions</h4>
            <OrderWorkflowActions order={order} onUpdateStatus={onUpdateStatus} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Items */}
            <div className="lg:col-span-2 space-y-4">
              <h4 className="text-sm font-semibold tracking-wider text-muted-foreground uppercase flex items-center gap-2">
                <Receipt className="h-4 w-4" /> Order Items
              </h4>
              <div className="rounded-2xl border border-border/40 bg-background overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted/30 text-muted-foreground text-xs uppercase tracking-wider text-left border-b border-border/40">
                    <tr>
                      <th className="p-3 font-medium">Product</th>
                      <th className="p-3 font-medium">Price</th>
                      <th className="p-3 font-medium">Qty</th>
                      <th className="p-3 font-medium text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items?.map((item: any) => (
                      <tr key={item.id} className="border-b border-border/10 last:border-0 hover:bg-muted/10">
                        <td className="p-3">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-muted/30 overflow-hidden shrink-0">
                              {item.product?.images?.[0] ? (
                                <img src={item.product.images[0].url || item.product.images[0].asset?.webp?.url} className="h-full w-full object-cover" alt="" />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center text-[8px] text-muted-foreground">No Img</div>
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-foreground">{item.product?.title || 'Unknown Product'}</p>
                              {item.variantId && <p className="text-xs text-muted-foreground">Variant: {item.variantId}</p>}
                            </div>
                          </div>
                        </td>
                        <td className="p-3 font-mono">{Number(item.priceAtPurchase).toFixed(3)}</td>
                        <td className="p-3">{item.quantity}</td>
                        <td className="p-3 text-right font-mono font-medium">{(Number(item.priceAtPurchase) * item.quantity).toFixed(3)} KWD</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right Column: Details */}
            <div className="space-y-6">
              <div className="space-y-3">
                <h4 className="text-sm font-semibold tracking-wider text-muted-foreground uppercase flex items-center gap-2">
                  <MapPin className="h-4 w-4" /> Shipping & Billing
                </h4>
                <div className="rounded-2xl border border-border/40 bg-background p-4 space-y-4">
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wider">Address</p>
                    <p className="text-sm font-medium">{formatAddressLine(order.shippingAddress?.addressLine1)}</p>
                    {order.shippingAddress?.addressLine2 && <p className="text-sm">{order.shippingAddress?.addressLine2}</p>}
                    <p className="text-sm">{[order.shippingAddress?.city, order.shippingAddress?.state, order.shippingAddress?.postalCode].filter(Boolean).join(', ')}</p>
                    <p className="text-sm">{order.shippingAddress?.country}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wider">Contact</p>
                    <p className="text-sm">{order.shippingAddress?.phone}</p>
                    <p className="text-sm">{order.shippingAddress?.email}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wider">Payment Method</p>
                    <p className="text-sm font-medium uppercase">{order.paymentMethod?.replace(/_/g, ' ') || 'N/A'}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-semibold tracking-wider text-muted-foreground uppercase flex items-center gap-2">
                  <Clock className="h-4 w-4" /> Timeline
                </h4>
                <div className="rounded-2xl border border-border/40 bg-background p-4 h-48 overflow-y-auto space-y-4">
                  {order.timeline?.length > 0 ? (
                    order.timeline.map((entry: any) => (
                      <div key={entry.id} className="relative pl-4 border-l-2 border-border/40 last:border-l-0">
                        <div className="absolute w-2 h-2 bg-primary rounded-full -left-[5px] top-1.5" />
                        <p className="text-sm font-medium">{entry.status}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{entry.description}</p>
                        <p className="text-[10px] text-muted-foreground/60 mt-1">{format(new Date(entry.createdAt), "MMM dd, h:mm a")} by {entry.createdBy}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No timeline events.</p>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  )
}
