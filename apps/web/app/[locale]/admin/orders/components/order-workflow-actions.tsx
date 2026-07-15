"use client"

import * as React from "react"
import { Button } from "@workspace/ui/components/button"
import { 
  CheckCircle, 
  XCircle, 
  Package, 
  Truck, 
  RotateCcw,
  RefreshCcw,
  Archive
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
  DialogTrigger,
} from "@workspace/ui/components/dialog"

interface OrderWorkflowActionsProps {
  order: any
  onUpdateStatus: (orderId: string, status: string, type: 'order' | 'payment', reason?: string, paymentMethod?: string, pickupDate?: string, estimatedDelivery?: string) => void
}

export function OrderWorkflowActions({ order, onUpdateStatus }: OrderWorkflowActionsProps) {
  const currentStatus = (order.status || "pending").toLowerCase().replace(/ /g, "_")
  const currentPaymentStatus = (order.paymentStatus || "pending").toLowerCase()
  
  // Define available actions based on current status
  const actions: { label: string; status: string; icon: React.ReactNode; variant: "default" | "destructive" | "outline" | "secondary"; confirmation?: boolean; reasonRequired?: boolean; isPaymentApproval?: boolean; isPaymentAction?: boolean; requiresPickupDate?: boolean; requiresEstimatedDelivery?: boolean }[] = []

  switch (currentStatus) {
    case "pending":
    case "awaiting_approval":
      actions.push({ label: "Approve Order", status: "Confirmed", icon: <CheckCircle className="mr-2 h-4 w-4" />, variant: "default" })
      actions.push({ label: "Reject Order", status: "Cancelled", icon: <XCircle className="mr-2 h-4 w-4" />, variant: "destructive", confirmation: true, reasonRequired: true })
      break;
    case "confirmed":
      actions.push({ label: "Mark as Preparing", status: "Preparing", icon: <Package className="mr-2 h-4 w-4" />, variant: "outline" })
      actions.push({ label: "Mark as Packed", status: "Packed", icon: <Package className="mr-2 h-4 w-4" />, variant: "outline" })
      actions.push({ label: "Ship Order", status: "Shipped", icon: <Truck className="mr-2 h-4 w-4" />, variant: "default" })
      actions.push({ label: "Cancel Order", status: "Cancelled", icon: <XCircle className="mr-2 h-4 w-4" />, variant: "destructive", confirmation: true, reasonRequired: true })
      break;
    case "preparing":
      actions.push({ label: "Mark as Packed", status: "Packed", icon: <Package className="mr-2 h-4 w-4" />, variant: "outline" })
      actions.push({ label: "Ship Order", status: "Shipped", icon: <Truck className="mr-2 h-4 w-4" />, variant: "default" })
      actions.push({ label: "Cancel Order", status: "Cancelled", icon: <XCircle className="mr-2 h-4 w-4" />, variant: "destructive", confirmation: true, reasonRequired: true })
      break;
    case "packed":
      actions.push({ label: "Ship Order", status: "Shipped", icon: <Truck className="mr-2 h-4 w-4" />, variant: "default", confirmation: true, requiresEstimatedDelivery: true })
      actions.push({ label: "Cancel Order", status: "Cancelled", icon: <XCircle className="mr-2 h-4 w-4" />, variant: "destructive", confirmation: true, reasonRequired: true })
      break;
    case "shipped":
    case "out_for_delivery":
      actions.push({ label: "Mark Delivered", status: "Delivered", icon: <CheckCircle className="mr-2 h-4 w-4" />, variant: "default" })
      actions.push({ label: "Cancel Order", status: "Cancelled", icon: <XCircle className="mr-2 h-4 w-4" />, variant: "destructive", confirmation: true, reasonRequired: true })
      break;
    case "delivered":
      actions.push({ label: "Complete Order", status: "Completed", icon: <CheckCircle className="mr-2 h-4 w-4" />, variant: "default" })
      break;
    case "return_requested":
      actions.push({ label: "Approve Return", status: "Return Approved", icon: <CheckCircle className="mr-2 h-4 w-4" />, variant: "default" })
      actions.push({ label: "Reject Return", status: "Return Rejected", icon: <XCircle className="mr-2 h-4 w-4" />, variant: "destructive", confirmation: true, reasonRequired: true })
      break;
    case "return_approved":
      actions.push({ label: "Schedule Pickup", status: "Pickup Scheduled", icon: <Truck className="mr-2 h-4 w-4" />, variant: "outline", confirmation: true, requiresPickupDate: true })
      break;
    case "exchange_requested":
      actions.push({ label: "Approve Exchange", status: "Exchange Approved", icon: <CheckCircle className="mr-2 h-4 w-4" />, variant: "default" })
      actions.push({ label: "Reject Exchange", status: "Exchange Rejected", icon: <XCircle className="mr-2 h-4 w-4" />, variant: "destructive", confirmation: true, reasonRequired: true })
      break;
    case "exchange_approved":
      actions.push({ label: "Schedule Pickup", status: "Pickup Scheduled", icon: <Truck className="mr-2 h-4 w-4" />, variant: "outline", confirmation: true, requiresPickupDate: true })
      break;
    case "pickup_scheduled":
      actions.push({ label: "Mark Picked Up", status: "Picked Up", icon: <CheckCircle className="mr-2 h-4 w-4" />, variant: "default" })
      break;
    case "picked_up":
      actions.push({ label: "Mark Returned", status: "Returned", icon: <Archive className="mr-2 h-4 w-4" />, variant: "default" })
      break;
  }

  if (currentPaymentStatus === "pending") {
    actions.push({ label: "Approve Payment", status: "paid", icon: <CheckCircle className="mr-2 h-4 w-4" />, variant: "outline", confirmation: true, isPaymentApproval: true, isPaymentAction: true })
  }

  if (currentStatus === "cancelled" && (currentPaymentStatus === "paid" || currentPaymentStatus === "captured")) {
    actions.push({ label: "Refund Amount", status: "refunded", icon: <RotateCcw className="mr-2 h-4 w-4" />, variant: "outline", confirmation: true, isPaymentAction: true })
  }

  if (actions.length === 0) {
    return <span className="text-sm text-muted-foreground italic">No actions available</span>
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {actions.map((action, idx) => {
        if (action.confirmation) {
          return (
            <Dialog key={idx}>
              <DialogTrigger render={
                <Button variant={action.variant} size="sm" className="rounded-full h-8">
                  {action.icon} {action.label}
                </Button>
              } />
              <DialogContent onClick={(e) => e.stopPropagation()}>
                <DialogHeader>
                  <DialogTitle>{action.label}</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to perform this action?
                  </DialogDescription>
                </DialogHeader>
                {action.reasonRequired && (
                  <div className="py-4">
                    <label className="text-sm font-medium">Reason</label>
                    <textarea 
                      id={`reason-${action.status}`}
                      className="w-full mt-2 border rounded-md p-2 bg-background text-sm outline-none focus:ring-2 focus:ring-primary/20"
                      rows={3}
                      placeholder="Provide a reason..."
                    ></textarea>
                  </div>
                )}
                {action.isPaymentApproval && (
                  <div className="py-4">
                    <label className="text-sm font-medium">Payment Method</label>
                    <select 
                      id={`payment-method-${action.status}`}
                      className="w-full mt-2 border rounded-md p-2 bg-background text-sm outline-none focus:ring-2 focus:ring-primary/20"
                    >
                      <option value="manual">Manual Payment</option>
                      <option value="cod">Cash on Delivery (COD)</option>
                    </select>
                  </div>
                )}
                {action.requiresPickupDate && (
                  <div className="py-4">
                    <label className="text-sm font-medium">Estimated Pickup Date & Time</label>
                    <input 
                      type="datetime-local"
                      id={`pickup-date-${action.status}`}
                      className="w-full mt-2 border rounded-md p-2 bg-background text-sm outline-none focus:ring-2 focus:ring-primary/20"
                      required
                    />
                  </div>
                )}
                {action.requiresEstimatedDelivery && (
                  <div className="py-4">
                    <label className="text-sm font-medium">Estimated Delivery Date</label>
                    <input 
                      type="date"
                      id={`estimated-delivery-${action.status}`}
                      className="w-full mt-2 border rounded-md p-2 bg-background text-sm outline-none focus:ring-2 focus:ring-primary/20"
                      required
                    />
                  </div>
                )}
                <DialogFooter>
                  <DialogClose render={<Button variant="outline">Cancel</Button>} />
                  <DialogClose render={
                    <Button variant={action.variant} onClick={(e) => {
                      e.stopPropagation();
                      const reason = action.reasonRequired ? (document.getElementById(`reason-${action.status}`) as HTMLTextAreaElement)?.value : undefined;
                      const paymentMethod = action.isPaymentApproval ? (document.getElementById(`payment-method-${action.status}`) as HTMLSelectElement)?.value : undefined;
                      const pickupDate = action.requiresPickupDate ? (document.getElementById(`pickup-date-${action.status}`) as HTMLInputElement)?.value : undefined;
                      const estimatedDelivery = action.requiresEstimatedDelivery ? (document.getElementById(`estimated-delivery-${action.status}`) as HTMLInputElement)?.value : undefined;
                      onUpdateStatus(order.id, action.status, action.isPaymentAction ? 'payment' : 'order', reason, paymentMethod, pickupDate, estimatedDelivery)
                    }}>
                      Confirm
                    </Button>
                  } />
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )
        }

        return (
          <Button 
            key={idx} 
            variant={action.variant} 
            size="sm" 
            className="rounded-full h-8"
            onClick={(e) => {
              e.stopPropagation()
              onUpdateStatus(order.id, action.status, 'order')
            }}
          >
            {action.icon} {action.label}
          </Button>
        )
      })}
    </div>
  )
}
