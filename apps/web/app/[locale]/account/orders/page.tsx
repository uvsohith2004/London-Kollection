'use client';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUserOrdersQuery } from './services/queries';
import { Package, Clock, CheckCircle2, Truck, XCircle, Search, Filter, ChevronDown, ShoppingBag, Calendar, MapPin, Phone, Info } from 'lucide-react';
import { format } from 'date-fns';
import Image from 'next/image';
import { Button } from '@workspace/ui/components/button';

const formatAddressString = (addressData: any) => {
  if (!addressData) return 'No address provided';
  if (typeof addressData === 'string') {
    try {
      if (addressData.trim().startsWith('{')) {
        const parsed = JSON.parse(addressData);
        return Object.values(parsed).filter(Boolean).join(', ');
      }
    } catch (e) {
      return addressData;
    }
  }
  return addressData;
};

export default function AccountOrdersPage() {
  const router = useRouter();
  const { data: orders = [], isLoading } = useUserOrdersQuery();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showFilters, setShowFilters] = useState(false);

  const filteredOrders = useMemo(() => {
    return orders.filter((order: any) => {
      const matchesSearch = order.orderNumber?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "All" || (order.status?.toLowerCase() === statusFilter.toLowerCase());
      return matchesSearch && matchesStatus;
    });
  }, [orders, searchQuery, statusFilter]);

  const getStatusConfig = (status: string) => {
    const s = status?.toUpperCase();
    switch(s) {
      case 'DELIVERED': 
        return { label: 'Delivered', color: 'text-emerald-700 dark:text-emerald-400', bgColor: 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20', icon: <CheckCircle2 className="w-4 h-4" /> };
      case 'SHIPPED': 
        return { label: 'Shipped', color: 'text-blue-700 dark:text-blue-400', bgColor: 'bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20', icon: <Truck className="w-4 h-4" /> };
      case 'CANCELLED': 
        return { label: 'Cancelled', color: 'text-red-700 dark:text-red-400', bgColor: 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20', icon: <XCircle className="w-4 h-4" /> };
      default: 
        return { label: status || 'Pending', color: 'text-amber-700 dark:text-amber-400', bgColor: 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20', icon: <Clock className="w-4 h-4" /> };
    }
  };

  const orderCounts = {
    all: orders.length,
    pending: orders.filter((o: any) => !['DELIVERED', 'SHIPPED', 'CANCELLED'].includes(o.status?.toUpperCase())).length,
    shipped: orders.filter((o: any) => o.status?.toUpperCase() === 'SHIPPED').length,
    delivered: orders.filter((o: any) => o.status?.toUpperCase() === 'DELIVERED').length,
    cancelled: orders.filter((o: any) => o.status?.toUpperCase() === 'CANCELLED').length,
  };

  if (isLoading) return <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground">Loading Orders...</div>;

  return (
    <div className="max-w-5xl py-8 space-y-8">
      <div className="mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-serif tracking-tight text-foreground">My Orders</h1>
            <p className="text-muted-foreground mt-1">Manage and track your recent purchases</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">
              {filteredOrders.length} {filteredOrders.length === 1 ? 'order' : 'orders'}
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by order number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-card text-foreground border rounded-xl outline-none focus:ring-2 focus:ring-primary focus:border-transparent shadow-sm"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2.5 border rounded-xl shadow-sm transition-colors ${
              showFilters
                ? 'bg-foreground text-background border-foreground'
                : 'bg-card text-foreground border-border hover:bg-muted/50'
            }`}
          >
            <Filter className="w-4 h-4" />
            <span className="text-sm font-medium">Filter</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {showFilters && (
          <div className="mt-4 flex flex-wrap gap-2">
            {[
              { id: 'All', label: 'All', count: orderCounts.all },
              { id: 'Pending', label: 'Pending', count: orderCounts.pending },
              { id: 'Shipped', label: 'Shipped', count: orderCounts.shipped },
              { id: 'Delivered', label: 'Delivered', count: orderCounts.delivered },
              { id: 'Cancelled', label: 'Cancelled', count: orderCounts.cancelled },
            ].map((status) => (
              <button
                key={status.id}
                onClick={() => setStatusFilter(status.id)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  statusFilter === status.id
                    ? 'bg-foreground text-background'
                    : 'bg-card text-muted-foreground hover:bg-muted border border-border'
                }`}
              >
                {status.label}
                <span className="ml-2 text-xs opacity-60">({status.count})</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {filteredOrders.length === 0 ? (
        <div className="bg-card rounded-2xl shadow-sm border p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-serif tracking-tight text-foreground mb-2">No orders found</h3>
          <p className="text-muted-foreground">
            {searchQuery || statusFilter !== 'All'
              ? 'Try adjusting your filters or search query.'
              : 'Orders will appear here once they are placed.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order: any) => {
            const config = getStatusConfig(order.status);
            const itemCount = order.items?.reduce((sum: number, item: any) => sum + (item.quantity || 1), 0) || 0;
            const firstImage = order.items?.[0]?.productMetadata?.images?.[0] || order.items?.[0]?.productMetadata?.image;

            return (
              <div
                key={order.id}
                onClick={() => router.push(`/account/orders/${order.id}`)}
                className="bg-card rounded-2xl shadow-sm border border-border hover:shadow-md hover:border-primary/20 transition-all duration-200 cursor-pointer group p-5 sm:p-6 flex flex-col gap-5"
              >
                {/* Header Section: Status, Order Details, Price */}
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                  <div className="space-y-3 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${config.color} ${config.bgColor}`}>
                        {config.icon}
                        {config.label}
                      </span>
                      <span className="text-sm font-medium text-muted-foreground break-all">
                        Ref: {order.orderNumber}
                      </span>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-foreground/80">
                      <span className="flex items-center gap-2">
                        <ShoppingBag className="w-4 h-4 opacity-70" />
                        {itemCount} {itemCount === 1 ? 'item' : 'items'}
                      </span>
                      <span className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 opacity-70" />
                        {format(new Date(order.createdAt), "MMM dd, yyyy - h:mm a")}
                      </span>
                    </div>
                  </div>

                  <div className="text-left sm:text-right shrink-0">
                    <p className="text-2xl  font-semibold text-foreground tracking-tight">
                      {Number(order.totalAmount).toFixed(3)} KWD
                    </p>
                  </div>
                </div>

                {/* Details Section: Image, Full Address, and Call Buttons */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 pt-2">
                  <div className="relative w-16 h-16 shrink-0 rounded-xl overflow-hidden bg-secondary border">
                    {firstImage ? (
                      <Image 
                        src={firstImage}
                        alt="Product Image"
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Package className="w-6 h-6 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0 flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-muted-foreground shrink-0 mt-1" />
                    <div className="text-sm text-muted-foreground">
                      <p className="font-medium text-foreground mb-1">{order.shippingAddress?.name || 'Customer'}</p>
                      <p className="leading-relaxed">
                        {formatAddressString(order.shippingAddress?.addressLine1)}, 
                        {[order.shippingAddress?.city, order.shippingAddress?.country].filter(Boolean).join(', ')}
                      </p>
                    </div>
                  </div>

                  {/* Immediate Call Action Buttons with Context Label */}
                  <div className="shrink-0 flex flex-col items-start sm:items-end gap-2 w-full sm:w-auto mt-3 sm:mt-0">
                    <p className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                      <Info className="w-3.5 h-3.5" />
                      Need fast processing or have doubts? Contact owner:
                    </p>
                    <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
                      <a 
                        href="tel:97973479" 
                        onClick={(e) => e.stopPropagation()} 
                        className="flex items-center gap-1.5 px-3 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 rounded-lg text-sm font-semibold transition-colors border border-blue-200 dark:border-blue-800"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        97973479
                      </a>
                      <a 
                        href="tel:51759962" 
                        onClick={(e) => e.stopPropagation()} 
                        className="flex items-center gap-1.5 px-3 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 rounded-lg text-sm font-semibold transition-colors border border-blue-200 dark:border-blue-800"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        51759962
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
