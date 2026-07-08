"use client"

import * as React from "react"
import { Plus, Loader2, Trash2, X, GripVertical, Check, ChevronsUpDown } from "lucide-react"
import { useForm } from "react-hook-form"

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

import { 
  useAdminFeaturedPiecesQuery, 
  useAdminProductsQuery 
} from "../../queries"
import { 
  useSetFeaturedPiecesMutation,
  useUpdateFeaturedPieceStatusMutation
} from "../../mutations"

import { Button } from "@workspace/ui/components/button"
import { Label } from "@workspace/ui/components/label"
import { Switch } from "@workspace/ui/components/switch"
import { cn } from "@workspace/ui/lib/utils"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@workspace/ui/components/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover"

function SortableItem({ 
  item, 
  onDelete,
  onStatusChange 
}: { 
  item: any
  onDelete: () => void
  onStatusChange: (isActive: boolean) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id || item.productId })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const product = item.product || item

  return (
    <div 
      ref={setNodeRef} 
      style={style}
      className={cn(
        "flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-card border-b border-border/40 group",
        isDragging ? "opacity-50 z-50 bg-muted/50" : "hover:bg-muted/20"
      )}
    >
      <div className="flex items-center gap-4">
        {/* Drag Handle */}
        <div 
          {...attributes} 
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-2 text-muted-foreground hover:text-foreground touch-none"
        >
          <GripVertical className="h-5 w-5" />
        </div>
        
        {/* Thumbnail */}
        <div className="h-12 w-12 rounded-xl bg-muted overflow-hidden flex items-center justify-center shrink-0">
          {product?.images && product.images.length > 0 ? (
            <img src={product.images[0].url} alt={product.title} className="h-full w-full object-cover" />
          ) : (
            <span className="text-[10px] text-muted-foreground">IMG</span>
          )}
        </div>
        <div>
          <p className="font-medium text-foreground">{product?.title || "Unknown Product"}</p>
          <p className="text-xs text-muted-foreground">{product?.price} KWD</p>
        </div>
      </div>
      
      <div className="flex items-center gap-4 self-end sm:self-auto mt-4 sm:mt-0">
        {item.id && ( // Only show switch if it's already saved (has an id from db)
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Active</span>
            <Switch 
              checked={item.isActive} 
              onCheckedChange={onStatusChange} 
            />
          </div>
        )}
        <Button 
          variant="ghost" 
          size="icon"
          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
          onClick={onDelete}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

export default function FeaturedPiecesPage() {
  const { data: response, isLoading } = useAdminFeaturedPiecesQuery()
  const { mutate: setFeaturedPieces, isPending: isSaving } = useSetFeaturedPiecesMutation()
  const { mutate: updateStatus } = useUpdateFeaturedPieceStatusMutation()

  const [isCreating, setIsCreating] = React.useState(false)
  const [sortedItems, setSortedItems] = React.useState<any[]>([])

  React.useEffect(() => {
    const currentItems = response?.items || response?.data || (Array.isArray(response) ? response : [])
    if (currentItems.length > 0) {
      setSortedItems([...currentItems].sort((a: any, b: any) => (a.sortOrder || 0) - (b.sortOrder || 0)))
    } else {
      setSortedItems([])
    }
  }, [response])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    
    if (over && active.id !== over.id) {
      setSortedItems((items) => {
        const oldIndex = items.findIndex((i) => (i.id || i.productId) === active.id)
        const newIndex = items.findIndex((i) => (i.id || i.productId) === over.id)
        return arrayMove(items, oldIndex, newIndex)
      })
    }
  }

  const handleSaveOrder = () => {
    const payload = sortedItems.map((item, index) => ({
      productId: item.productId,
      sortOrder: index * 10
    }))
    setFeaturedPieces({ items: payload })
  }

  const handleDeleteLocal = (idOrProductId: string) => {
    setSortedItems(items => items.filter(i => (i.id || i.productId) !== idOrProductId))
  }

  const handleStatusChange = (id: string, isActive: boolean) => {
    updateStatus({ id, data: { isActive } })
  }

  const handleAddProduct = (product: any) => {
    if (sortedItems.find(i => i.productId === product.id)) {
      alert("Product is already in the list.")
      return
    }
    setSortedItems([...sortedItems, { productId: product.id, product, isActive: true }])
    setIsCreating(false)
  }

  return (
    <div className="space-y-6 pb-16 font-sans">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-medium text-foreground">Featured Pieces</h2>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={handleSaveOrder}
            disabled={isSaving}
          >
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save List
          </Button>
          {!isCreating && (
            <Button 
              onClick={() => setIsCreating(true)}
              className="h-10 px-6 rounded-full font-bold tracking-widest uppercase"
            >
              <Plus className="mr-2 h-4 w-4" /> Add Product
            </Button>
          )}
        </div>
      </div>

      <div 
        className={cn(
          "overflow-hidden transition-all duration-500 ease-in-out",
          isCreating ? "max-h-[500px] opacity-100 mb-8" : "max-h-0 opacity-0"
        )}
      >
        <div className="rounded-3xl border border-border/40 bg-card p-6 shadow-sm sm:p-8 relative">
          <button 
            onClick={() => setIsCreating(false)}
            className="absolute top-6 right-6 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
          
          <h3 className="font-heading text-2xl font-light mb-6 text-foreground">
            Add Featured Piece
          </h3>
          
          {isCreating && (
            <AddFeaturedPieceForm onAdd={handleAddProduct} onCancel={() => setIsCreating(false)} />
          )}
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-border/40 bg-card">
        {isLoading ? (
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="flex flex-col">
            {sortedItems.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground">
                No featured pieces configured.
              </div>
            ) : (
              <DndContext 
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext 
                  items={sortedItems.map(i => i.id || i.productId)}
                  strategy={verticalListSortingStrategy}
                >
                  {sortedItems.map((item) => (
                    <SortableItem 
                      key={item.id || item.productId} 
                      item={item} 
                      onDelete={() => handleDeleteLocal(item.id || item.productId)}
                      onStatusChange={(isActive) => {
                        if (item.id) handleStatusChange(item.id, isActive)
                      }}
                    />
                  ))}
                </SortableContext>
              </DndContext>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function AddFeaturedPieceForm({ onAdd, onCancel }: { onAdd: (product: any) => void, onCancel: () => void }) {
  const { data: productsData } = useAdminProductsQuery()
  const products = productsData?.items || []
  const [open, setOpen] = React.useState(false)
  const [selectedProduct, setSelectedProduct] = React.useState<any>(null)

  return (
    <div className="space-y-6">
      <div className="space-y-2.5">
        <Label className="text-xs font-medium text-muted-foreground">Select Product</Label>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger render={
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between h-12 rounded-xl bg-muted/40 border-transparent hover:bg-muted/60"
            >
              {selectedProduct ? selectedProduct.title : "Search product..."}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          } />
          <PopoverContent className="w-[400px] p-0" align="start">
            <Command>
              <CommandInput placeholder="Search products..." />
              <CommandList>
                <CommandEmpty>No product found.</CommandEmpty>
                <CommandGroup>
                  {products.map((product: any) => (
                    <CommandItem
                      key={product.id}
                      value={product.title}
                      onSelect={() => {
                        setSelectedProduct(product)
                        setOpen(false)
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          selectedProduct?.id === product.id ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {product.title}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex justify-end gap-3 border-t border-border/40 pt-6">
        <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button 
          type="button" 
          disabled={!selectedProduct}
          onClick={() => onAdd(selectedProduct)}
          className="font-bold tracking-widest uppercase"
        >
          Add Product
        </Button>
      </div>
    </div>
  )
}
