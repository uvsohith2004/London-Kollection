"use client"

import * as React from "react"
import { format } from "date-fns"
import { OrderWorkflowActions } from "../order-workflow-actions"
import { Dialog, DialogContent, DialogTrigger } from "@workspace/ui/components/dialog"

interface OrderListCardProps {
  order: any
  onUpdateStatus: (orderId: string, status: string, type: 'order' | 'payment', reason?: string, paymentMethod?: string) => void
}

export function OrderListCard({ order, onUpdateStatus }: OrderListCardProps) {
  const firstItem = order.items?.[0]
  const imageUrl = firstItem?.product?.images?.[0]?.url || firstItem?.product?.images?.[0]?.asset?.webp?.url

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
    <Dialog>
      <DialogTrigger render={
        <div className="group flex flex-col sm:flex-row items-center overflow-hidden rounded-3xl border border-border/40 bg-card transition-all hover:border-border/80 hover:shadow-md p-3 gap-6 cursor-pointer text-left">
          <div className="relative h-24 w-24 sm:h-32 sm:w-32 shrink-0 rounded-2xl bg-muted/30 overflow-hidden">
            {imageUrl ? (
              <img src={imageUrl} alt="Order item" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-[10px] text-muted-foreground uppercase tracking-widest text-center px-2">
                Order {order.orderNumber}
              </div>
            )}
            {order.items?.length > 1 && (
              <div className="absolute bottom-2 right-2 bg-background/80 backdrop-blur text-[10px] font-bold px-2 py-0.5 rounded-full border border-border/50">
                +{order.items.length - 1} items
              </div>
            )}
          </div>

          <div className="flex flex-1 flex-col py-2 w-full sm:w-auto">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-0">
              <div>
                <h3 className="font-medium text-lg text-foreground">{order.orderNumber}</h3>
                <p className="text-sm text-muted-foreground mt-1">{order.shippingAddress?.phone || "No Phone Number"}</p>
                <p className="text-xs text-muted-foreground">{format(new Date(order.createdAt), "MMM dd, yyyy h:mm a")}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusColor(order.status)}`}>
                  {order.status}
                </span>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${paymentColor(order.paymentStatus)}`}>
                  {order.paymentStatus || 'Payment Pending'}
                </span>
              </div>
            </div>

            <div className="mt-auto flex flex-col sm:flex-row sm:items-center justify-between pt-4 gap-4">
              <p className="font-mono font-medium text-foreground">{Number(order.totalAmount).toFixed(3)} KWD</p>
              
              <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                <OrderWorkflowActions order={order} onUpdateStatus={onUpdateStatus} />
              </div>
            </div>
          </div>
        </div>
      } />
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* We can reuse the expanded details view from ExpandableOrderCard here */}
        <div className="p-2 space-y-8">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">{order.orderNumber}</h2>
              <p className="text-muted-foreground text-sm">{format(new Date(order.createdAt), "MMMM dd, yyyy h:mm a")}</p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${statusColor(order.status)}`}>
                {order.status}
              </span>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${paymentColor(order.paymentStatus)}`}>
                {order.paymentStatus || 'Payment Pending'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h4 className="font-semibold text-sm tracking-wider uppercase text-muted-foreground border-b pb-2">Order Items</h4>
              <div className="space-y-4">
                {order.items?.map((item: any) => {
                  const img = item.product?.images?.[0]?.url || item.product?.images?.[0]?.asset?.webp?.url
                  return (
                    <div key={item.id} className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-lg bg-muted overflow-hidden shrink-0">
                        {img && <img src={img} className="h-full w-full object-cover" alt="" />}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{item.product?.title || 'Unknown Product'}</p>
                        <p className="text-xs text-muted-foreground">Qty: {item.quantity} × {Number(item.priceAtPurchase).toFixed(3)} KWD</p>
                      </div>
                      <div className="font-mono text-sm font-medium text-right">
                        {(Number(item.priceAtPurchase) * item.quantity).toFixed(3)} KWD
                      </div>
                    </div>
                  )
                })}
              </div>
              <div className="border-t pt-4 flex justify-between items-center font-bold">
                <span>Total Amount</span>
                <span className="font-mono text-lg">{Number(order.totalAmount).toFixed(3)} KWD</span>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <h4 className="font-semibold text-sm tracking-wider uppercase text-muted-foreground border-b pb-2">Customer & Shipping</h4>
                <div className="text-sm space-y-1">
                  <p className="font-medium">{order.shippingAddress?.phone || "No Phone Number"}</p>
                  <p className="text-muted-foreground">{order.shippingAddress?.name || "Guest Customer"}</p>
                  <p className="text-muted-foreground">{order.shippingAddress?.email}</p>
                  <div className="pt-2">
                    <p>{order.shippingAddress?.addressLine1}</p>
                    {order.shippingAddress?.addressLine2 && <p>{order.shippingAddress?.addressLine2}</p>}
                    <p>{[order.shippingAddress?.city, order.shippingAddress?.state, order.shippingAddress?.postalCode].filter(Boolean).join(', ')}</p>
                    <p>{order.shippingAddress?.country}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-sm tracking-wider uppercase text-muted-foreground border-b pb-2">Timeline</h4>
                <div className="text-sm space-y-3 h-32 overflow-y-auto">
                  {order.timeline?.length > 0 ? (
                    order.timeline.map((entry: any) => (
                      <div key={entry.id} className="relative pl-3 border-l-2 border-border/40">
                        <p className="font-medium text-xs">{entry.status}</p>
                        <p className="text-muted-foreground text-xs mt-0.5">{entry.description}</p>
                        <p className="text-[10px] text-muted-foreground/60">{format(new Date(entry.createdAt), "MMM dd, h:mm a")} by {entry.createdBy}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground italic text-xs">No timeline events.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
