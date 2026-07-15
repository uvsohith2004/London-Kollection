"use client"

import * as React from "react"
import { Search, Filter, X } from "lucide-react"
import { Input } from "@workspace/ui/components/input"
import { Button } from "@workspace/ui/components/button"
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@workspace/ui/components/popover"

const ORDER_STATUSES = [
  "Pending", "Confirmed", "Preparing", "Packed", "Shipped", 
  "Out for Delivery", "Delivered", "Completed", "Cancelled", 
  "Return Requested", "Return Approved", "Return Rejected", 
  "Returned", "Exchange Requested", "Exchange Approved", "Exchange Rejected"
]

const PAYMENT_STATUSES = ["Pending", "Paid", "Failed", "Refunded", "Partially Refunded"]
const PAYMENT_METHODS = ["Cash on Delivery", "Manual"]

interface OrderFilterBarProps {
  filters: {
    search?: string
    status?: string
    paymentStatus?: string
    paymentMethod?: string
    dateFrom?: string
    dateTo?: string
  }
  onFilterChange: (filters: any) => void
}

export function OrderFilterBar({ filters, onFilterChange }: OrderFilterBarProps) {
  const [localSearch, setLocalSearch] = React.useState(filters.search || "")

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onFilterChange({ ...filters, search: localSearch })
  }

  const activeFilterCount = [filters.status, filters.paymentStatus, filters.paymentMethod, filters.dateFrom, filters.dateTo].filter(Boolean).length

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between w-full">
      <form onSubmit={handleSearchSubmit} className="relative flex-1 sm:max-w-md">
        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search Order ID, Customer Name, Email..."
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          className="h-10 w-full rounded-full border-border/40 pr-4 pl-9 transition-all hover:bg-muted/20 focus-visible:ring-1 focus-visible:ring-primary/20"
        />
        {localSearch && (
          <button
            type="button"
            onClick={() => { setLocalSearch(""); onFilterChange({ ...filters, search: "" }) }}
            className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </form>

      <div className="flex items-center gap-2">
        <Popover>
          <PopoverTrigger render={
            <Button variant="outline" className="h-10 rounded-full border-border/40 bg-card hover:bg-muted/20 relative">
              <Filter className="mr-2 h-4 w-4" />
              Advanced Filters
              {activeFilterCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground shadow-sm ring-2 ring-background">
                  {activeFilterCount}
                </span>
              )}
            </Button>
          } />
          <PopoverContent className="w-80 rounded-2xl p-4 shadow-lg" align="end">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-border/40">
                <h4 className="font-medium text-foreground">Filters</h4>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => onFilterChange({ search: filters.search })}
                  className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
                >
                  Reset All
                </Button>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</label>
                <select 
                  className="w-full h-9 px-3 rounded-md border border-input bg-transparent text-sm focus:ring-1 focus:ring-primary"
                  value={filters.status || ""}
                  onChange={(e) => onFilterChange({ ...filters, status: e.target.value || undefined })}
                >
                  <option value="">All Statuses</option>
                  {ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Payment Status</label>
                <select 
                  className="w-full h-9 px-3 rounded-md border border-input bg-transparent text-sm focus:ring-1 focus:ring-primary"
                  value={filters.paymentStatus || ""}
                  onChange={(e) => onFilterChange({ ...filters, paymentStatus: e.target.value || undefined })}
                >
                  <option value="">All Payment Statuses</option>
                  {PAYMENT_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Payment Method</label>
                <select 
                  className="w-full h-9 px-3 rounded-md border border-input bg-transparent text-sm focus:ring-1 focus:ring-primary"
                  value={filters.paymentMethod || ""}
                  onChange={(e) => onFilterChange({ ...filters, paymentMethod: e.target.value || undefined })}
                >
                  <option value="">All Methods</option>
                  {PAYMENT_METHODS.map(s => <option key={s} value={s.toLowerCase().replace(/ /g, "_")}>{s}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/40">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">From Date</label>
                  <Input 
                    type="date" 
                    className="h-9 text-sm"
                    value={filters.dateFrom || ""}
                    onChange={(e) => onFilterChange({ ...filters, dateFrom: e.target.value || undefined })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">To Date</label>
                  <Input 
                    type="date" 
                    className="h-9 text-sm"
                    value={filters.dateTo || ""}
                    onChange={(e) => onFilterChange({ ...filters, dateTo: e.target.value || undefined })}
                  />
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
}
