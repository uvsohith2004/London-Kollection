"use client"

import * as React from "react"
import { Plus, Loader2, Edit2, Trash2, X, GripVertical } from "lucide-react"
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

import { useAdminHeroCarouselQuery } from "../queries"
import { 
  useCreateHeroCarouselMutation, 
  useUpdateHeroCarouselMutation, 
  useDeleteHeroCarouselMutation,
  useReorderHeroCarouselMutation
} from "../mutations"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Textarea } from "@workspace/ui/components/textarea"
import { cn } from "@workspace/ui/lib/utils"
import { MediaUploader } from "@/components/media-uploader"
import { Switch } from "@workspace/ui/components/switch"
import { StickySaveBar } from "@workspace/ui/components/sticky-save-bar"

function SortableSlideItem({ 
  item, 
  onEdit, 
  onDelete 
}: { 
  item: any
  onEdit: () => void
  onDelete: () => void 
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

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
        <div className="h-16 w-28 bg-muted rounded-md overflow-hidden shrink-0 relative">
          {item.image ? (
            <img 
              src={typeof item.image === "string" ? item.image : (item.image?.avif?.url || item.image?.url)} 
              alt={item.title || 'Slide'} 
              className="w-full h-full object-cover" 
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">No Image</div>
          )}
        </div>
        <div>
          <p className="font-medium text-foreground">{item.title || 'Untitled Slide'}</p>
          <p className="text-xs text-muted-foreground">{item.published ? 'Published' : 'Draft'}</p>
        </div>
      </div>
      
      <div className="flex items-center gap-2 self-end sm:self-auto mt-4 sm:mt-0">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={onEdit}
        >
          <Edit2 className="h-4 w-4" />
        </Button>
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

export default function HeroCarouselPage() {
  const [isCreating, setIsCreating] = React.useState(false)
  const [editingItem, setEditingItem] = React.useState<any>(null)

  const { data: response, isLoading } = useAdminHeroCarouselQuery()
  const { mutate: deleteSlide } = useDeleteHeroCarouselMutation()
  const { mutate: reorderSlides } = useReorderHeroCarouselMutation()

  const items = response?.items || []
  
  // Local state for optimistic drag and drop updates
  const [sortedItems, setSortedItems] = React.useState<any[]>([])

  React.useEffect(() => {
    const currentItems = response?.items || []
    if (currentItems.length > 0) {
      setSortedItems([...currentItems].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)))
    } else {
      setSortedItems([])
    }
  }, [response?.items])

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    
    if (over && active.id !== over.id) {
      setSortedItems((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id)
        const newIndex = items.findIndex((i) => i.id === over.id)
        
        const newArray = arrayMove(items, oldIndex, newIndex)
        
        // Save to backend immediately
        const orderList = newArray.map((item, i) => ({
          id: item.id,
          sortOrder: i * 10
        }))
        
        reorderSlides({ orderList })
        
        return newArray
      })
    }
  }

  return (
    <div className="space-y-6 pb-16 font-sans">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-medium text-foreground">Hero Banners</h2>
        {!isCreating && !editingItem && (
          <Button 
            onClick={() => setIsCreating(true)}
            className="h-10 px-6 rounded-full font-bold tracking-widest uppercase"
          >
            <Plus className="mr-2 h-4 w-4" /> Add Slide
          </Button>
        )}
      </div>

      <div 
        className={cn(
          "overflow-hidden transition-all duration-500 ease-in-out",
          (isCreating || editingItem) ? "max-h-[1200px] opacity-100 mb-8" : "max-h-0 opacity-0"
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
            {editingItem ? "Edit Slide" : "New Slide"}
          </h3>
          
          { (isCreating || editingItem) && (
            <HeroSlideForm 
              initialData={editingItem} 
              onSuccess={() => { setIsCreating(false); setEditingItem(null); }} 
            />
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
                No hero banners configured.
              </div>
            ) : (
              <DndContext 
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext 
                  items={sortedItems.map(i => i.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {sortedItems.map((item) => (
                    <SortableSlideItem 
                      key={item.id} 
                      item={item} 
                      onEdit={() => {
                        setEditingItem(item)
                        setIsCreating(false)
                        window.scrollTo({ top: 0, behavior: 'smooth' })
                      }}
                      onDelete={() => {
                        if (confirm("Are you sure you want to delete this slide?")) {
                          deleteSlide(item.id)
                        }
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

function HeroSlideForm({ initialData, onSuccess }: { initialData?: any, onSuccess: () => void }) {
  const isEditing = !!initialData
  const { register, handleSubmit, setValue, watch } = useForm({
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      buttonText: initialData?.buttonText || "",
      linkUrl: initialData?.linkUrl || "",
      published: initialData?.published || false,
      image: initialData?.image || null,
    }
  })

  const watchImage = watch("image")
  const watchPublished = watch("published")

  const createMutation = useCreateHeroCarouselMutation()
  const updateMutation = useUpdateHeroCarouselMutation()
  const isPending = createMutation.isPending || updateMutation.isPending

  const onSubmit = (data: any) => {
    if (!data.image) {
      alert("Image is required for Hero Slide (16:9 recommended)")
      return
    }

    if (isEditing) {
      updateMutation.mutate({ id: initialData.id, data }, { onSuccess })
    } else {
      createMutation.mutate(data, { onSuccess })
    }
  }

  return (
    <>
      <form id="hero-slide-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      
      <div className="space-y-2">
        <Label>Hero Banner Image (16:9 ratio recommended) <span className="text-destructive">*</span></Label>
        <div className="max-w-xl">
           <MediaUploader 
             value={watchImage} 
             onChange={(val) => setValue("image", val)} 
             multiple={false} 
             preset="banner"
           />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Title (Optional)</Label>
          <Input {...register("title")} placeholder="e.g. Summer Collection" />
        </div>
        <div className="space-y-2">
          <Label>Button Text (Optional)</Label>
          <Input {...register("buttonText")} placeholder="e.g. Shop Now" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Link URL (Optional)</Label>
          <Input {...register("linkUrl")} placeholder="e.g. /collections/summer" />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Subtitle / Description (Optional)</Label>
        <Textarea {...register("description")} className="resize-none h-20" placeholder="A brief description appearing under the title" />
      </div>

      <div className="flex items-center gap-3 pt-2">
        <Switch 
          checked={watchPublished} 
          onCheckedChange={(val) => setValue("published", val)} 
        />
        <div className="space-y-0.5">
          <Label>Publish Slide</Label>
          <p className="text-xs text-muted-foreground">Make this slide visible on the storefront.</p>
        </div>
      </div>

      </form>
      
      <StickySaveBar 
        formId="hero-slide-form"
        onCancel={onSuccess}
        isPending={isPending}
        disabled={!watchImage}
        saveActionLabel={isEditing ? "Save Changes" : "Create Slide"}
        infoPanel={
          <div className="flex items-center gap-2">
            <span className="font-medium text-foreground">{isEditing ? "Edit Slide" : "New Slide"}</span>
            <span className="text-muted-foreground">&bull;</span>
            <span>{watch("title") || "Untitled"}</span>
          </div>
        }
      />
    </>
  )
}
