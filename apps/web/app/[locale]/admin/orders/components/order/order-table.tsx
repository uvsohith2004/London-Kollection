"use client"

import * as React from "react"
import { format } from "date-fns"
import { OrderWorkflowActions } from "../order-workflow-actions"
import { formatAddressLine } from "@/lib/format-address"
import { Dialog, DialogContent, DialogTrigger } from "@workspace/ui/components/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"

interface OrderTableProps {
  orders: any[]
  onUpdateStatus: (orderId: string, status: string, type: 'order' | 'payment', reason?: string, paymentMethod?: string) => void
}

export function OrderTable({ orders, onUpdateStatus }: OrderTableProps) {
  const [selectedOrder, setSelectedOrder] = React.useState<any>(null)

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
    <>
      <div className="overflow-hidden rounded-2xl border border-border/40 bg-card shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/10">
              <TableRow className="border-border/40">
                <TableHead className="px-6 py-4 font-medium tracking-wide text-muted-foreground">Order ID</TableHead>
                <TableHead className="px-6 py-4 font-medium tracking-wide text-muted-foreground">Date</TableHead>
                <TableHead className="px-6 py-4 font-medium tracking-wide text-muted-foreground">Phone Number</TableHead>
                <TableHead className="px-6 py-4 font-medium tracking-wide text-muted-foreground">Status</TableHead>
                <TableHead className="px-6 py-4 font-medium tracking-wide text-muted-foreground">Payment</TableHead>
                <TableHead className="px-6 py-4 font-medium tracking-wide text-muted-foreground text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow 
                  key={order.id} 
                  className="border-border/40 transition-colors hover:bg-muted/20 cursor-pointer"
                  onClick={() => setSelectedOrder(order)}
                >
                  <TableCell className="px-6 py-4 font-medium">{order.orderNumber}</TableCell>
                  <TableCell className="px-6 py-4 text-muted-foreground">{format(new Date(order.createdAt), "MMM dd, yyyy")}</TableCell>
                  <TableCell className="px-6 py-4">{order.shippingAddress?.phone || "No Phone Number"}</TableCell>
                  <TableCell className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${paymentColor(order.paymentStatus)}`}>
                      {order.paymentStatus || 'Pending'}
                    </span>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <OrderWorkflowActions order={order} onUpdateStatus={onUpdateStatus} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedOrder && (
            <div className="p-2 space-y-8">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">{selectedOrder.orderNumber}</h2>
                  <p className="text-muted-foreground text-sm">{format(new Date(selectedOrder.createdAt), "MMMM dd, yyyy h:mm a")}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${statusColor(selectedOrder.status)}`}>
                    {selectedOrder.status}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h4 className="font-semibold text-sm tracking-wider uppercase text-muted-foreground border-b pb-2">Order Items</h4>
                  <div className="space-y-4">
                    {selectedOrder.items?.map((item: any) => {
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
                  <div className="border-t pt-4 flex justify-between items-center font-bold">
                    <span>Total Amount</span>
                    <span className="font-mono text-lg">{Number(selectedOrder.totalAmount).toFixed(3)} KWD</span>
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm tracking-wider uppercase text-muted-foreground border-b pb-2">Customer & Shipping</h4>
                    <div className="text-sm space-y-1">
                      <p className="font-medium">{selectedOrder.shippingAddress?.phone || "No Phone Number"}</p>
                      <p className="text-muted-foreground">{selectedOrder.shippingAddress?.name || "Guest Customer"}</p>
                      <p className="text-muted-foreground">{selectedOrder.shippingAddress?.email}</p>
                      <div className="pt-2">
                        <p>{formatAddressLine(selectedOrder.shippingAddress?.addressLine1)}</p>
                        <p>{[selectedOrder.shippingAddress?.city, selectedOrder.shippingAddress?.country].filter(Boolean).join(', ')}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
