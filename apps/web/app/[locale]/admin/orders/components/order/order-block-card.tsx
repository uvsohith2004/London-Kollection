"use client"

import * as React from "react"
import { format } from "date-fns"
import { OrderWorkflowActions } from "../order-workflow-actions"
import { Dialog, DialogContent, DialogTrigger } from "@workspace/ui/components/dialog"

interface OrderBlockCardProps {
  order: any
  onUpdateStatus: (orderId: string, status: string, type: 'order' | 'payment', reason?: string, paymentMethod?: string) => void
}

export function OrderBlockCard({ order, onUpdateStatus }: OrderBlockCardProps) {
  const firstItem = order.items?.[0]
  const imageUrl = firstItem?.product?.images?.[0]?.url || firstItem?.product?.images?.[0]?.asset?.webp?.url

  const statusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "pending":
      case "awaiting payment": return "bg-yellow-500/90 text-white"
      case "confirmed": return "bg-blue-500/90 text-white"
      case "processing":
      case "preparing":
      case "packed": return "bg-indigo-500/90 text-white"
      case "shipped":
      case "out for delivery": return "bg-purple-500/90 text-white"
      case "delivered":
      case "completed": return "bg-green-500/90 text-white"
      case "cancelled":
      case "refunded": return "bg-red-500/90 text-white"
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
        <div className="group relative flex flex-col overflow-hidden rounded-3xl border border-border/40 bg-card transition-all hover:border-border/80 hover:shadow-md cursor-pointer text-left">
          <div className="relative aspect-square w-full overflow-hidden bg-muted/30">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt="Order item"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                No Image
              </div>
            )}
            
            {order.items?.length > 1 && (
              <div className="absolute bottom-2 right-2 bg-background/80 backdrop-blur text-[10px] font-bold px-2 py-0.5 rounded-full border border-border/50 shadow-sm">
                +{order.items.length - 1} items
              </div>
            )}

            <div className="absolute top-3 left-3">
              <span
                className={`inline-flex items-center rounded-full px-2 py-1 text-[10px] font-bold tracking-wider uppercase shadow-sm ${statusColor(order.status)}`}
              >
                {order.status}
              </span>
            </div>

            <div className="absolute top-3 right-3 opacity-0 transition-opacity group-hover:opacity-100" onClick={(e) => e.stopPropagation()}>
              <div className="bg-background/80 backdrop-blur rounded-xl p-1 shadow-sm">
                <OrderWorkflowActions order={order} onUpdateStatus={onUpdateStatus} />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1 p-5">
            <h3
              className="truncate font-medium text-foreground text-lg"
              title={order.orderNumber}
            >
              {order.orderNumber}
            </h3>
            <p className="truncate text-sm text-muted-foreground">
              {order.shippingAddress?.phone || "No Phone Number"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {format(new Date(order.createdAt), "MMM dd, yyyy")}
            </p>
            <div className="mt-2 flex items-center justify-between">
              <p className="font-mono font-medium text-foreground">
                {Number(order.totalAmount).toFixed(3)} KWD
              </p>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${paymentColor(order.paymentStatus)}`}>
                {order.paymentStatus || 'Payment Pending'}
              </span>
            </div>
          </div>
        </div>
      } />
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
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
            </div>
          </div>
          {/* Timeline and products simplified for briefness here or re-used */}
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
                        <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                      </div>
                      <div className="font-mono text-sm font-medium text-right">
                        {(Number(item.priceAtPurchase) * item.quantity).toFixed(3)} KWD
                      </div>
                    </div>
                  )
                })}
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
                    <p>{[order.shippingAddress?.city, order.shippingAddress?.country].filter(Boolean).join(', ')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
