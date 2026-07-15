"use client"
import React, { useState } from "react";
import { LoadMoreTrigger } from "./load-more-trigger";
import { loadMoreOrders } from "../actions";
import OrderEmpty from "./order-empty";

interface InfiniteOrderListProps {
  initialNodes: React.ReactNode[];
  initialHasMore: boolean;
  initialNextCursor: number | null;
  search: string;
  status: string;
  limit: number;
}

export function InfiniteOrderList({
  initialNodes,
  initialHasMore,
  initialNextCursor,
  search,
  status,
  limit,
}: InfiniteOrderListProps) {
  const [nodes, setNodes] = useState<React.ReactNode[]>(initialNodes);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [nextCursor, setNextCursor] = useState(initialNextCursor);
  const [isFetching, setIsFetching] = useState(false);

  // Sync state if URL filters change
  const [prevSearch, setPrevSearch] = useState(search);
  const [prevStatus, setPrevStatus] = useState(status);

  if (search !== prevSearch || status !== prevStatus) {
    setNodes(initialNodes);
    setHasMore(initialHasMore);
    setNextCursor(initialNextCursor);
    setPrevSearch(search);
    setPrevStatus(status);
  }

  const fetchNextPage = async () => {
    if (!hasMore || !nextCursor || isFetching) return;
    
    setIsFetching(true);
    try {
      const result = await loadMoreOrders(nextCursor, limit, search, status);
      setNodes((prev) => [...prev, ...result.nodes]);
      setHasMore(result.hasMore);
      setNextCursor(result.nextCursor);
    } catch (error) {
      console.error("Error loading more orders", error);
    } finally {
      setIsFetching(false);
    }
  };

  if (nodes.length === 0 && !hasMore) {
    return <OrderEmpty />;
  }

  return (
    <div className="space-y-4">
      {nodes}
      
      <LoadMoreTrigger
        hasMore={hasMore}
        isFetching={isFetching}
        onLoadMore={fetchNextPage}
      />
    </div>
  );
}
