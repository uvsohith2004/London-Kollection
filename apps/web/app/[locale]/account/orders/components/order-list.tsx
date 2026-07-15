"use client"
import { useMemo } from "react";
import OrderCard from "./order-card";
import OrderEmpty from "./order-empty";
import { useRouter } from "next/navigation";
import { LoadMoreTrigger } from "./load-more-trigger";
import { useOrders } from "../hooks/use-orders";
import { PaginatedOrdersResponse } from "@workspace/api-contracts";

interface OrderListProps {
  initialData: PaginatedOrdersResponse;
  search: string;
  status: string;
  limit: number;
}

export function OrderList({
  initialData,
  search,
  status,
  limit,
}: OrderListProps) {
  const router = useRouter();

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useOrders({
    search,
    status,
    limit,
    initialData
  });

  const orders = useMemo(() => {
    return data?.pages.flatMap((page) => page.items) || [];
  }, [data]);

  if (isLoading && orders.length === 0) {
    return <div className="py-12 text-center text-muted-foreground animate-pulse">Loading orders...</div>;
  }

  if (orders.length === 0) {
    return <OrderEmpty />;
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <div
          key={order.id}
          onClick={() => router.push(`/account/orders/${order.id}`)}
          className="group flex cursor-pointer flex-col overflow-hidden rounded-xl border border-border/40 bg-transparent transition-colors hover:bg-muted/5 hover:border-border/60"
        >
          <OrderCard order={order} />
        </div>
      ))}

      <LoadMoreTrigger
        hasMore={!!hasNextPage}
        isFetching={isFetchingNextPage}
        onLoadMore={fetchNextPage}
      />
    </div>
  );
}
