"use client"

import * as React from "react"
import { Plus, Search, Loader2, Edit2, Trash2 } from "lucide-react"
import { useAdminProductsQuery } from "../queries"
import { useDeleteProductMutation } from "../mutations"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose, DialogTrigger } from "@workspace/ui/components/dialog"
import { ProductForm } from "./product-form"

export function ProductsTab() {
  const [search, setSearch] = React.useState("")
  const [isCreating, setIsCreating] = React.useState(false)
  const [editingProduct, setEditingProduct] = React.useState<any>(null)

  const { data: response, isLoading } = useAdminProductsQuery({ q: search })
  const { mutate: deleteProduct } = useDeleteProductMutation()

  const products = response?.items || []

  return (
    <div className="space-y-6">
      {/* Action Bar */}
      <div className="flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input 
            placeholder="Search products..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 pl-10" 
          />
        </div>
        {!isCreating && !editingProduct && (
          <Button 
            onClick={() => setIsCreating(true)}
            className="h-10 px-6 rounded-full font-bold tracking-widest uppercase"
          >
            <Plus className="mr-2 h-4 w-4" /> Add Product
          </Button>
        )}
      </div>

      {/* Expandable Form Area */}
      {(isCreating || editingProduct) && (
        <div className="mb-8 animate-in fade-in slide-in-from-top-4 duration-300">
          <ProductForm 
            initialData={editingProduct} 
            onSuccess={() => { setIsCreating(false); setEditingProduct(null); }} 
            onCancel={() => { setIsCreating(false); setEditingProduct(null); }}
          />
        </div>
      )}

      {/* Data Grid */}
      <div className="overflow-hidden rounded-3xl border border-border/40 bg-card">
        {isLoading ? (
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="divide-y divide-border/40">
            {products.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground">
                No products found.
              </div>
            ) : (
              products.map((product: any) => (
                <div key={product.id} className="flex items-center justify-between p-4 hover:bg-muted/20 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-muted overflow-hidden flex items-center justify-center shrink-0">
                      {product.images && product.images.length > 0 ? (
                        <img src={product.images[0].url} alt={product.title} className="h-full w-full object-cover" />
                      ) : (
                        <span className="text-[10px] text-muted-foreground">IMG</span>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{product.title}</p>
                      <p className="text-xs text-muted-foreground font-mono">{product.price} KWD</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => {
                        setEditingProduct(product)
                        setIsCreating(false)
                        window.scrollTo({ top: 0, behavior: 'smooth' })
                      }}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Dialog>
                      <DialogTrigger
                        render={
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                          />
                        }
                      >
                        <Trash2 className="h-4 w-4" />
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Delete Product</DialogTitle>
                          <DialogDescription>
                            Are you sure you want to permanently delete this product? This action cannot be undone.
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                          <DialogClose render={<Button variant="outline" />}>
                            Cancel
                          </DialogClose>
                          <DialogClose 
                            render={
                              <Button 
                                variant="destructive" 
                                onClick={() => deleteProduct(product.id)}
                              />
                            }
                          >
                            Delete
                          </DialogClose>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}
