"use client"
import { useState } from "react"
import { useAdminOrdersQuery } from "@/app/[locale]/admin/queries"
import { useUpdateOrderStatusMutation } from "@/app/[locale]/admin/mutations"
import { ChevronDown, ChevronUp, Package, Clock, CheckCircle, XCircle, Truck, DollarSign } from "lucide-react"
import { format } from "date-fns"
import { toast } from "sonner"

const ORDER_STATUSES = [
  "Pending", "Awaiting Payment", "Payment Verification", "Confirmed", 
  "Preparing", "Packed", "Ready for Pickup", "Shipped", "Out for Delivery", 
  "Delivered", "Completed", "Cancelled", "Return Requested", 
  "Return Approved", "Return Rejected", "Returned", "Refunded"
]

const PAYMENT_STATUSES = [
  "Pending", "Awaiting Verification", "Verified", "Paid", 
  "Failed", "Refunded", "Partially Refunded"
]

export default function AdminOrdersPage() {
  const { data: ordersData, isLoading } = useAdminOrdersQuery()
  const orders = Array.isArray(ordersData) ? ordersData : (ordersData?.items || ordersData?.data || [])
  const updateStatusMutation = useUpdateOrderStatusMutation()
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  const handleUpdateStatus = async (orderId: string, status: string, type: 'order' | 'payment') => {
    try {
      const payload: any = {}
      if (type === 'order') payload.status = status
      if (type === 'payment') payload.paymentStatus = status

      await updateStatusMutation.mutateAsync({
        id: orderId,
        data: payload
      })
    } catch (err) {
      console.error(err)
    }
  }

  const filteredOrders = orders.filter((order: any) => 
    order.orderNumber?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (isLoading) return <div className="p-8 text-muted-foreground flex items-center justify-center">Loading Orders...</div>

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Orders Management</h1>
        <input 
          type="text" 
          placeholder="Search by Order ID..." 
          className="border rounded-md px-4 py-2 w-full sm:w-64 focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-background text-foreground"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground bg-card rounded-xl border">No orders found.</div>
        ) : (
          filteredOrders.map((order: any) => {
            const isExpanded = expandedId === order.id
            return (
              <div key={order.id} className="bg-card text-card-foreground border rounded-xl shadow-sm overflow-hidden transition-all duration-200">
                {/* Card Header (Summary) */}
                <div 
                  className="p-4 sm:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => setExpandedId(isExpanded ? null : order.id)}
                >
                  <div className="flex flex-col gap-1">
                    <span className="text-lg font-semibold">{order.orderNumber}</span>
                    <span className="text-sm text-muted-foreground">{format(new Date(order.createdAt), "MMM dd, yyyy h:mm a")}</span>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 items-center">
                    <div className="flex flex-col text-sm border p-2 rounded-md bg-background">
                      <span className="text-xs text-muted-foreground font-medium mb-1 uppercase tracking-wider">Order Status</span>
                      <select 
                        value={order.status}
                        onChange={(e) => { e.stopPropagation(); handleUpdateStatus(order.id, e.target.value, 'order'); }}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-transparent border-none outline-none cursor-pointer font-medium"
                      >
                        {ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>

                    <div className="flex flex-col text-sm border p-2 rounded-md bg-background">
                      <span className="text-xs text-muted-foreground font-medium mb-1 uppercase tracking-wider">Payment</span>
                      <select 
                        value={order.paymentStatus || 'Pending'}
                        onChange={(e) => { e.stopPropagation(); handleUpdateStatus(order.id, e.target.value, 'payment'); }}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-transparent border-none outline-none cursor-pointer font-medium"
                      >
                        {PAYMENT_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>

                    <div className="text-right ml-4">
                      <div className="font-bold text-lg">{Number(order.totalAmount).toFixed(3)} KWD</div>
                      <div className="text-xs text-muted-foreground">{order.items?.length || 0} items</div>
                    </div>
                    
                    <button className="p-2 ml-2 hover:bg-muted rounded-full">
                      {isExpanded ? <ChevronUp size={20}/> : <ChevronDown size={20}/>}
                    </button>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="border-t p-4 sm:p-6 bg-muted/20 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      
                      {/* Customer Info */}
                      <div className="space-y-2">
                        <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Customer Information</h3>
                        <div className="bg-background p-3 rounded-lg border">
                          <p className="font-medium">{order.shippingAddress?.name || '—'}</p>
                          <p className="text-sm text-muted-foreground">{order.shippingAddress?.phone || '—'}</p>
                        </div>
                      </div>

                      {/* Shipping Address */}
                      <div className="space-y-2">
                        <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Shipping Address</h3>
                        <div className="bg-background p-3 rounded-lg border">
                          <p className="text-sm">{order.shippingAddress?.addressLine1 || '—'}</p>
                          {order.shippingAddress?.addressLine2 && <p className="text-sm">{order.shippingAddress?.addressLine2}</p>}
                          <p className="text-sm">{[order.shippingAddress?.city, order.shippingAddress?.state, order.shippingAddress?.postalCode].filter(Boolean).join(', ')}</p>
                          <p className="text-sm">{order.shippingAddress?.country}</p>
                        </div>
                      </div>
                      
                      {/* Cancellation & Notes */}
                      {(order.cancellationReason || order.cancelledBy) && (
                        <div className="space-y-2">
                          <h3 className="font-semibold text-sm text-destructive uppercase tracking-wider">Cancellation Info</h3>
                          <div className="bg-destructive/10 text-destructive p-3 rounded-lg border border-destructive/20">
                            <p className="text-sm font-medium">Reason: {order.cancellationReason}</p>
                            <p className="text-xs mt-1 opacity-80">By: {order.cancelledBy}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
