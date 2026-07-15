"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Search as SearchIcon, Loader2, X } from "lucide-react";
import { Input } from "@workspace/ui/components/input";

import { cn } from "@workspace/ui/lib/utils";
import { useDebounce } from "@/hooks/use-debounce";
import { useSearchQuery } from "./search.queries";
import { useInteractionStore } from "@/stores/use-interaction-store";
import { useRouter } from "next/navigation";

interface SearchProps {
  className?: string;
  isMobile?: boolean;
}

export function Search({ className, isMobile }: SearchProps) {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const debouncedQuery = useDebounce(query, 500); // Wait 500ms before triggering API
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const { data, isLoading, isError } = useSearchQuery(debouncedQuery);

  const handleSearchSubmit = () => {
    if (query.trim().length > 0) {
      useInteractionStore.getState().trackSearch(query.trim());
      setIsFocused(false);
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const hasResults = data?.items && data.items.length > 0;
  const showDropdown = isFocused && query.length >= 3;

  return (
    <div ref={containerRef} className={cn("relative group flex-1 w-full", className)}>
      <div className={cn("absolute inset-y-0 left-0 flex items-center pointer-events-none text-muted-foreground transition-colors group-focus-within:text-foreground", isMobile ? "pl-3" : "pl-4")}>
        <SearchIcon className={isMobile ? "h-4 w-4" : "h-5 w-5"} />
      </div>
      
      <Input
        type="text"
        placeholder={isMobile ? "Search..." : "Search for luxury apparel, accessories..."}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            handleSearchSubmit();
          }
        }}
        className={cn(
          "w-full bg-muted/30 border-border/50 rounded-full focus-visible:ring-1 focus-visible:ring-foreground focus-visible:bg-transparent transition-all placeholder:text-muted-foreground/70",
          isMobile ? "h-10 pl-10 pr-10 text-sm" : "h-12 pl-12 pr-12 text-base"
        )}
      />
      
      {query && (
        <button 
          onClick={() => { setQuery(""); setIsFocused(true); }}
          className={cn("absolute inset-y-0 right-0 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors", isMobile ? "pr-3 w-10" : "pr-4 w-12")}
        >
          <X className="h-4 w-4" />
        </button>
      )}

      {/* Dropdown Card */}
      {showDropdown && (
        <div className="absolute top-[calc(100%+8px)] left-0 right-0 bg-background border border-border shadow-[0_10px_30px_-15px_rgba(0,0,0,0.3)] rounded-2xl overflow-hidden z-50">
          
          {isLoading && (
            <div className="flex flex-col items-center justify-center p-8 text-muted-foreground gap-3">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="text-sm">Searching our collection...</span>
            </div>
          )}

          {!isLoading && isError && (
            <div className="p-6 text-center text-destructive text-sm">
              Failed to fetch search results. Please try again.
            </div>
          )}

          {!isLoading && !isError && data?.items.length === 0 && (
            <div className="p-8 text-center text-muted-foreground text-sm">
              No products found for &quot;<span className="font-medium text-foreground">{query}</span>&quot;
            </div>
          )}

          {!isLoading && !isError && hasResults && (
            <div className="flex flex-col max-h-[60vh] overflow-y-auto custom-scrollbar">
              <div className="p-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Products
              </div>
              {data.items.map((product) => {
                const primaryImage = product.images?.find((img) => img.isPrimary) || product.images?.[0];
                return (
                  <Link 
                    key={product.id} 
                    href={`/products/${product.id}`}
                    onClick={() => setTimeout(() => setIsFocused(false), 100)}
                    className="flex items-center gap-4 p-3 hover:bg-muted/50 transition-colors border-t border-border/30"
                  >
                    {primaryImage ? (
                      <div className="h-14 w-14 rounded-md overflow-hidden bg-muted shrink-0 relative">
                        <img 
                          src={primaryImage.url} 
                          alt={product.title} 
                          className="object-cover w-full h-full"
                        />
                      </div>
                    ) : (
                      <div className="h-14 w-14 rounded-md overflow-hidden bg-muted shrink-0 flex items-center justify-center">
                        <SearchIcon className="h-4 w-4 text-muted-foreground/50" />
                      </div>
                    )}
                    
                    <div className="flex flex-col flex-1 min-w-0">
                      <span className="text-sm font-medium text-foreground truncate">
                        {product.title}
                      </span>
                      <span className="text-xs text-muted-foreground truncate">
                        {product.variants?.[0]?.sku ?? ""}
                      </span>
                    </div>
                    
                    <div className="text-sm font-semibold whitespace-nowrap">
                      ${Number(product.price).toFixed(2)}
                    </div>
                  </Link>
                );
              })}
              
              <Link 
                href={`/search?q=${encodeURIComponent(query)}`}
                onClick={() => {
                  useInteractionStore.getState().trackSearch(query.trim());
                  setTimeout(() => setIsFocused(false), 100);
                }}
                className="p-3 bg-muted/30 text-center text-sm font-medium hover:bg-muted/50 transition-colors"
              >
                View all {data.pagination.total} results
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
