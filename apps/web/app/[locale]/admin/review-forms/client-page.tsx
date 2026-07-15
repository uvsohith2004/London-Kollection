"use client"

import * as React from "react"
import { Plus, Settings, Pencil, Trash2 } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@workspace/ui/components/table"
import { ReviewFormBuilder, ReviewFormSchema } from "./components/review-form-builder"
import { apiClient, post, put, del } from "@/api-client/client"
import { toast } from "sonner"
import { format } from "date-fns"

interface ReviewFormsClientProps {
  initialData: any[]
}

export function ReviewFormsClient({ initialData }: ReviewFormsClientProps) {
  const [forms, setForms] = React.useState<any[]>(initialData)
  const [isCreating, setIsCreating] = React.useState(false)
  const [editingForm, setEditingForm] = React.useState<ReviewFormSchema | null>(null)

  const handleSave = async (data: ReviewFormSchema) => {
    try {
      if (data.id) {
        // Update
        const updated = await put(`/admin/review-forms/${data.id}`, data)
        setForms(forms.map(f => f.id === updated.id ? updated : f))
        toast.success("Review form updated")
      } else {
        // Create
        const created = await post(`/admin/review-forms`, data)
        setForms([...forms, created])
        toast.success("Review form created")
      }
      setIsCreating(false)
      setEditingForm(null)
    } catch (e: any) {
      toast.error(e.message || "Failed to save review form")
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this form?")) return
    try {
      await del(`/admin/review-forms/${id}`)
      setForms(forms.filter(f => f.id !== id))
      toast.success("Review form deleted")
    } catch (e: any) {
      toast.error(e.message || "Failed to delete form")
    }
  }

  if (isCreating || editingForm) {
    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        <h3 className="text-2xl font-semibold mb-6">
          {editingForm ? "Edit Review Form" : "Create Review Form"}
        </h3>
        <ReviewFormBuilder 
          initialData={editingForm || undefined} 
          onSave={handleSave} 
          onCancel={() => {
            setIsCreating(false)
            setEditingForm(null)
          }} 
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">All Forms</h3>
          <p className="text-sm text-muted-foreground">Manage the forms assigned to your products.</p>
        </div>
        <Button onClick={() => setIsCreating(true)} className="rounded-full px-6 font-bold tracking-widest uppercase">
          <Plus className="mr-2 h-4 w-4" /> Add Form
        </Button>
      </div>

      <div className="rounded-xl border border-border/40 bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Fields</TableHead>
              <TableHead>Version</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {forms.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No review forms created yet.
                </TableCell>
              </TableRow>
            ) : (
              forms.map((form) => (
                <TableRow key={form.id}>
                  <TableCell className="font-medium">{form.name}</TableCell>
                  <TableCell>{form.schema?.length || 0} fields</TableCell>
                  <TableCell>v{form.version}</TableCell>
                  <TableCell>{format(new Date(form.createdAt), "MMM d, yyyy")}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => setEditingForm(form)}>
                      <Pencil className="h-4 w-4 text-muted-foreground" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(form.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
