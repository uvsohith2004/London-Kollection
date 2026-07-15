"use server"
import { serverApi } from "@/api-client/server"
import { PaginatedOrdersResponse } from "@workspace/api-contracts"
import OrderCard from "./components/order-card"
import React from "react"


export async function loadMoreOrders(page: number, limit: number, search: string, status: string) {
  try {
    const response = await serverApi.get(`/orders?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}&status=${encodeURIComponent(status)}`)
    
    const data = response as PaginatedOrdersResponse;
    
    const nodes = data.items.map((order) => (
      <div 
        key={order.id} 
        className="group relative flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-card transition-colors hover:border-border block"
      >
        <OrderCard order={order} />
      </div>
    ));

    return {
      nodes,
      nextCursor: data.nextCursor || null,
      hasMore: !!data.hasMore
    };
  } catch (error) {
    console.error("Failed to fetch more orders on server:", error)
    return {
      nodes: [],
      nextCursor: null,
      hasMore: false
    };
  }
}
