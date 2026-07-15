"use client"

import * as React from "react"
import { Plus, Trash2, GripVertical, Settings } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Textarea } from "@workspace/ui/components/textarea"
import { Switch } from "@workspace/ui/components/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select"
import { Card } from "@workspace/ui/components/card"
import { z } from "zod"

export type FieldType = "radio" | "checkbox" | "select" | "multiselect" | "short_text" | "long_text" | "number" | "yes_no";

export interface ReviewFormField {
  id: string
  type: FieldType
  label: string
  description?: string
  required: boolean
  options?: string[]
  placeholder?: string
}

export interface ReviewFormSchema {
  id?: string
  name: string
  description?: string
  schema: ReviewFormField[]
}

interface ReviewFormBuilderProps {
  initialData?: ReviewFormSchema
  onSave: (data: ReviewFormSchema) => void
  onCancel: () => void
}

export function ReviewFormBuilder({ initialData, onSave, onCancel }: ReviewFormBuilderProps) {
  const [name, setName] = React.useState(initialData?.name || "")
  const [description, setDescription] = React.useState(initialData?.description || "")
  const [fields, setFields] = React.useState<ReviewFormField[]>(initialData?.schema || [])

  const addField = (type: FieldType) => {
    const newField: ReviewFormField = {
      id: Math.random().toString(36).substring(7),
      type,
      label: `New ${type.replace("_", " ")} field`,
      required: false,
    }
    
    if (["radio", "select", "multiselect"].includes(type)) {
      newField.options = ["Option 1", "Option 2"]
    }
    
    setFields([...fields, newField])
  }

  const updateField = (id: string, updates: Partial<ReviewFormField>) => {
    setFields(fields.map(f => f.id === id ? { ...f, ...updates } : f))
  }

  const removeField = (id: string) => {
    setFields(fields.filter(f => f.id !== id))
  }

  const handleSave = () => {
    onSave({
      id: initialData?.id,
      name,
      description,
      schema: fields
    })
  }

  return (
    <Card className="p-6 space-y-8 bg-card border-border/40">
      <div className="space-y-4">
        <div>
          <Label>Form Name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Default Product Review" />
        </div>
        <div>
          <Label>Description (Optional)</Label>
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Brief description of this form..." />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2">Fields</h3>
        
        <div className="space-y-4">
          {fields.map((field, index) => (
            <div key={field.id} className="relative p-4 border rounded-xl bg-background flex gap-4">
              <div className="cursor-grab pt-2 text-muted-foreground opacity-50 hover:opacity-100">
                <GripVertical className="h-5 w-5" />
              </div>
              
              <div className="flex-1 space-y-4">
                <div className="flex gap-4">
                  <div className="flex-1 space-y-2">
                    <Label>Field Label</Label>
                    <Input 
                      value={field.label} 
                      onChange={(e) => updateField(field.id, { label: e.target.value })} 
                    />
                  </div>
                  <div className="w-48 space-y-2">
                    <Label>Type</Label>
                    <Select value={field.type} onValueChange={(val) => updateField(field.id, { type: val as FieldType })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>

                        <SelectItem value="short_text">Short Text</SelectItem>
                        <SelectItem value="long_text">Long Text</SelectItem>
                        <SelectItem value="radio">Single Choice</SelectItem>
                        <SelectItem value="checkbox">Multiple Choice (Checkboxes)</SelectItem>
                        <SelectItem value="yes_no">Yes / No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {["short_text", "long_text"].includes(field.type) && (
                  <div className="space-y-2">
                    <Label>Placeholder</Label>
                    <Input 
                      value={field.placeholder || ""} 
                      onChange={(e) => updateField(field.id, { placeholder: e.target.value })} 
                    />
                  </div>
                )}

                {["radio", "select", "multiselect", "checkbox"].includes(field.type) && (
                  <div className="space-y-2">
                    <Label>Options (comma separated)</Label>
                    <Input 
                      value={field.options?.join(", ") || ""} 
                      onChange={(e) => updateField(field.id, { options: e.target.value.split(",").map(s => s.trim()) })} 
                    />
                  </div>
                )}

                <div className="flex items-center gap-2 pt-2">
                  <Switch 
                    checked={field.required} 
                    onCheckedChange={(val) => updateField(field.id, { required: !!val })} 
                  />
                  <Label>Required</Label>
                </div>
              </div>

              <div className="pt-8">
                <Button variant="ghost" size="icon" onClick={() => removeField(field.id)} className="text-destructive hover:bg-destructive/10">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-2 pt-4">

          <Button type="button" variant="outline" size="sm" onClick={() => addField("short_text")}>
            <Plus className="mr-2 h-4 w-4" /> Short Text
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={() => addField("long_text")}>
            <Plus className="mr-2 h-4 w-4" /> Long Text
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={() => addField("radio")}>
            <Plus className="mr-2 h-4 w-4" /> Choice
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={() => addField("yes_no")}>
            <Plus className="mr-2 h-4 w-4" /> Yes/No
          </Button>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-6 border-t border-border/40">
        <Button variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button onClick={handleSave} disabled={!name || fields.length === 0}>
          Save Form
        </Button>
      </div>
    </Card>
  )
}
