import * as React from "react"
import { Edit2, Trash2, MoreVertical } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose, DialogTrigger } from "@workspace/ui/components/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@workspace/ui/components/dropdown-menu"

interface ProductListCardProps {
  product: any
  onEdit: (product: any) => void
  onDelete: (productId: string) => void
}

export function ProductListCard({ product, onEdit, onDelete }: ProductListCardProps) {
  const imageUrl = product.images?.[0]?.url || product.images?.[0]?.asset?.webp?.url

  return (
    <div className="group flex flex-col sm:flex-row items-center overflow-hidden rounded-3xl border border-border/40 bg-card transition-all hover:border-border/80 hover:shadow-md p-3 gap-6">
      <div className="relative h-24 w-24 sm:h-32 sm:w-32 shrink-0 rounded-2xl bg-muted/30 overflow-hidden">
        {imageUrl ? (
          <img src={imageUrl} alt={product.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[10px] text-muted-foreground uppercase tracking-widest">
            No Image
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col py-2 w-full sm:w-auto">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-medium text-lg text-foreground">{product.title}</h3>
            <p className="text-sm text-muted-foreground mt-1">{product.categories?.[0]?.category?.title || 'Uncategorized'}</p>
          </div>
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${product.published ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'}`}>
            {product.published ? 'Published' : 'Draft'}
          </span>
        </div>

        <div className="mt-auto flex items-center justify-between pt-4">
          <p className="font-mono font-medium text-foreground">{product.price} KWD</p>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => onEdit(product)} className="h-8 px-4 rounded-full">
              Edit
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                <MoreVertical className="h-4 w-4" />
              </Button>}>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40 rounded-xl">
                <Dialog>
                  <DialogTrigger render={<DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                  </DropdownMenuItem>}>
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
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  )
}
