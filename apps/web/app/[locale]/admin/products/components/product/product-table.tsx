import * as React from "react"
import { Edit2, Trash2, LayoutGrid } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose, DialogTrigger } from "@workspace/ui/components/dialog"

interface ProductTableProps {
  products: any[]
  onEdit: (product: any) => void
  onDelete: (productId: string) => void
}

export function ProductTable({ products, onEdit, onDelete }: ProductTableProps) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center border border-border/40 rounded-3xl bg-card">
        <LayoutGrid className="h-10 w-10 text-muted-foreground/30 mb-4" />
        <p className="text-muted-foreground font-medium">No products found</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-3xl border border-border/40 bg-card">
      <table className="w-full text-left text-sm">
        <thead className="bg-muted/30 text-muted-foreground">
          <tr>
            <th className="px-6 py-4 font-medium uppercase tracking-wider text-xs">Product</th>
            <th className="px-6 py-4 font-medium uppercase tracking-wider text-xs">Price</th>
            <th className="px-6 py-4 font-medium uppercase tracking-wider text-xs">Status</th>
            <th className="px-6 py-4 font-medium uppercase tracking-wider text-xs text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/40">
          {products.map((product) => (
            <tr key={product.id} className="hover:bg-muted/20 transition-colors">
              <td className="px-6 py-4">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-muted overflow-hidden flex items-center justify-center shrink-0">
                    {product.images && product.images.length > 0 ? (
                      <img src={product.images[0].url || product.images[0].asset?.webp?.url} alt={product.title} className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-[10px] text-muted-foreground">IMG</span>
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{product.title}</p>
                    {product.categories?.length > 0 && (
                      <p className="text-xs text-muted-foreground">{product.categories[0].category?.title}</p>
                    )}
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 font-mono text-muted-foreground">{product.price} KWD</td>
              <td className="px-6 py-4">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${product.published ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'}`}>
                  {product.published ? 'Published' : 'Draft'}
                </span>
              </td>
              <td className="px-6 py-4 text-right">
                <div className="flex items-center justify-end gap-2">
                  <Button variant="ghost" size="icon" onClick={() => onEdit(product)}>
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Dialog>
                    <DialogTrigger render={<Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10 hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>}>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Delete Product</DialogTitle>
                        <DialogDescription>
                          Are you sure you want to delete {product.title}?
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <DialogClose render={<Button variant="outline">Cancel</Button>} />
                        <DialogClose render={<Button variant="destructive" onClick={() => onDelete(product.id)}>Delete</Button>} />
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
