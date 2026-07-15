"use client"
import { useState, useEffect } from 'react';
import { Search, Filter, ChevronDown } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

interface OrderTopBarProps {
  initialSearch: string;
  initialStatus: string;
  orderCounts: {
    all: number;
    pending: number;
    shipped: number;
    delivered: number;
    cancelled: number;
  };
}

const OrderTopBar = ({
  initialSearch,
  initialStatus,
  orderCounts,
}: OrderTopBarProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [showFilters, setShowFilters] = useState(false);

  // Push search changes to URL with debounce
  useEffect(() => {
    // Prevent pushing to URL on initial mount if it matches
    if (searchQuery === initialSearch) return;

    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (searchQuery) {
        params.set('search', searchQuery);
      } else {
        params.delete('search');
      }
      router.replace(`?${params.toString()}`, { scroll: false });
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery, router, searchParams, initialSearch]);

  const setStatusFilter = (status: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (status && status !== 'All') {
      params.set('status', status);
    } else {
      params.delete('status');
    }
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  const statusFilter = initialStatus;

  return (
    <div className="mb-6 border-b border-border/60 pb-6">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by order number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-card text-foreground border border-border/60 rounded-xl outline-none focus:border-primary transition-colors text-sm"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center justify-center gap-2 px-5 py-2.5 border rounded-xl transition-colors ${
            showFilters
              ? 'bg-primary text-primary-foreground border-primary'
              : 'bg-card text-foreground border-border/60 hover:bg-muted/50'
          }`}
        >
          <Filter className="w-4 h-4" />
          <span className="text-sm font-medium">Filter</span>
          <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Filter Pills */}
      {showFilters && (
        <div className="mt-4 flex flex-wrap gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
          {[
            { id: 'All', label: 'All Orders', count: orderCounts.all },
            { id: 'Pending', label: 'Pending', count: orderCounts.pending },
            { id: 'Shipped', label: 'Shipped', count: orderCounts.shipped },
            { id: 'Delivered', label: 'Delivered', count: orderCounts.delivered },
            { id: 'Cancelled', label: 'Cancelled', count: orderCounts.cancelled },
          ].map((status) => (
            <button
              key={status.id}
              onClick={() => setStatusFilter(status.id)}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors border ${
                statusFilter === status.id
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-transparent text-muted-foreground hover:bg-muted/50 border-border/60'
              }`}
            >
              {status.label} <span className="ml-1 opacity-60">({status.count})</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderTopBar;
