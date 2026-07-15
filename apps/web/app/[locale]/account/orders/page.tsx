import { PaginatedOrdersResponse } from "@workspace/api-contracts"
import OrderTopBar from "./components/orders-topbar"
import { InfiniteOrderList } from "./components/infinite-order-list"
import OrderCard from "./components/order-card"
import { serverApi } from "@/api-client/server"

export default async function AccountOrdersPage(props: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const searchParams = await props.searchParams;
  const page = 1;
  const limit = 10;
  const search = (searchParams?.search as string) || "";
  const status = (searchParams?.status as string) || "All";

  let initialData: PaginatedOrdersResponse = { items: [], hasMore: false, total: 0, counts: { all: 0, pending: 0, shipped: 0, delivered: 0, cancelled: 0 }, nextCursor: null };
  try {
    const response = await serverApi.get(`/orders?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}&status=${encodeURIComponent(status)}`)
    initialData = {
      items: response.items || [],
      hasMore: !!response.hasMore,
      total: response.total || 0,
      counts: response.counts || { all: 0, pending: 0, shipped: 0, delivered: 0, cancelled: 0 },
      nextCursor: response.nextCursor || null,
    };
  } catch (error) {
    console.error("Failed to fetch orders on server:", error)
  }

  const initialNodes = initialData.items.map((order) => (
    <div 
      key={order.id} 
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-card transition-colors hover:border-border block"
    >
      <OrderCard order={order} />
    </div>
  ));

  return (
    <section className="max-w-4xl animate-in space-y-6 py-8 duration-500 fade-in">
      <div className="mb-6 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="font-serif text-3xl tracking-tight text-foreground">
            Order History
          </h1>
          <p className="mt-1.5 text-sm font-medium text-muted-foreground">
            Manage and track your purchases
          </p>
        </div>
      </div>
      
      <OrderTopBar initialSearch={search} initialStatus={status} orderCounts={initialData.counts} />
      <InfiniteOrderList 
        initialNodes={initialNodes} 
        initialHasMore={initialData.hasMore}
        initialNextCursor={initialData.nextCursor}
        search={search} 
        status={status} 
        limit={limit} 
      />
    </section>
  )
}
