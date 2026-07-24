"use client"

import { useState, useMemo, useEffect } from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select"
import { cn } from "@workspace/ui/lib/utils"
import { useSettings } from "@/components/providers/settings-provider"
import { NumberInput } from "@workspace/ui/components/number-input"
import { useSuspenseInfiniteQuery } from "@tanstack/react-query"
import { productQueries } from "@/queries/products.queries"
import type { SearchQuery } from "@workspace/api-contracts"
import { X, Search } from "lucide-react"

export function SearchFilters({ className }: { className?: string }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { settings } = useSettings()

  const params: SearchQuery = useMemo(() => ({
    q: searchParams.get("q") || undefined,
    categoryId: searchParams.get("category") || undefined,
    minPrice: searchParams.get("minPrice") || undefined,
    maxPrice: searchParams.get("maxPrice") || undefined,
    sortBy: (searchParams.get("sort") as any) || undefined,
    isBranded: (searchParams.get("branded") as any) || undefined,
  }), [searchParams])

  const { data } = useSuspenseInfiniteQuery(productQueries.listInfinite(params))

  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "")
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "")
  const [catSearch, setCatSearch] = useState("")

  useEffect(() => {
    setMinPrice(searchParams.get("minPrice") || "")
    setMaxPrice(searchParams.get("maxPrice") || "")
  }, [searchParams])
  
  const currentCategories = searchParams.get("category")?.split(",") || []
  const currentSort = searchParams.get("sort") || "newest"
  const currentBranded = searchParams.get("branded")

  const updateFilters = (updates: Record<string, string | null>) => {
    const newParams = new URLSearchParams(searchParams.toString())
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === "") {
        newParams.delete(key)
      } else {
        newParams.set(key, value)
      }
    })

    router.push(`${pathname}?${newParams.toString()}`)
  }

  const toggleCategory = (catValue: string) => {
    const isSelected = currentCategories.includes(catValue)
    let newCategories = [...currentCategories]
    
    if (isSelected) {
      newCategories = newCategories.filter(c => c !== catValue)
    } else {
      newCategories.push(catValue)
    }
    
    updateFilters({ category: newCategories.length > 0 ? newCategories.join(",") : null })
  }

  const handlePriceApply = () => {
    updateFilters({
      minPrice: minPrice || null,
      maxPrice: maxPrice || null
    })
  }

  // Calculate dynamic categories
  const sortedCategories = useMemo(() => {
    const categoriesMap = new Map<string, { label: string; count: number }>()
    data?.pages.flatMap(p => p.items).forEach(item => {
      if (item.categories) {
        item.categories.forEach((cat: any) => {
          if (!cat.category) return;
          const slug = cat.category.slug
          const name = cat.category.name
          if (categoriesMap.has(slug)) {
            categoriesMap.get(slug)!.count++
          } else {
            categoriesMap.set(slug, { label: name, count: 1 })
          }
        })
      }
    })
    return Array.from(categoriesMap.entries())
      .map(([slug, data]) => ({ value: slug, label: data.label, count: data.count }))
      .sort((a, b) => b.count - a.count)
  }, [data])

  const filteredCategories = sortedCategories.filter(c => c.label.toLowerCase().includes(catSearch.toLowerCase()))
  const visibleCategories = catSearch ? filteredCategories : sortedCategories.slice(0, 5)

  // Identify any active price filter
  const isPriceActive = searchParams.has("minPrice") || searchParams.has("maxPrice")

  return (
    <div className={cn("space-y-8", className)} dir="auto">
      
      {/* Sort By */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold tracking-widest uppercase text-foreground">Sort By</h3>
        <Select 
          value={currentSort} 
          onValueChange={(value) => updateFilters({ sort: value })}
        >
          <SelectTrigger className="w-full h-12 bg-secondary/20 border-border/50 text-sm">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest Arrivals</SelectItem>
            <SelectItem value="price-asc">Price: Low to High</SelectItem>
            <SelectItem value="price-desc">Price: High to Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="h-px bg-border/40 w-full" />

      {/* Brand */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-semibold tracking-widest uppercase text-foreground">Brand</h3>
          {currentBranded && (
            <button 
              onClick={() => updateFilters({ branded: null })}
              className="text-muted-foreground hover:text-foreground transition-colors p-1"
              aria-label="Clear brand filter"
            >
              <X size={14} />
            </button>
          )}
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => updateFilters({ branded: "true" })}
            className={cn(
              "flex-1 px-4 py-2.5 border rounded-lg text-sm font-medium transition-all",
              currentBranded === "true" 
                ? "border-foreground bg-foreground text-background shadow-sm" 
                : "border-border/60 bg-transparent text-foreground hover:border-foreground/50 hover:bg-secondary/10"
            )}
          >
            Branded
          </button>
          <button 
            onClick={() => updateFilters({ branded: "false" })}
            className={cn(
              "flex-1 px-4 py-2.5 border rounded-lg text-sm font-medium transition-all",
              currentBranded === "false" 
                ? "border-foreground bg-foreground text-background shadow-sm" 
                : "border-border/60 bg-transparent text-foreground hover:border-foreground/50 hover:bg-secondary/10"
            )}
          >
            Other
          </button>
        </div>
      </div>

      <div className="h-px bg-border/40 w-full" />

      {/* Categories */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-semibold tracking-widest uppercase text-foreground">Category</h3>
          {currentCategories.length > 0 && (
            <button 
              onClick={() => updateFilters({ category: null })}
              className="text-muted-foreground hover:text-foreground transition-colors p-1"
              aria-label="Clear category filter"
            >
              <X size={14} />
            </button>
          )}
        </div>
        
        {sortedCategories.length > 5 && (
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              type="text" 
              placeholder="Search categories..." 
              value={catSearch}
              onChange={(e) => setCatSearch(e.target.value)}
              className="pl-9 bg-secondary/20 border-border/50 h-9 text-xs"
            />
          </div>
        )}

        <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
          {visibleCategories.map(cat => {
            const isSelected = currentCategories.includes(cat.value)
            return (
              <button
                key={cat.value}
                onClick={() => toggleCategory(cat.value)}
                className="flex items-center gap-3 text-sm py-1.5 transition-colors group text-left w-full"
              >
                <div className={cn(
                  "w-5 h-5 rounded-sm border flex items-center justify-center transition-all shrink-0",
                  isSelected 
                    ? "bg-foreground border-foreground text-background" 
                    : "border-border/60 bg-transparent group-hover:border-foreground/50"
                )}>
                  {isSelected && (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
                <span className={cn(
                  "font-medium transition-colors flex-1 truncate",
                  isSelected ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
                )}>
                  {cat.label}
                </span>
                <span className="text-xs text-muted-foreground/60 tabular-nums">
                  {cat.count}
                </span>
              </button>
            )
          })}
          {visibleCategories.length === 0 && (
            <div className="text-xs text-muted-foreground py-2">No categories found.</div>
          )}
        </div>
      </div>

      <div className="h-px bg-border/40 w-full" />

      {/* Price Range */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-semibold tracking-widest uppercase text-foreground">Price ({settings.defaultCurrency || "KWD"})</h3>
          {isPriceActive && (
            <button 
              onClick={() => {
                setMinPrice("")
                setMaxPrice("")
                updateFilters({ minPrice: null, maxPrice: null })
              }}
              className="text-muted-foreground hover:text-foreground transition-colors p-1"
              aria-label="Clear price filter"
            >
              <X size={14} />
            </button>
          )}
        </div>
        <div className="flex items-center gap-3">
          <div className="space-y-1.5 flex-1">
            <Label htmlFor="min-price" className="text-xs text-muted-foreground">Min</Label>
            <NumberInput
              id="min-price"
              placeholder="0"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="bg-secondary/20 border-border/50 h-10"
            />
          </div>
          <div className="pt-6 text-muted-foreground">-</div>
          <div className="space-y-1.5 flex-1">
            <Label htmlFor="max-price" className="text-xs text-muted-foreground">Max</Label>
            <NumberInput 
              id="max-price"
              placeholder="1000"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="bg-secondary/20 border-border/50 h-10"
            />
          </div>
        </div>
        <Button 
          variant="outline" 
          className="w-full text-xs tracking-widest uppercase font-semibold border-border/50 hover:bg-secondary/20 h-10"
          onClick={handlePriceApply}
        >
          Apply Price
        </Button>
      </div>

      <div className="pt-4">
        <Button 
          variant="ghost" 
          className="w-full text-xs text-muted-foreground hover:text-foreground hover:bg-secondary/10 tracking-widest uppercase font-semibold h-10"
          onClick={() => {
            setMinPrice("")
            setMaxPrice("")
            setCatSearch("")
            router.push(pathname)
          }}
        >
          Clear All Filters
        </Button>
      </div>
    </div>
  )
}
