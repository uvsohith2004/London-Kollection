'use client';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useUserOrdersQuery } from './services/queries';
import { Package, ChevronDown, ChevronUp, Clock, CheckCircle2, Truck, XCircle, Search, Phone } from 'lucide-react';
import { format } from 'date-fns';

export default function AccountOrdersPage() {
  const { data: orders = [], isLoading } = useUserOrdersQuery();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const filteredOrders = useMemo(() => {
    return orders.filter((order: any) => {
      const matchesSearch = order.orderNumber?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "All" || (order.status?.toLowerCase() === statusFilter.toLowerCase());
      return matchesSearch && matchesStatus;
    });
  }, [orders, searchQuery, statusFilter]);

  const getStatusIcon = (status: string) => {
    switch(status?.toUpperCase()) {
      case 'DELIVERED': return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'SHIPPED': return <Truck className="w-5 h-5 text-blue-500" />;
      case 'CANCELLED': return <XCircle className="w-5 h-5 text-red-500" />;
      default: return <Clock className="w-5 h-5 text-amber-500" />;
    }
  };

  const isActiveOrder = (status: string) => {
    const s = status?.toLowerCase();
    return s && !['delivered', 'completed', 'cancelled', 'returned', 'refunded'].includes(s);
  };

  if (isLoading) return <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground">Loading Orders...</div>;

  return (
    <div className="max-w-5xl py-8 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-serif tracking-tight text-foreground">My Orders</h1>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search Order ID..." 
              className="pl-9 pr-4 py-2 border rounded-full bg-background outline-none focus:border-primary text-sm w-full sm:w-64"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          <select 
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="border rounded-full px-4 py-2 bg-background outline-none text-sm focus:border-primary"
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Shipped">Shipped</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 bg-card rounded-2xl border">
          <Package className="w-12 h-12 text-muted-foreground mb-4" />
          <h2 className="text-xl font-medium mb-2">No orders found</h2>
          <p className="text-muted-foreground mb-6">We couldn't find any orders matching your criteria.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredOrders.map((order: any) => {
            const isExpanded = expandedId === order.id;
            const active = isActiveOrder(order.status);
            
            return (
              <div key={order.id} className="bg-card text-card-foreground border rounded-2xl shadow-sm overflow-hidden transition-all duration-300">
                <div 
                  className="p-5 sm:p-6 cursor-pointer hover:bg-muted/30 transition-colors"
                  onClick={() => setExpandedId(isExpanded ? null : order.id)}
                >
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    
                    {/* Header Info */}
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-secondary flex items-center justify-center rounded-full shrink-0">
                        {getStatusIcon(order.status)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{order.orderNumber}</h3>
                        <p className="text-sm text-muted-foreground">{format(new Date(order.createdAt), "MMM dd, yyyy")}</p>
                      </div>
                    </div>

                    {/* Stats & Toggle */}
                    <div className="flex flex-wrap items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                      <div className="flex flex-col">
                        <span className="text-xs text-muted-foreground uppercase tracking-wider mb-0.5">Status</span>
                        <span className="font-medium capitalize text-sm">{order.status || 'Pending'}</span>
                      </div>
                      
                      <div className="flex flex-col">
                        <span className="text-xs text-muted-foreground uppercase tracking-wider mb-0.5">Payment</span>
                        <span className="font-medium capitalize text-sm">{order.paymentStatus || 'Pending'}</span>
                      </div>

                      <div className="flex flex-col text-right">
                        <span className="text-xs text-muted-foreground uppercase tracking-wider mb-0.5">Total</span>
                        <span className="font-bold">{Number(order.totalAmount).toFixed(3)} KWD</span>
                      </div>

                      <div className="p-2 hover:bg-muted rounded-full">
                        {isExpanded ? <ChevronUp size={20}/> : <ChevronDown size={20}/>}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expanded State */}
                {isExpanded && (
                  <div className="border-t p-5 sm:p-6 bg-muted/10 space-y-6">
                    {/* Active Order Support Banner */}
                    {active && (
                      <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-3 text-primary">
                          <Phone className="w-5 h-5" />
                          <span className="font-medium">Need help with your order? Contact us directly.</span>
                        </div>
                        <div className="flex gap-4">
                          <a href="tel:97973479" className="font-bold hover:underline">97973479</a>
                          <a href="tel:51759962" className="font-bold hover:underline">51759962</a>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Products Summary Preview */}
                      <div>
                        <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-3">Items ({order.items?.length || 0})</h4>
                        <div className="space-y-3">
                          {order.items?.slice(0, 3).map((item: any) => (
                            <div key={item.id} className="flex justify-between items-center text-sm border-b pb-2 last:border-0">
                              <span className="truncate pr-4 flex-1 font-medium">{item.productMetadata?.name || item.productMetadata?.title || 'Product'}</span>
                              <span className="text-muted-foreground whitespace-nowrap">x{item.quantity}</span>
                            </div>
                          ))}
                          {order.items?.length > 3 && (
                            <p className="text-xs text-muted-foreground pt-1">+ {order.items.length - 3} more items</p>
                          )}
                        </div>
                      </div>

                      {/* Delivery Info */}
                      <div>
                        <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-3">Delivery Address</h4>
                        <div className="bg-background p-4 rounded-xl border text-sm">
                          <p className="font-medium mb-1">{order.shippingAddress?.name || '—'}</p>
                          <p className="text-muted-foreground">{order.shippingAddress?.addressLine1 || '—'}</p>
                          <p className="text-muted-foreground">{[order.shippingAddress?.city, order.shippingAddress?.country].filter(Boolean).join(', ')}</p>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 flex justify-end">
                      <Link 
                        href={`/account/orders/${order.id}`}
                        className="bg-primary text-primary-foreground px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-primary/90 transition-colors"
                      >
                        View Full Details & Tracking
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
