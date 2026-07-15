import * as React from "react"
import { Edit2, Trash2, MoreVertical } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
  DialogTrigger,
} from "@workspace/ui/components/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"

interface ProductBlockCardProps {
  product: any
  onEdit: (product: any) => void
  onDelete: (productId: string) => void
}

export function ProductBlockCard({
  product,
  onEdit,
  onDelete,
}: ProductBlockCardProps) {
  const imageUrl =
    product.images?.[0]?.url || product.images?.[0]?.asset?.webp?.url

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-3xl border border-border/40 bg-card transition-all hover:border-border/80 hover:shadow-md">
      <div className="relative aspect-square w-full overflow-hidden bg-muted/30">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
            No Image
          </div>
        )}

        <div className="absolute top-3 left-3">
          <span
            className={`inline-flex items-center rounded-full px-2 py-1 text-[10px] font-bold tracking-wider uppercase ${product.published ? "bg-green-500/90 text-white shadow-sm" : "bg-yellow-500/90 text-white shadow-sm"}`}
          >
            {product.published ? "Published" : "Draft"}
          </span>
        </div>

        <div className="absolute top-3 right-3 opacity-0 transition-opacity group-hover:opacity-100">
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-background/50 backdrop-blur hover:bg-background/80">
              <MoreVertical className="h-4 w-4" />
            </Button>}>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40 rounded-xl">
              <DropdownMenuItem onClick={() => onEdit(product)}>
                <Edit2 className="mr-2 h-4 w-4" /> Edit
              </DropdownMenuItem>
              <Dialog>
                <DialogTrigger
                  render={
                    <DropdownMenuItem
                      onSelect={(e) => e.preventDefault()}
                      className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" /> Delete
                    </DropdownMenuItem>
                  }
                ></DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Delete Product</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to delete {product.title}?
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <DialogClose
                      render={<Button variant="outline">Cancel</Button>}
                    />
                    <DialogClose
                      render={
                        <Button
                          variant="destructive"
                          onClick={() => onDelete(product.id)}
                        >
                          Delete
                        </Button>
                      }
                    />
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="flex flex-col gap-1 p-5">
        <h3
          className="truncate font-medium text-foreground"
          title={product.title}
        >
          {product.title}
        </h3>
        <p className="truncate text-sm text-muted-foreground">
          {product.categories?.[0]?.category?.title || "Uncategorized"}
        </p>
        <p className="mt-2 font-mono font-medium text-foreground">
          {product.price} KWD
        </p>
      </div>
    </div>
  )
}
