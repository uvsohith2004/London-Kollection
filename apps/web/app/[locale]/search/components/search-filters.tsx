"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select"
import { cn } from "@workspace/ui/lib/utils"
import { useSettings } from "@/components/providers/settings-provider"

const CATEGORIES = [
  { label: "Fashion", value: "fashion" },
  { label: "Fragrance", value: "fragrance" },
  { label: "Accessories", value: "accessories" },
  { label: "Home Goods", value: "home" },
]

export function SearchFilters({ className }: { className?: string }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { settings } = useSettings()

  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "")
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "")
  
  const currentCategories = searchParams.get("category")?.split(",") || []
  const currentSort = searchParams.get("sort") || "newest"

  const updateFilters = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString())
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === "") {
        params.delete(key)
      } else {
        params.set(key, value)
      }
    })

    router.push(`${pathname}?${params.toString()}`)
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

      {/* Categories */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold tracking-widest uppercase text-foreground">Category</h3>
        <div className="flex flex-col gap-2">
          {CATEGORIES.map(cat => {
            const isSelected = currentCategories.includes(cat.value)
            return (
              <button
                key={cat.value}
                onClick={() => toggleCategory(cat.value)}
                className="flex items-center gap-3 text-sm py-1.5 transition-colors group text-left"
              >
                <div className={cn(
                  "w-5 h-5 rounded-sm border flex items-center justify-center transition-all",
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
                  "font-medium transition-colors",
                  isSelected ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
                )}>
                  {cat.label}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="h-px bg-border/40 w-full" />

      {/* Price Range */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold tracking-widest uppercase text-foreground">Price ({settings.defaultCurrency || "KWD"})</h3>
        <div className="flex items-center gap-3">
          <div className="space-y-1.5 flex-1">
            <Label htmlFor="min-price" className="text-xs text-muted-foreground">Min</Label>
            <Input 
              id="min-price"
              type="number" 
              placeholder="0"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="bg-secondary/20 border-border/50 h-10"
            />
          </div>
          <div className="pt-6 text-muted-foreground">-</div>
          <div className="space-y-1.5 flex-1">
            <Label htmlFor="max-price" className="text-xs text-muted-foreground">Max</Label>
            <Input 
              id="max-price"
              type="number" 
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
            router.push(pathname)
          }}
        >
          Clear All Filters
        </Button>
      </div>
    </div>
  )
}
