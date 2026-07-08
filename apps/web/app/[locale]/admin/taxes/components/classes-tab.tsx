"use client"

import * as React from "react"
import { Plus, Loader2, Edit2, Trash2 } from "lucide-react"
import { useTaxClassesQuery } from "../../queries"
import { useDeleteTaxClassMutation } from "../../mutations"
import { Button } from "@workspace/ui/components/button"
import { Badge } from "@workspace/ui/components/badge"
import { TaxClassForm } from "./tax-class-editor-dialog"

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

      <div className="rounded-2xl border border-border/40 bg-card p-1 shadow-sm">
        {isLoading ? (
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-16 text-center">
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
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/40 text-left text-muted-foreground">
                  <th className="px-6 py-4 font-medium">Name</th>
                  <th className="px-6 py-4 font-medium">Description</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item: any) => (
                  <tr key={item.id} className="border-b border-border/40 transition-colors hover:bg-muted/40 last:border-0">
                    <td className="px-6 py-4 font-medium">{item.name}</td>
                    <td className="px-6 py-4 text-muted-foreground truncate max-w-[300px]">
                      {item.description || "—"}
                    </td>
                    <td className="px-6 py-4">
                      {item.isDefault ? (
                        <Badge variant="outline" className="border-green-500/20 text-green-600 bg-green-500/10">Default</Badge>
                      ) : (
                        <span className="text-muted-foreground text-xs uppercase tracking-wider">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(item)} className="h-8 w-8 rounded-full hover:bg-primary/10 hover:text-primary">
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)} className="h-8 w-8 rounded-full hover:bg-destructive/10 hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
