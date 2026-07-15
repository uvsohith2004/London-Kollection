"use client"

import * as React from "react"
import { Plus, Loader2, Edit2, Trash2 } from "lucide-react"
import { useTaxClassesQuery } from "../../queries"
import { useDeleteTaxClassMutation } from "../../mutations"
import { Button } from "@workspace/ui/components/button"
import { Badge } from "@workspace/ui/components/badge"
import { TaxClassForm } from "./tax-class-editor-dialog"
import { 
  DataView, 
  DataViewToolbar, 
  DataViewContent, 
  DataViewListCard,
  DataViewGridCard 
} from "@/components/data-view"

export function ClassesTab() {
  const { data: response, isLoading } = useTaxClassesQuery()
  const { mutate: deleteTaxClass } = useDeleteTaxClassMutation()
  const [isCreating, setIsCreating] = React.useState(false)
  const [editingClass, setEditingClass] = React.useState<any>(null)
  
  const items = response?.items || []

  const handleEdit = (taxClass: any) => {
    setEditingClass(taxClass)
    setIsCreating(false)
  }

  const handleCreate = () => {
    setEditingClass(null)
    setIsCreating(true)
  }

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this tax class?")) {
      deleteTaxClass(id)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-xl font-medium tracking-tight">Tax Classes</h3>
          <p className="text-sm text-muted-foreground">
            Define categories of products for tax purposes (e.g., Standard, Reduced, Exempt).
          </p>
        </div>
        {!isCreating && !editingClass && (
          <Button onClick={handleCreate} className="rounded-full px-6 tracking-widest uppercase">
            <Plus className="mr-2 h-4 w-4" />
            Add Tax Class
          </Button>
        )}
      </div>

      {/* Expandable Form Area */}
      {(isCreating || editingClass) && (
        <div className="mb-8 animate-in fade-in slide-in-from-top-4 duration-300">
          <TaxClassForm 
            initialData={editingClass} 
            onSuccess={() => { setIsCreating(false); setEditingClass(null); }} 
            onCancel={() => { setIsCreating(false); setEditingClass(null); }}
          />
        </div>
      )}

      <DataView 
        data={items} 
        filterFn={(item: any, query: string) => item.name.toLowerCase().includes(query.toLowerCase()) || (item.description && item.description.toLowerCase().includes(query.toLowerCase()))}
        availableLayouts={["list-card", "table", "block-card"]} 
        defaultLayout="list-card"
        enableDetailsModal={false}
      >
        <div className="mb-6">
          <DataViewToolbar searchPlaceholder="Search tax classes..." />
        </div>
        <DataViewContent
          columns={[
            { header: "Name", cell: (item: any) => <span className="font-medium">{item.name}</span> },
            { header: "Description", cell: (item: any) => <span className="text-muted-foreground truncate max-w-[300px] inline-block">{item.description || "—"}</span> },
            { 
              header: "Status", 
              cell: (item: any) => item.isDefault ? (
                <Badge variant="outline" className="border-green-500/20 text-green-600 bg-green-500/10">Default</Badge>
              ) : (
                <span className="text-muted-foreground text-xs uppercase tracking-wider">—</span>
              )
            },
            {
              header: "",
              className: "text-right",
              cell: (item: any) => (
                <div className="flex items-center justify-end gap-2">
                  <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleEdit(item); }} className="h-8 w-8 rounded-full hover:bg-primary/10 hover:text-primary">
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }} className="h-8 w-8 rounded-full hover:bg-destructive/10 hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )
            }
          ]}
          renderListCard={(item: any) => (
            <DataViewListCard 
              item={item}
              title={item.name}
              subtitle={item.description}
              badge={item.isDefault ? (
                <Badge variant="outline" className="border-primary/20 text-primary bg-primary/10 tracking-widest text-[10px] px-2 py-1 rounded-full uppercase">
                  Default
                </Badge>
              ) : undefined}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )}
          renderBlockCard={(item: any) => (
            <DataViewGridCard 
              item={item}
              title={item.name}
              subtitle={item.description}
              badge={item.isDefault ? (
                <Badge variant="outline" className="shrink-0 border-primary/20 text-primary bg-primary/10 tracking-widest text-[10px] px-2 py-1 rounded-full uppercase">
                  Default
                </Badge>
              ) : undefined}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )}
          emptyState={
            <div className="flex flex-col items-center justify-center rounded-2xl border border-border/40 bg-card p-16 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Plus className="h-8 w-8 text-primary" />
              </div>
              <h4 className="text-lg font-medium">No Tax Classes Found</h4>
              <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                Create tax classes to categorize your products for taxation.
              </p>
              <Button onClick={handleCreate} variant="outline" className="mt-6 rounded-full px-6">
                Create Tax Class
              </Button>
            </div>
          }
        />
      </DataView>
    </div>
  )
}
