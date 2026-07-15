"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Save, GripVertical, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select";
import { Card } from "@workspace/ui/components/card";
import { Switch } from "@workspace/ui/components/switch";
import { get, post, put, del } from "@/api/client";
import { StickySaveBar } from "@workspace/ui/components/sticky-save-bar";

export function ReviewFormBuilder() {
  const queryClient = useQueryClient();
  const [editingFormId, setEditingFormId] = useState<string | null>(null);

  // Form state for creating/editing
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [schema, setSchema] = useState<any[]>([]);

  const { data: forms = [], isLoading } = useQuery({
    queryKey: ["adminReviewForms"],
    queryFn: async () => {
      const res: any = await get("/admin/review-forms");
      return res?.forms || [];
    }
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      return post("/admin/review-forms", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminReviewForms"] });
      toast.success("Review form created");
      resetForm();
    },
    onError: (err: any) => toast.error(err.message || "Failed to create form")
  });

  const updateMutation = useMutation({
    mutationFn: async (data: { id: string; payload: any }) => {
      return put(`/admin/review-forms/${data.id}`, data.payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminReviewForms"] });
      toast.success("Review form updated");
      resetForm();
    },
    onError: (err: any) => toast.error(err.message || "Failed to update form")
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return del(`/admin/review-forms/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminReviewForms"] });
      toast.success("Review form deleted");
      if (editingFormId) resetForm();
    },
    onError: (err: any) => toast.error(err.message || "Failed to delete form")
  });

  const resetForm = () => {
    setEditingFormId(null);
    setName("");
    setDescription("");
    setSchema([]);
  };

  const handleEdit = (form: any) => {
    setEditingFormId(form.id);
    setName(form.name);
    setDescription(form.description || "");
    setSchema(form.schema || []);
  };

  const handleSave = () => {
    if (!name) return toast.error("Name is required");

    // Give each field an ID if it doesn't have one
    const parsedSchema = schema.map(field => ({
      ...field,
      id: field.id || Math.random().toString(36).substring(2, 9)
    }));

    const payload = { name, description, schema: parsedSchema };

    if (editingFormId) {
      updateMutation.mutate({ id: editingFormId, payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const addField = () => {
    setSchema([
      ...schema,
      { id: Math.random().toString(36).substring(2, 9), type: "short_text", label: "New Question", required: false }
    ]);
  };

  const updateField = (index: number, updates: any) => {
    const newSchema = [...schema];
    newSchema[index] = { ...newSchema[index], ...updates };
    setSchema(newSchema);
  };

  const removeField = (index: number) => {
    setSchema(schema.filter((_, i) => i !== index));
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-6">
      {/* Forms List */}
      <div className="md:col-span-1 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg">Existing Forms</h3>
          <Button variant="outline" size="sm" onClick={resetForm}>
            <Plus className="w-4 h-4 mr-2" /> New
          </Button>
        </div>
        
        {isLoading ? (
          <div className="flex items-center justify-center py-8 text-muted-foreground">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : forms.length === 0 ? (
          <div className="p-4 border border-dashed rounded-lg text-center text-sm text-muted-foreground">
            No forms found. Create your first one!
          </div>
        ) : (
          <div className="space-y-2">
            {forms.map((form: any) => (
              <Card 
                key={form.id} 
                className={`p-4 cursor-pointer transition-colors hover:border-primary ${editingFormId === form.id ? 'border-primary ring-1 ring-primary' : ''}`}
                onClick={() => handleEdit(form)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-sm">{form.name}</h4>
                    <p className="text-xs text-muted-foreground mt-1">v{form.version} &middot; {form.schema?.length || 0} fields</p>
                  </div>
                  <Button variant="ghost" size="icon" className="text-destructive h-8 w-8" onClick={(e) => { e.stopPropagation(); deleteMutation.mutate(form.id); }}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Form Editor */}
      <div className="md:col-span-2">
        <Card className="p-6 space-y-6">
          <div className="flex items-center justify-between border-b pb-4">
            <h3 className="font-semibold text-lg">{editingFormId ? "Edit Form" : "Create New Form"}</h3>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Form Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. T-Shirt Feedback" />
            </div>
            <div className="space-y-2">
              <Label>Description (Internal)</Label>
              <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional description..." />
            </div>
          </div>

          <div className="space-y-4 pt-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Form Fields</h4>
              <Button variant="secondary" size="sm" onClick={addField}>
                <Plus className="w-4 h-4 mr-2" /> Add Field
              </Button>
            </div>

            {schema.length === 0 ? (
              <div className="p-8 border border-dashed rounded-lg text-center text-sm text-muted-foreground">
                No fields added yet. The user will only be asked for a star rating and comment.
              </div>
            ) : (
              <div className="space-y-4">
                {schema.map((field, idx) => (
                  <Card key={idx} className="p-4 flex gap-4 bg-muted/30">
                    <div className="flex flex-col gap-4 flex-1">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-xs">Field Label</Label>
                          <Input 
                            value={field.label} 
                            onChange={(e) => updateField(idx, { label: e.target.value })} 
                            placeholder="e.g. How does it fit?" 
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs">Field Type</Label>
                          <Select 
                            value={field.type} 
                            onValueChange={(val) => updateField(idx, { type: val })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="short_text">Short Text</SelectItem>
                              <SelectItem value="long_text">Long Text</SelectItem>
                              <SelectItem value="yes_no">Yes / No</SelectItem>
                              <SelectItem value="rating">Star Rating (1-5)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Switch 
                            checked={field.required} 
                            onCheckedChange={(val) => updateField(idx, { required: val })} 
                          />
                          <Label className="text-xs cursor-pointer">Required</Label>
                        </div>
                      </div>
                    </div>
                    <div className="pt-8">
                      <Button variant="ghost" size="icon" className="text-destructive h-8 w-8" onClick={() => removeField(idx)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>
    <StickySaveBar 
        onSave={handleSave}
        onCancel={resetForm}
        isPending={createMutation.isPending || updateMutation.isPending}
        saveActionLabel={editingFormId ? "Save Changes" : "Create Form"}
        infoPanel={
          <div className="flex items-center gap-2">
            <span className="font-medium text-foreground">{editingFormId ? "Edit Review Form" : "New Review Form"}</span>
            <span className="text-muted-foreground">&bull;</span>
            <span>{name || "Untitled"}</span>
          </div>
        }
      />
    </div>
  );
}
