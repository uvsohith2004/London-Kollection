"use client"

import * as React from "react"
import { Plus, Search, Loader2 } from "lucide-react"
import { useInfiniteAdminProductsQuery } from "../queries"
import { useDeleteProductMutation } from "../mutations"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { ProductForm } from "./product-form"
import {
  ProductLayoutSelection,
  ProductLayoutType,
} from "./product/product-layout-selection"
import { ProductGrid } from "./product/product-grid"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { useDebounce } from "@/hooks/use-debounce"

interface ProductsTabProps {
  initialData: any
  initialQuery: string
}

export function ProductsTab({ initialData, initialQuery }: ProductsTabProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [search, setSearch] = React.useState(initialQuery || "")
  const debouncedSearch = useDebounce(search, 500)

  const [layout, setLayout] = React.useState<ProductLayoutType>("table")
  const [isCreating, setIsCreating] = React.useState(false)
  const [editingProduct, setEditingProduct] = React.useState<any>(null)

  // Sync debounced search to URL
  React.useEffect(() => {
    const params = new URLSearchParams(searchParams.toString())
    if (debouncedSearch) {
      params.set("q", debouncedSearch)
    } else {
      params.delete("q")
    }
    // We don't want to replace if it hasn't changed to avoid unnecessary history states
    if (params.get("q") !== searchParams.get("q")) {
      router.replace(`${pathname}?${params.toString()}`)
    }
  }, [debouncedSearch, pathname, router, searchParams])

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteAdminProductsQuery(
      { q: debouncedSearch },
      debouncedSearch === initialQuery ? initialData : undefined
    )

  const { mutate: deleteProduct } = useDeleteProductMutation()

  const products = React.useMemo(() => {
    return data?.pages.flatMap((page) => page.items || page || []) || []
  }, [data])

  // Intersection observer for infinite loading
  const observerRef = React.useRef<IntersectionObserver | null>(null)
  const lastElementRef = React.useCallback(
    (node: HTMLDivElement | null) => {
      if (isLoading || isFetchingNextPage) return
      if (observerRef.current) observerRef.current.disconnect()

      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0]?.isIntersecting && hasNextPage) {
          fetchNextPage()
        }
      })

      if (node) observerRef.current.observe(node)
    },
    [isLoading, isFetchingNextPage, hasNextPage, fetchNextPage]
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        {(isCreating || editingProduct) && (
          <div className="mb-8 animate-in duration-300 fade-in slide-in-from-top-4">
            <ProductForm
              initialData={editingProduct}
              onSuccess={() => {
                setIsCreating(false)
                setEditingProduct(null)
              }}
              onCancel={() => {
                setIsCreating(false)
                setEditingProduct(null)
              }}
            />
          </div>
        )}
        <div className="relative w-full max-w-sm">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 bg-background pl-10 outline-none rounded full w-full"
          />
        </div>
        <div className="flex items-center gap-3">
          <ProductLayoutSelection layout={layout} setLayout={setLayout} />
          {!isCreating && !editingProduct && (
            <Button
              onClick={() => setIsCreating(true)}
              className="h-10 rounded-full px-6 font-bold tracking-widest uppercase"
            >
              <Plus className="mr-2 h-4 w-4" /> Add Product
            </Button>
          )}
        </div>
      </div>

      <div className="min-h-100">
        {isLoading && products.length === 0 ? (
          <div className="flex h-40 items-center justify-center rounded-3xl border border-border/40 bg-card">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <ProductGrid
              products={products}
              layout={layout}
              onEdit={(product) => {
                setEditingProduct(product)
                setIsCreating(false)
                window.scrollTo({ top: 0, behavior: "smooth" })
              }}
              onDelete={(id) => deleteProduct(id)}
            />

            <div
              ref={lastElementRef}
              className="mt-6 flex h-10 items-center justify-center"
            >
              {isFetchingNextPage && (
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
