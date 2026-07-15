"use client"

import * as React from "react"
import { Plus, Loader2, Edit2, Trash2, X, Search, Check, ChevronsUpDown } from "lucide-react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { 
  useAdminFlashSaleQuery, 
  useAdminProductsQuery 
} from "../../queries"
import { 
  useToggleFlashSaleMutation,
  useCreateFlashSaleProductMutation,
  useUpdateFlashSaleProductMutation,
  useDeleteFlashSaleProductMutation
} from "../../mutations"

import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
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
import { DateTimePicker } from "@workspace/ui/components/datetime-picker"
import { StickySaveBar } from "@workspace/ui/components/sticky-save-bar"

export default function FlashSalePage() {
  const { data: response, isLoading } = useAdminFlashSaleQuery()
  const { mutate: toggleFlashSale } = useToggleFlashSaleMutation()
  const { mutate: deleteProduct } = useDeleteFlashSaleProductMutation()

  const [isCreating, setIsCreating] = React.useState(false)
  const [editingItem, setEditingItem] = React.useState<any>(null)

  const flashSaleData = response?.data
  const saleInfo = flashSaleData?.sale
  const isActive = saleInfo?.isActive || false
  const endTime = saleInfo?.scheduleEnd || ""
  const items = flashSaleData?.items || []

  const handleToggle = (val: boolean) => {
    if (val && !saleInfo?.scheduleEnd) {
      toast.error("End time is required before enabling flash sale.")
      return
    }
    toggleFlashSale({ isActive: val, endTime: saleInfo?.scheduleEnd })
  }

  const handleEndTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only update on blur or a 'save' button, but for simplicity we can just do a debounce or update on blur
  }

  const handleSaveEndTime = (val: string) => {
    if (!val && isActive) {
      toast.error("End time cannot be removed while flash sale is active.")
      return
    }
    toggleFlashSale({ isActive, endTime: val || undefined })
  }

  return (
    <div className="space-y-6 pb-16 font-sans">
      
      {/* Settings Card */}
      <div className="rounded-3xl border border-border/40 bg-card p-6 shadow-sm sm:p-8">
        <h3 className="text-lg font-medium text-foreground mb-6">Flash Sale Status</h3>
        
        {isLoading ? (
          <div className="flex h-12 items-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2">
            <div className="flex items-center gap-4">
              <Switch checked={isActive} onCheckedChange={handleToggle} />
              <div>
                <Label className="text-base">Enable Flash Sale</Label>
                <p className="text-xs text-muted-foreground">Turn on to show the flash sale banner and apply promotional pricing.</p>
              </div>
            </div>
            
            <div className="space-y-2.5">
              <Label className="text-xs font-medium text-muted-foreground">End Time <span className="text-destructive">*</span></Label>
              <DateTimePicker
                value={endTime}
                onChange={handleSaveEndTime}
              />
              <p className="text-xs text-muted-foreground">A countdown timer will appear and the sale will end automatically.</p>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between mt-10 mb-4">
        <h2 className="text-xl font-medium text-foreground">Promotional Products</h2>
        {!isCreating && !editingItem && (
          <Button 
            onClick={() => setIsCreating(true)}
            className="h-10 px-6 rounded-full font-bold tracking-widest uppercase"
          >
            <Plus className="mr-2 h-4 w-4" /> Add Product
          </Button>
        )}
      </div>

      <div 
        className={cn(
          "overflow-hidden transition-all duration-500 ease-in-out",
          (isCreating || editingItem) ? "max-h-[800px] opacity-100 mb-8" : "max-h-0 opacity-0"
        )}
      >
        <div className="rounded-3xl border border-border/40 bg-card p-6 shadow-sm sm:p-8 relative">
          <button 
            onClick={() => { setIsCreating(false); setEditingItem(null); }}
            className="absolute top-6 right-6 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
          
          <h3 className="font-heading text-2xl font-light mb-6 text-foreground">
            {editingItem ? "Edit Promotional Price" : "Add Product to Flash Sale"}
          </h3>
          
          { (isCreating || editingItem) && (
            <FlashSaleItemForm 
              initialData={editingItem} 
              onSuccess={() => { setIsCreating(false); setEditingItem(null); }} 
            />
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-3xl border border-border/40 bg-card">
        {isLoading ? (
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="divide-y divide-border/40">
            {items.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground">
                No products in flash sale.
              </div>
            ) : (
              items.map((item: any) => (
                <div key={item.id} className="flex items-center justify-between p-4 hover:bg-muted/20 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-muted overflow-hidden flex items-center justify-center shrink-0">
                      {item.product?.images && item.product.images.length > 0 ? (
                        <img src={item.product.images[0].url} alt={item.product.title} className="h-full w-full object-cover" />
                      ) : (
                        <span className="text-[10px] text-muted-foreground">IMG</span>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{item.product?.title || "Unknown Product"}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs font-bold text-destructive">{item.flashPrice} KWD</span>
                        <span className="text-xs text-muted-foreground line-through">{item.product?.price} KWD</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => {
                        setEditingItem(item)
                        setIsCreating(false)
                        window.scrollTo({ top: 0, behavior: 'smooth' })
                      }}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => {
                        if (confirm("Remove product from flash sale?")) {
                          deleteProduct(item.id)
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
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


function FlashSaleItemForm({ initialData, onSuccess }: { initialData?: any, onSuccess: () => void }) {
  const isEditing = !!initialData
  
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    defaultValues: {
      productId: initialData?.productId || "",
      flashPrice: initialData?.flashPrice || "",
      sortOrder: initialData?.sortOrder || 0,
    }
  })

  // We need to fetch products to allow selection
  const { data: productsData } = useAdminProductsQuery()
  const products = productsData?.items || []

  const createMutation = useCreateFlashSaleProductMutation()
  const updateMutation = useUpdateFlashSaleProductMutation()
  const isPending = createMutation.isPending || updateMutation.isPending

  const watchProductId = watch("productId")
  const selectedProduct = products.find((p: any) => p.id === watchProductId) || initialData?.product

  const onSubmit = (data: any) => {
    const payload = {
      ...data,
      flashPrice: Number(data.flashPrice),
      sortOrder: Number(data.sortOrder)
    }

    if (isEditing) {
      updateMutation.mutate({ id: initialData.id, data: payload }, { onSuccess })
    } else {
      createMutation.mutate(payload, { onSuccess })
    }
  }

  const softInputClass = "h-12 w-full rounded-xl border border-transparent bg-muted/40 px-4 text-sm transition-all hover:bg-muted/60 focus-visible:border-border focus-visible:bg-background focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:outline-none"

  return (
    <>
      <form id="flash-sale-product-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2.5">
          <Label className="text-xs font-medium text-muted-foreground">Select Product <span className="text-destructive">*</span></Label>
          <Popover>
            <PopoverTrigger
              role="combobox"
              className={cn(
                "flex items-center w-full justify-between rounded-xl h-12 bg-muted/40 font-normal hover:bg-muted/60 border-transparent px-4 text-sm",
                !watchProductId && "text-muted-foreground"
              )}
              disabled={isEditing}
            >
              {selectedProduct ? selectedProduct.title : "Search product..."}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </PopoverTrigger>
            <PopoverContent className="w-[300px] rounded-xl p-0 shadow-lg">
              <Command>
                <CommandInput placeholder="Search product..." className="border-none focus:ring-0" />
                <CommandList>
                  <CommandEmpty>No product found.</CommandEmpty>
                  <CommandGroup>
                    {products.map((product: any) => (
                      <CommandItem
                        key={product.id}
                        value={product.title}
                        onSelect={() => {
                          setValue("productId", product.id, { shouldValidate: true })
                        }}
                        className="rounded-lg py-2"
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            watchProductId === product.id ? "opacity-100" : "opacity-0"
                          )}
                        />
                        <div className="flex flex-col">
                           <span>{product.title}</span>
                           <span className="text-[10px] text-muted-foreground">{product.price} KWD</span>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          {errors.productId && <p className="text-xs text-destructive">Product is required.</p>}
        </div>

        <div className="space-y-2.5">
          <Label className="text-xs font-medium text-muted-foreground">Promotional Price <span className="text-destructive">*</span></Label>
          <Input 
            type="number"
            step="0.001"
            {...register("flashPrice", { required: true })}
            className={softInputClass}
            placeholder={selectedProduct ? `Original: ${selectedProduct.price}` : "0.000"}
          />
        </div>
      </div>

      </form>

      <StickySaveBar 
        formId="flash-sale-product-form"
        onCancel={onSuccess}
        isPending={isPending}
        disabled={!watchProductId}
        saveActionLabel={isEditing ? "Save Changes" : "Add to Flash Sale"}
        infoPanel={
          <div className="flex items-center gap-2">
            <span className="font-medium text-foreground">{isEditing ? "Edit Promotional Price" : "Add Product"}</span>
            <span className="text-muted-foreground">&bull;</span>
            <span>{selectedProduct?.title || "No product selected"}</span>
          </div>
        }
      />
    </>
  )
}
