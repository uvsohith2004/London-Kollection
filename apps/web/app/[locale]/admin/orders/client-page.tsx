"use client"

import * as React from "react"
import { useInfiniteAdminOrdersQuery } from "@/app/[locale]/admin/queries"
import { useUpdateOrderStatusMutation } from "@/app/[locale]/admin/mutations"
import { OrderFilterBar } from "./components/order-filter-bar"
import { OrderLayoutSelection, OrderLayoutType } from "./components/order/order-layout-selection"
import { OrderGrid } from "./components/order/order-grid"
import { Button } from "@workspace/ui/components/button"
import { Download, Printer, Loader2 } from "lucide-react"

export default function AdminOrdersPage() {
  const [filters, setFilters] = React.useState<any>({})
  const [layout, setLayout] = React.useState<OrderLayoutType>("table")
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteAdminOrdersQuery(filters)
  const updateStatusMutation = useUpdateOrderStatusMutation()

  // Flatten the pages from infinite query
  const orders = React.useMemo(() => {
    if (!data?.pages) return []
    return data.pages.flatMap((page: any) => {
      // Depending on the API response structure, adjust the extraction
      const payload = page.data || page
      return payload.items || []
    })
  }, [data])

  const handleUpdateStatus = async (orderId: string, status: string, type: 'order' | 'payment', reason?: string, paymentMethod?: string, pickupDate?: string, estimatedDelivery?: string) => {
    try {
      const payload: any = {}
      if (type === 'order') payload.status = status
      if (type === 'payment') {
        payload.paymentStatus = status
        if (paymentMethod) payload.paymentMethod = paymentMethod
      }
      if (reason) payload.description = reason
      if (pickupDate) payload.pickupDate = pickupDate
      if (estimatedDelivery) payload.estimatedDelivery = estimatedDelivery

      await updateStatusMutation.mutateAsync({
        id: orderId,
        data: payload
      })
    } catch (err) {
      console.error(err)
    }
  }

  const handleExport = () => {
    const params = new URLSearchParams(filters).toString()
    window.location.href = `/api/admin/orders/export?${params}`
  }

  const handleBulkInvoices = () => {
    window.location.href = `/api/admin/orders/invoices/bulk`
  }

  // Intersection Observer for Infinite Loading
  const observerRef = React.useRef<IntersectionObserver | null>(null)
  const lastElementRef = React.useCallback(
    (node: HTMLDivElement | null) => {
      if (isLoading || isFetchingNextPage) return
      if (observerRef.current) observerRef.current.disconnect()

      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0]?.isIntersecting && hasNextPage) {
          fetchNextPage()
        }
      })

      if (node) observerRef.current.observe(node)
    },
    [isLoading, isFetchingNextPage, hasNextPage, fetchNextPage]
  )

  return (
    <div className="space-y-6 w-full font-sans pb-12">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <h2 className="font-heading text-4xl font-light tracking-tight text-foreground uppercase">
            Orders
          </h2>
          <p className="text-sm font-medium tracking-widest text-muted-foreground uppercase">
            Manage and track your store orders
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport} className="h-10 rounded-full px-6 font-bold tracking-widest uppercase text-xs">
            <Download className="mr-2 h-4 w-4" /> Export
          </Button>
          <Button variant="outline" onClick={handleBulkInvoices} className="h-10 rounded-full px-6 font-bold tracking-widest uppercase text-xs">
            <Printer className="mr-2 h-4 w-4" /> Invoices
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex-1 w-full sm:max-w-md">
          <OrderFilterBar filters={filters} onFilterChange={setFilters} />
        </div>
        <div className="flex items-center gap-3">
          <OrderLayoutSelection layout={layout} setLayout={setLayout} />
        </div>
      </div>

      <div className="min-h-100">
        {isLoading && orders.length === 0 ? (
          <div className="flex h-40 items-center justify-center rounded-3xl border border-border/40 bg-card">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-border/40 bg-card p-16 text-center shadow-sm">
            <h4 className="text-lg font-medium text-foreground">No records found</h4>
            <p className="mt-2 text-sm text-muted-foreground">Try adjusting your search query.</p>
          </div>
        ) : (
          <>
            <OrderGrid 
              orders={orders} 
              layout={layout} 
              onUpdateStatus={handleUpdateStatus} 
            />

            <div
              ref={lastElementRef}
              className="mt-6 flex h-10 items-center justify-center"
            >
              {isFetchingNextPage && (
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
