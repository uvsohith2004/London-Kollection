"use client"

import * as React from "react"
import {
  Search,
  LayoutList,
  List,
  AlignJustify,
  Grid as GridIcon,
 
  X,
  Trash2,
  MoreVertical,
  Edit2,
} from "lucide-react"

import { Input } from "@workspace/ui/components/input"
import { Button } from "@workspace/ui/components/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import { cn } from "@workspace/ui/lib/utils"

export type LayoutMode = "table" | "list-card" | "block-card" | "grid"

export interface DataViewCardProps<T> {
  item: T
  title: React.ReactNode
  subtitle?: React.ReactNode
  imageUrl?: string | null
  badge?: React.ReactNode
  metadata?: React.ReactNode
  onEdit?: (item: T) => void
  onDelete?: (item: T) => void
}

export interface DataViewContextValue<T = any> {
  data: T[]
  currentLayout: LayoutMode
  setCurrentLayout: (layout: LayoutMode) => void
  searchQuery: string
  setSearchQuery: (query: string) => void
  selectedItem: T | null
  setSelectedItem: (item: T | null) => void
  availableLayouts: LayoutMode[]
  enableDetailsModal: boolean
}

const DataViewContext = React.createContext<DataViewContextValue | undefined>(
  undefined
)

export function useDataView<T = any>() {
  const context = React.useContext(DataViewContext)
  if (!context) {
    throw new Error("useDataView must be used within a DataView provider")
  }
  return context as DataViewContextValue<T>
}

export interface DataViewProps<T> {
  data: T[]
  availableLayouts?: LayoutMode[]
  defaultLayout?: LayoutMode
  filterFn?: (item: T, query: string) => boolean
  enableDetailsModal?: boolean
  children: React.ReactNode
}

export function DataView<T>({
  data,
  availableLayouts = ["table", "list-card", "block-card", "grid"],
  defaultLayout = "table",
  filterFn,
  enableDetailsModal = true,
  children,
}: DataViewProps<T>) {
  const [currentLayout, setCurrentLayout] = React.useState<LayoutMode>(
    defaultLayout && availableLayouts.includes(defaultLayout)
      ? defaultLayout
      : availableLayouts[0] || "list-card"
  )
  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedItem, setSelectedItem] = React.useState<T | null>(null)

  const filteredData = React.useMemo(() => {
    if (!searchQuery || !filterFn) return data
    return data.filter((item) => filterFn(item, searchQuery))
  }, [data, searchQuery, filterFn])

  return (
    <DataViewContext.Provider
      value={{
        data: filteredData,
        currentLayout,
        setCurrentLayout,
        searchQuery,
        setSearchQuery,
        selectedItem,
        setSelectedItem,
        availableLayouts,
        enableDetailsModal,
      }}
    >
      <div className="flex w-full flex-col gap-6">{children}</div>
    </DataViewContext.Provider>
  )
}

export interface DataViewToolbarProps {
  searchPlaceholder?: string
  actions?: React.ReactNode
}

export function DataViewToolbar({
  searchPlaceholder = "Search...",
  actions,
}: DataViewToolbarProps) {
  const {
    searchQuery,
    setSearchQuery,
    currentLayout,
    setCurrentLayout,
    availableLayouts,
  } = useDataView()

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative flex-1 sm:max-w-xs">
        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder={searchPlaceholder}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-10 w-full rounded-full border-border/40 pr-4 pl-9 transition-all hover:bg-muted/20 focus-visible:ring-1 focus-visible:ring-primary/20"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="flex w-full items-center gap-3 sm:w-auto">
        {actions}

        {availableLayouts.length > 1 && (
          <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-full border border-border/50">
            {availableLayouts.includes("table") && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCurrentLayout("table")}
                className={cn(
                  "h-8 w-8 rounded-full transition-all duration-200",
                  currentLayout === "table"
                    ? "bg-background shadow-sm text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
                title="Table"
              >
                <AlignJustify className="h-4 w-4" />
              </Button>
            )}
            {availableLayouts.includes("list-card") && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCurrentLayout("list-card")}
                className={cn(
                  "h-8 w-8 rounded-full transition-all duration-200",
                  currentLayout === "list-card"
                    ? "bg-background shadow-sm text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
                title="List"
              >
                <List className="h-4 w-4" />
              </Button>
            )}
            {availableLayouts.includes("block-card") && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCurrentLayout("block-card")}
                className={cn(
                  "h-8 w-8 rounded-full transition-all duration-200",
                  currentLayout === "block-card"
                    ? "bg-background shadow-sm text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
                title="Block"
              >
                <LayoutList className="h-4 w-4" />
              </Button>
            )}
            {availableLayouts.includes("grid") && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCurrentLayout("grid")}
                className={cn(
                  "h-8 w-8 rounded-full transition-all duration-200",
                  currentLayout === "grid"
                    ? "bg-background shadow-sm text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
                title="Grid"
              >
                <GridIcon className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export interface DataViewColumn<T> {
  header: string
  cell: (item: T) => React.ReactNode
  className?: string
}

export interface DataViewContentProps<T> {
  columns?: DataViewColumn<T>[]
  renderListCard?: (item: T) => React.ReactNode
  renderBlockCard?: (item: T) => React.ReactNode
  renderGridCard?: (item: T) => React.ReactNode
  emptyState?: React.ReactNode
}

export function DataViewContent<T>({
  columns,
  renderListCard,
  renderBlockCard,
  renderGridCard,
  emptyState,
}: DataViewContentProps<T>) {
  const { data, currentLayout, setSelectedItem, enableDetailsModal } =
    useDataView<T>()

  if (!data || data.length === 0) {
    return emptyState ? (
      <>{emptyState}</>
    ) : (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-border/40 bg-card p-16 text-center shadow-sm">
        <h4 className="text-lg font-medium text-foreground">
          No records found
        </h4>
        <p className="mt-2 text-sm text-muted-foreground">
          Try adjusting your search query.
        </p>
      </div>
    )
  }

  if (currentLayout === "table" && columns) {
    return (
      <div className="overflow-hidden rounded-2xl border border-border/40 bg-card shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/10">
              <TableRow className="border-border/40">
                {columns.map((col, i) => (
                  <TableHead
                    key={i}
                    className={cn(
                      "px-6 py-4 font-medium tracking-wide text-muted-foreground",
                      col.className
                    )}
                  >
                    {col.header}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((item, i) => (
                <TableRow
                  key={i}
                  className={cn(
                    "border-border/40 transition-colors hover:bg-muted/20",
                    enableDetailsModal && "cursor-pointer"
                  )}
                  onClick={() => enableDetailsModal && setSelectedItem(item)}
                >
                  {columns.map((col, j) => (
                    <TableCell
                      key={j}
                      className={cn("px-6 py-4", col.className)}
                    >
                      {col.cell(item)}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    )
  }

  if (currentLayout === "grid" && renderGridCard) {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {data.map((item, i) => (
          <React.Fragment key={i}>{renderGridCard(item)}</React.Fragment>
        ))}
      </div>
    )
  }

  if (currentLayout === "block-card" && (renderBlockCard || renderGridCard)) {
    const cardToRender = renderBlockCard || renderGridCard
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {data.map((item, i) => (
          <React.Fragment key={i}>{cardToRender!(item)}</React.Fragment>
        ))}
      </div>
    )
  }

  if (currentLayout === "list-card" && renderListCard) {
    return (
      <div className="flex flex-col gap-4">
        {data.map((item, i) => (
          <React.Fragment key={i}>{renderListCard(item)}</React.Fragment>
        ))}
      </div>
    )
  }

  return null
}

export interface DataViewDetailsField<T> {
  label: string
  value?: (item: T) => React.ReactNode
}

export interface DataViewDetailsModalProps<T> {
  title: (item: T) => string
  description?: (item: T) => string
  fields: DataViewDetailsField<T>[]
}

export function DataViewDetailsModal<T>({
  title,
  description,
  fields,
}: DataViewDetailsModalProps<T>) {
  const { selectedItem, setSelectedItem } = useDataView<T>()

  if (!selectedItem) return null

  return (
    <Dialog
      open={!!selectedItem}
      onOpenChange={(open: boolean) => !open && setSelectedItem(null)}
    >
      <DialogContent className="overflow-hidden rounded-3xl border-border/40 bg-card p-0 sm:max-w-[500px]">
        <div className="flex items-start justify-between border-b border-border/40 bg-muted/20 px-8 py-6">
          <div>
            <DialogTitle className="text-2xl font-semibold tracking-tight text-foreground">
              {title(selectedItem)}
            </DialogTitle>
            {description && (
              <p className="mt-2 text-sm text-muted-foreground">
                {description(selectedItem)}
              </p>
            )}
          </div>
        </div>
        <div className="px-8 py-6">
          <div className="grid gap-6">
            {fields.map((field, i) => {
              const val = field.value ? field.value(selectedItem) : null
              if (val === null || val === undefined) return null

              return (
                <div key={i} className="flex flex-col gap-1">
                  <span className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                    {field.label}
                  </span>
                  <div className="text-sm font-medium text-foreground">
                    {val}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function DataViewListCard<T>({
  item,
  title,
  subtitle,
  imageUrl,
  badge,
  metadata,
  onEdit,
  onDelete,
}: DataViewCardProps<T>) {
  const { setSelectedItem, enableDetailsModal } = useDataView()
  const showImage = imageUrl !== undefined

  return (
    <div
      onClick={() => enableDetailsModal && setSelectedItem(item)}
      className={cn(
        "group flex flex-col items-center gap-6 overflow-hidden rounded-3xl border border-border/40 bg-card p-3 transition-all hover:border-border/80 hover:shadow-md sm:flex-row",
        enableDetailsModal && "cursor-pointer"
      )}
    >
      {showImage && (
        <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-muted/30 sm:h-32 sm:w-32">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt=""
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-[10px] tracking-widest text-muted-foreground uppercase">
              No Image
            </div>
          )}
        </div>
      )}

      <div className="flex w-full flex-1 flex-col py-2 sm:w-auto">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-medium text-foreground">{title}</h3>
            {subtitle && (
              <p className="mt-1 max-w-sm truncate text-sm text-muted-foreground">
                {subtitle}
              </p>
            )}
          </div>
          {badge}
        </div>

        <div className="mt-auto flex items-center justify-between pt-4">
          <div className="font-mono font-medium text-foreground">
            {metadata}
          </div>

          <div className="flex items-center gap-2">
            {onEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  onEdit(item)
                }}
                className="h-8 rounded-full px-4"
              >
                Edit
              </Button>
            )}
            {onDelete && (
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => e.stopPropagation()}
                      className="h-8 w-8 rounded-full"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  }
                />

                <DropdownMenuContent align="end" className="w-40 rounded-xl">
                  <Dialog>
                    <DialogTrigger>
                      <DropdownMenuItem
                        onSelect={(e) => e.preventDefault()}
                        className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DialogTrigger>
                    <DialogContent onClick={(e) => e.stopPropagation()}>
                      <DialogHeader>
                        <DialogTitle>Confirm Deletion</DialogTitle>
                      </DialogHeader>
                      <div className="py-4">
                        Are you sure you want to delete this item?
                      </div>
                      <DialogFooter>
                        <DialogClose
                          render={<Button variant="outline">Cancel</Button>}
                        />

                        <DialogClose
                          render={
                            <Button
                              variant="destructive"
                              onClick={(e) => {
                                e.stopPropagation()
                                onDelete(item)
                              }}
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
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export function DataViewGridCard<T>({
  item,
  title,
  subtitle,
  imageUrl,
  badge,
  metadata,
  onEdit,
  onDelete,
}: DataViewCardProps<T>) {
  const { setSelectedItem, enableDetailsModal } = useDataView()
  const showImage = imageUrl !== undefined

  return (
    <div
      onClick={() => enableDetailsModal && setSelectedItem(item)}
      className={cn(
        "group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-border/40 bg-card transition-all hover:border-border/80 hover:shadow-md",
        !showImage && "h-full p-4",
        enableDetailsModal && "cursor-pointer"
      )}
    >
      {showImage && (
        <div className="relative aspect-square w-full overflow-hidden bg-muted/30">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt=""
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
              No Image
            </div>
          )}

          {badge && <div className="absolute top-3 left-3">{badge}</div>}
        </div>
      )}

      {showImage && (
        <div className="absolute top-3 right-3 opacity-0 transition-opacity group-hover:opacity-100">
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => e.stopPropagation()}
                className="h-8 w-8 rounded-full bg-background/50 backdrop-blur hover:bg-background/80"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40 rounded-xl">
              {onEdit && (
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation()
                    onEdit(item)
                  }}
                >
                  <Edit2 className="mr-2 h-4 w-4" /> Edit
                </DropdownMenuItem>
              )}
              {onDelete && (
                <Dialog>
                  <DialogTrigger>
                    <DropdownMenuItem
                      onSelect={(e) => e.preventDefault()}
                        className="h-8 w-8 rounded-full text-destructive backdrop-blur hover:text-destructive/80
                         hover:bg-destructive/10"
                    >
                      <Trash2 className="mr-2 h-4 w-4 " /> Delete
                    </DropdownMenuItem>
                  </DialogTrigger>
                  <DialogContent onClick={(e) => e.stopPropagation()}>
                    <DialogHeader>
                      <DialogTitle>Confirm Deletion</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                      Are you sure you want to delete this item?
                    </div>
                    <DialogFooter>
                      <DialogClose
                        render={<Button variant="outline">Cancel</Button>}
                      />

                      <DialogClose
                        render={
                          <Button
                            variant="destructive"
                            onClick={(e) => {
                              e.stopPropagation()
                              onDelete(item)
                            }}
                          >
                            Delete
                          </Button>
                        }
                      />
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      <div className={cn("flex flex-col gap-1", showImage ? "p-5" : "flex-1")}>
        {!showImage && (
          <div className="mb-4 flex items-start justify-between">
            <h3
              className="truncate pr-2 text-lg font-medium text-foreground"
              title={title as string}
            >
              {title}
            </h3>
            {badge}
          </div>
        )}
        {showImage && (
          <h3
            className="truncate text-lg font-medium text-foreground"
            title={title as string}
          >
            {title}
          </h3>
        )}
        {subtitle && (
          <p className="line-clamp-3 truncate text-sm whitespace-pre-wrap text-muted-foreground">
            {subtitle}
          </p>
        )}

        <div
          className={cn(
            "mt-auto flex items-end justify-between pt-4",
            !showImage && "mt-6 border-t border-border/40"
          )}
        >
          <div className="font-mono font-medium text-foreground">
            {metadata}
          </div>
          {!showImage && (
            <div className="flex items-center gap-1">
              {onEdit && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation()
                    onEdit(item)
                  }}
                  className="h-8 w-8 rounded-full bg-background/50 backdrop-blur hover:bg-background/80 hover:text-primary"
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
              )}
              {onDelete && (
                <Dialog>
                  <DialogTrigger
                    render={
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => e.stopPropagation()}
                        className="h-8 w-8 rounded-full text-destructive backdrop-blur hover:text-destructive/80
                         hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4 " />
                      </Button>
                    }
                  />

                  <DialogContent onClick={(e) => e.stopPropagation()}>
                    <DialogHeader>
                      <DialogTitle>Confirm Deletion</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                      Are you sure you want to delete this item?
                    </div>
                    <DialogFooter>
                      <DialogClose
                        render={<Button variant="outline">Cancel</Button>}
                      ></DialogClose>
                      <DialogClose
                        render={
                          <Button
                            variant="destructive"
                            onClick={(e) => {
                              e.stopPropagation()
                              onDelete(item)
                            }}
                          >
                            Delete
                          </Button>
                        }
                      />
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
