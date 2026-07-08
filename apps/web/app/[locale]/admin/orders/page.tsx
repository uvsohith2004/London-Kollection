"use client"
import { useState, useEffect } from "react"
import { useAdminOrdersQuery } from "@/app/[locale]/admin/queries"
import { useUpdateOrderStatusMutation as useAdminUpdateOrderStatusMutation } from "@/app/[locale]/admin/mutations"

export default function AdminOrdersPage() {
  const { data: orders = [], isLoading } = useAdminOrdersQuery()
  const updateStatusMutation = useAdminUpdateOrderStatusMutation()

  const handleConfirmOrder = async (orderId: string) => {
    const tracking = prompt("Enter tracking number for this order:")
    if (!tracking) return

    try {
      await updateStatusMutation.mutateAsync({
        id: orderId,
        data: {
          status: "Shipped",
          description: `Order shipped. Tracking Number: ${tracking}`,
        },
      })
    } catch (err) {
      console.error(err)
      alert("Failed to update order")
    }
  }

  if (isLoading)
    return <div className="p-8 text-muted-foreground">Loading...</div>

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Orders</h1>
      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        <table className="w-full text-left">
          <thead className="border-b bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-sm font-medium text-gray-500">
                Order ID
              </th>
              <th className="px-6 py-4 text-sm font-medium text-gray-500">
                Date
              </th>
              <th className="px-6 py-4 text-sm font-medium text-gray-500">
                Status
              </th>
              <th className="px-6 py-4 text-sm font-medium text-gray-500">
                Total
              </th>
              <th className="px-6 py-4 text-sm font-medium text-gray-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {orders.map((order: any) => (
              <tr key={order.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium">
                  {order.orderNumber}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {new Date(order.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      order.status === "Pending" ||
                      order.status === "APPROVAL_PENDING"
                        ? "bg-yellow-100 text-yellow-800"
                        : order.status === "Shipped"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {order.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm">${order.totalAmount}</td>
                <td className="px-6 py-4 text-sm">
                  {(order.status === "Pending" ||
                    order.status === "APPROVAL_PENDING") && (
                    <button
                      onClick={() => handleConfirmOrder(order.id)}
                      className="font-medium text-blue-600 hover:text-blue-800"
                    >
                      Confirm & Add Tracking
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
