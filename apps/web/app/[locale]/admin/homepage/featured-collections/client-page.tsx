"use client"

import * as React from "react"
import {
  Plus,
  Loader2,
  Trash2,
  X,
  GripVertical,
  Check,
  ChevronsUpDown,
} from "lucide-react"
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
  useAdminFeaturedCollectionsQuery,
  useAdminCollectionsQuery,
} from "../../queries"
import {
  useSetFeaturedCollectionsMutation,
  useUpdateFeaturedCollectionStatusMutation,
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
import { StickySaveBar } from "@workspace/ui/components/sticky-save-bar"

function SortableItem({
  item,
  onDelete,
  onStatusChange,
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
  } = useSortable({ id: item.id || item.collectionId })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const collection = item.collection || item

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group flex flex-col justify-between border-b border-border/40 bg-card p-4 sm:flex-row sm:items-center",
        isDragging ? "z-50 bg-muted/50 opacity-50" : "hover:bg-muted/20"
      )}
    >
      <div className="flex items-center gap-4">
        {/* Drag Handle */}
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab touch-none p-2 text-muted-foreground hover:text-foreground active:cursor-grabbing"
        >
          <GripVertical className="h-5 w-5" />
        </div>

        {/* Thumbnail */}
        <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-muted">
          {collection?.image ? (
            <img
              src={collection.image}
              alt={collection.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-[10px] text-muted-foreground">IMG</span>
          )}
        </div>
        <div>
          <p className="font-medium text-foreground">
            {collection?.name || "Unknown Collection"}
          </p>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-4 self-end sm:mt-0 sm:self-auto">
        {item.id && ( // Only show switch if it's already saved (has an id from db)
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Active</span>
            <Switch checked={item.isActive} onCheckedChange={onStatusChange} />
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

export default function FeaturedCollectionsPage() {
  const { data: response, isLoading } = useAdminFeaturedCollectionsQuery()
  const { mutate: setFeaturedCollections, isPending: isSaving } =
    useSetFeaturedCollectionsMutation()
  const { mutate: updateStatus } = useUpdateFeaturedCollectionStatusMutation()

  const [isCreating, setIsCreating] = React.useState(false)
  const [sortedItems, setSortedItems] = React.useState<any[]>([])

  React.useEffect(() => {
    const currentItems =
      response?.items ||
      response?.data ||
      (Array.isArray(response) ? response : [])
    if (currentItems.length > 0) {
      setSortedItems(
        [...currentItems].sort(
          (a: any, b: any) => (a.sortOrder || 0) - (b.sortOrder || 0)
        )
      )
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
        const oldIndex = items.findIndex(
          (i) => (i.id || i.collectionId) === active.id
        )
        const newIndex = items.findIndex(
          (i) => (i.id || i.collectionId) === over.id
        )
        const newItems = arrayMove(items, oldIndex, newIndex)

        const payload = newItems.map((item, index) => ({
          collectionId: item.collectionId,
          sortOrder: index * 10,
        }))
        setFeaturedCollections({ items: payload })

        return newItems
      })
    }
  }

  const handleDeleteLocal = (idOrCollectionId: string) => {
    setSortedItems((items) => {
      const newItems = items.filter(
        (i) => (i.id || i.collectionId) !== idOrCollectionId
      )

      const payload = newItems.map((item, index) => ({
        collectionId: item.collectionId,
        sortOrder: index * 10,
      }))
      setFeaturedCollections({ items: payload })

      return newItems
    })
  }

  const handleStatusChange = (id: string, isActive: boolean) => {
    updateStatus({ id, data: { isActive } })
  }

  const handleAddCollection = (collection: any) => {
    if (sortedItems.find((i) => i.collectionId === collection.id)) {
      alert("Collection is already in the list.")
      return
    }
    const newItems = [
      ...sortedItems,
      { collectionId: collection.id, collection, isActive: true },
    ]
    setSortedItems(newItems)
    setIsCreating(false)

    const payload = newItems.map((item, index) => ({
      collectionId: item.collectionId,
      sortOrder: index * 10,
    }))
    setFeaturedCollections({ items: payload })
  }

  return (
    <div className="space-y-6 pb-16 font-sans">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-medium text-foreground">
          Featured Collections
        </h2>
        <div className="flex gap-2">
          {isSaving && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin self-center text-muted-foreground" />
          )}
          {!isCreating && (
            <Button
              onClick={() => setIsCreating(true)}
              className="h-10 rounded-full px-6 font-bold tracking-widest uppercase"
            >
              <Plus className="mr-2 h-4 w-4" /> Add Collection
            </Button>
          )}
        </div>
      </div>

      <div
        className={cn(
          "overflow-hidden transition-all duration-500 ease-in-out",
          isCreating ? "mb-8 max-h-[500px] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="relative rounded-3xl border border-border/40 bg-card p-6 shadow-sm sm:p-8">
          <button
            onClick={() => setIsCreating(false)}
            className="absolute top-6 right-6 text-muted-foreground transition-colors hover:text-foreground"
          >
            <X className="h-6 w-6" />
          </button>

          <h3 className="mb-6 font-heading text-2xl font-light text-foreground">
            Add Featured Collection
          </h3>

          {isCreating && (
            <AddFeaturedCollectionForm
              onAdd={handleAddCollection}
              onCancel={() => setIsCreating(false)}
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
                No featured collections configured.
              </div>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={sortedItems.map((i) => i.id || i.collectionId)}
                  strategy={verticalListSortingStrategy}
                >
                  {sortedItems.map((item) => (
                    <SortableItem
                      key={item.id || item.collectionId}
                      item={item}
                      onDelete={() =>
                        handleDeleteLocal(item.id || item.collectionId)
                      }
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

function AddFeaturedCollectionForm({
  onAdd,
  onCancel,
}: {
  onAdd: (collection: any) => void
  onCancel: () => void
}) {
  const { data: collectionsData } = useAdminCollectionsQuery()
  const collections = collectionsData?.items || []
  const [open, setOpen] = React.useState(false)
  const [selectedCollection, setSelectedCollection] = React.useState<any>(null)

  return (
    <div className="space-y-6">
      <div className="space-y-2.5">
        <Label className="text-xs font-medium text-muted-foreground">
          Select Collection
        </Label>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger
            render={
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="h-12 w-full justify-between rounded-xl border-transparent bg-muted/40 hover:bg-muted/60"
              >
                {selectedCollection
                  ? selectedCollection.name
                  : "Search collection..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            }
          />
          <PopoverContent className="w-[400px] p-0" align="start">
            <Command>
              <CommandInput placeholder="Search collections..." />
              <CommandList>
                <CommandEmpty>No collection found.</CommandEmpty>
                <CommandGroup>
                  {collections.map((collection: any) => (
                    <CommandItem
                      key={collection.id}
                      value={collection.name}
                      onSelect={() => {
                        setSelectedCollection(collection)
                        setOpen(false)
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          selectedCollection?.id === collection.id
                            ? "opacity-100"
                            : "opacity-0"
                        )}
                      />
                      {collection.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      <StickySaveBar 
        onCancel={onCancel}
        onSave={() => onAdd(selectedCollection)}
        disabled={!selectedCollection}
        saveActionLabel="ADD COLLECTION"
      />
    </div>
  )
}
