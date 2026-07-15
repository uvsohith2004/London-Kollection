"use client"

import * as React from "react"
import { OrderTable } from "./order-table"
import { OrderListCard } from "./order-list-card"
import { OrderBlockCard } from "./order-block-card"
import { OrderLayoutType } from "./order-layout-selection"

interface OrderGridProps {
  orders: any[]
  layout: OrderLayoutType
  onUpdateStatus: (orderId: string, status: string, type: 'order' | 'payment', reason?: string, paymentMethod?: string) => void
}

export function OrderGrid({ orders, layout, onUpdateStatus }: OrderGridProps) {
  if (layout === "table") {
    return <OrderTable orders={orders} onUpdateStatus={onUpdateStatus} />
  }

  if (layout === "list-card") {
    return (
      <div className="flex flex-col gap-4">
        {orders.map((order) => (
          <OrderListCard key={order.id} order={order} onUpdateStatus={onUpdateStatus} />
        ))}
      </div>
    )
  }

  // block-card uses grid layout
  const gridClass = "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"

  return (
    <div className={gridClass}>
      {orders.map((order) => (
        <OrderBlockCard key={order.id} order={order} onUpdateStatus={onUpdateStatus} />
      ))}
    </div>
  )
}
