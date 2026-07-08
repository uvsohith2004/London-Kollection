"use client"

import * as React from "react"
import { Plus, Search, Edit2, Trash2 } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { useAdminBrandsQuery } from "../../queries"
import { useDeleteBrandMutation } from "../../mutations"
import { BrandForm } from "./brand-editor-dialog"
import { Badge } from "@workspace/ui/components/badge"

export function BrandsTab() {
  const { data: brandsRes, isLoading } = useAdminBrandsQuery()
  const { mutate: deleteBrand } = useDeleteBrandMutation()
  
  const [isCreating, setIsCreating] = React.useState(false)
  const [editingBrand, setEditingBrand] = React.useState<any>(null)
  
  const brands = brandsRes?.data?.items || []

  const handleEdit = (brand: any) => {
    setEditingBrand(brand)
    setIsCreating(false)
  }

  const handleCreate = () => {
    setEditingBrand(null)
    setIsCreating(true)
  }

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this brand?")) {
      deleteBrand(id)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-xl font-medium tracking-tight">Brands</h3>
          <p className="text-sm text-muted-foreground">
            Manage your product brands and manufacturers.
          </p>
        </div>
        {!isCreating && !editingBrand && (
          <Button onClick={handleCreate} className="rounded-full px-6 tracking-widest uppercase">
            <Plus className="mr-2 h-4 w-4" />
            Add Brand
          </Button>
        )}
      </div>

      {/* Expandable Form Area */}
      {(isCreating || editingBrand) && (
        <div className="mb-8 animate-in fade-in slide-in-from-top-4 duration-300">
          <BrandForm 
            initialData={editingBrand} 
            onSuccess={() => { setIsCreating(false); setEditingBrand(null); }} 
            onCancel={() => { setIsCreating(false); setEditingBrand(null); }}
          />
        </div>
      )}

      <div className="rounded-2xl border border-border/40 bg-card p-1 shadow-sm">
        {brands.length === 0 && !isLoading ? (
          <div className="flex flex-col items-center justify-center p-16 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Plus className="h-8 w-8 text-primary" />
            </div>
            <h4 className="text-lg font-medium">No Brands Found</h4>
            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
              Brands help you organize products by manufacturer. Create your first brand to get started.
            </p>
            <Button onClick={handleCreate} variant="outline" className="mt-6 rounded-full px-6">
              Create Brand
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/40 text-left text-muted-foreground">
                  <th className="px-6 py-4 font-medium">Name</th>
                  <th className="px-6 py-4 font-medium">Slug</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {brands.map((brand: any) => (
                  <tr key={brand.id} className="border-b border-border/40 transition-colors hover:bg-muted/40 last:border-0">
                    <td className="px-6 py-4 font-medium">{brand.name}</td>
                    <td className="px-6 py-4 text-muted-foreground">{brand.slug}</td>
                    <td className="px-6 py-4">
                      {brand.isActive ? (
                        <Badge variant="outline" className="border-green-500/20 text-green-600 bg-green-500/10">Active</Badge>
                      ) : (
                        <Badge variant="outline" className="text-muted-foreground">Inactive</Badge>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(brand)} className="h-8 w-8 rounded-full hover:bg-primary/10 hover:text-primary">
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(brand.id)} className="h-8 w-8 rounded-full hover:bg-destructive/10 hover:text-destructive">
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
