"use client"

import * as React from "react"
import { Plus, Search, Loader2, Edit2, Trash2 } from "lucide-react"
import { useAdminCollectionsQuery } from "../../products/queries"
import { useDeleteCollectionMutation } from "../../products/mutations"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Badge } from "@workspace/ui/components/badge"
import { CollectionForm } from "./collection-editor-dialog"

export function CollectionsTab() {
  const [search, setSearch] = React.useState("")
  const [isCreating, setIsCreating] = React.useState(false)
  const [editingCollection, setEditingCollection] = React.useState<any>(null)

  const { data: response, isLoading } = useAdminCollectionsQuery()
  const { mutate: deleteCollection } = useDeleteCollectionMutation()

  const collections = response?.items || []
  const items = collections.filter((c: any) => 
    c.name?.toLowerCase().includes(search.toLowerCase()) || 
    c.title?.toLowerCase().includes(search.toLowerCase())
  )

  const handleEdit = (collection: any) => {
    setEditingCollection(collection)
    setIsCreating(false)
  }

  const handleCreate = () => {
    setEditingCollection(null)
    setIsCreating(true)
  }

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this collection?")) {
      deleteCollection(id)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-xl font-medium tracking-tight">Collections</h3>
          <p className="text-sm text-muted-foreground">
            Group products into curated collections.
          </p>
        </div>
        {!isCreating && !editingCollection && (
          <Button onClick={handleCreate} className="rounded-full px-6 tracking-widest uppercase">
            <Plus className="mr-2 h-4 w-4" />
            Add Collection
          </Button>
        )}
      </div>

      {/* Expandable Form Area */}
      {(isCreating || editingCollection) && (
        <div className="mb-8 animate-in fade-in slide-in-from-top-4 duration-300">
          <CollectionForm 
            initialData={editingCollection} 
            onSuccess={() => { setIsCreating(false); setEditingCollection(null); }} 
            onCancel={() => { setIsCreating(false); setEditingCollection(null); }}
          />
        </div>
      )}

      <div className="rounded-2xl border border-border/40 bg-card p-1 shadow-sm">
        <div className="p-4 border-b border-border/40">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input 
              placeholder="Search collections..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 pl-10 rounded-xl bg-muted/40 border-transparent focus-visible:bg-background" 
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-16 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Plus className="h-8 w-8 text-primary" />
            </div>
            <h4 className="text-lg font-medium">No Collections Found</h4>
            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
              Collections help group related products together.
            </p>
            <Button onClick={handleCreate} variant="outline" className="mt-6 rounded-full px-6">
              Create Collection
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/40 text-left text-muted-foreground">
                  <th className="px-6 py-4 font-medium">Collection</th>
                  <th className="px-6 py-4 font-medium">Slug</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item: any) => (
                  <tr key={item.id} className="border-b border-border/40 transition-colors hover:bg-muted/40 last:border-0">
                    <td className="px-6 py-4 font-medium">{item.title || item.name}</td>
                    <td className="px-6 py-4 text-muted-foreground">{item.slug}</td>
                    <td className="px-6 py-4">
                      {item.isActive !== false ? (
                        <Badge variant="outline" className="border-green-500/20 text-green-600 bg-green-500/10">Active</Badge>
                      ) : (
                        <Badge variant="outline" className="text-muted-foreground">Inactive</Badge>
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
