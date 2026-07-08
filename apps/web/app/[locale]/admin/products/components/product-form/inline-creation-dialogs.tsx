"use client"

import * as React from "react"
import { useState } from "react"
import { Button, buttonVariants } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Textarea } from "@workspace/ui/components/textarea"
import { Switch } from "@workspace/ui/components/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@workspace/ui/components/tabs"
import { Plus, Loader2 } from "lucide-react"
import {
  useCreateCategoryMutation,
  useCreateCollectionMutation,
  useCreateOccasionMutation,
} from "@/app/[locale]/admin/mutations"
import { MediaUploader } from "@/components/media-uploader"

// Utility to generate slug from name
const generateSlug = (name: string) => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

interface DialogProps {
  onSuccess?: () => void
}

export function CreateCategoryDialog({ onSuccess, categories = [] }: DialogProps & { categories?: any[] }) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [slug, setSlug] = useState("")
  const [description, setDescription] = useState("")
  const [image, setImage] = useState("")
  const [parentId, setParentId] = useState<string>("")
  const [seoTitle, setSeoTitle] = useState("")
  const [seoDescription, setSeoDescription] = useState("")
  const [seoKeywords, setSeoKeywords] = useState("")

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value)
    if (!slug || slug === generateSlug(name)) {
      setSlug(generateSlug(e.target.value))
    }
  }

  const mutation = useCreateCategoryMutation()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !slug.trim()) return

    try {
      await mutation.mutateAsync({
        name: name.trim(),
        slug: slug.trim(),
        description: description || undefined,
        image: image || undefined,
        parentId: parentId || undefined,
        seoTitle: seoTitle || undefined,
        seoDescription: seoDescription || undefined,
        seoKeywords: seoKeywords ? seoKeywords.split(",").map(k => k.trim()) : undefined,
      })
      setOpen(false)
      setName("")
      setSlug("")
      setDescription("")
      setImage("")
      setParentId("")
      setSeoTitle("")
      setSeoDescription("")
      setSeoKeywords("")
      onSuccess?.()
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className={buttonVariants({ variant: "ghost", size: "sm", className: "h-8 gap-1 text-primary hover:text-primary hover:bg-primary/10" })} type="button">
        <Plus className="h-3.5 w-3.5" />
        <span>New</span>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create Category</DialogTitle>
            <DialogDescription>
              Add a new category with full details.
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="basic" className="mt-4">
            <TabsList className="mb-4">
              <TabsTrigger value="basic">Basic Details</TabsTrigger>
              <TabsTrigger value="seo">SEO</TabsTrigger>
            </TabsList>
            
            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cat-name">Name <span className="text-destructive">*</span></Label>
                  <Input id="cat-name" value={name} onChange={handleNameChange} placeholder="e.g. Watches" autoFocus />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cat-slug">URL Slug <span className="text-destructive">*</span></Label>
                  <Input id="cat-slug" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="watches" />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Parent Category</Label>
                  <Select onValueChange={(val) => setParentId(val || "")} value={parentId}>
                    <SelectTrigger>
                      <SelectValue placeholder="None (Top Level)">
                        {parentId && parentId !== "none" ? categories.find((c: any) => c.id === parentId)?.name : "None (Top Level)"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None (Top Level)</SelectItem>
                      {categories.map(c => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Image</Label>
                  <MediaUploader 
                    multiple={false} 
                    value={image} 
                    onChange={(val) => setImage(val as string)} 
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="cat-desc">Description</Label>
                <Textarea id="cat-desc" value={description} onChange={(e) => setDescription(e.target.value)} className="resize-none h-20" />
              </div>
            </TabsContent>
            
            <TabsContent value="seo" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cat-seo-title">Meta Title</Label>
                <Input id="cat-seo-title" value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cat-seo-desc">Meta Description</Label>
                <Textarea id="cat-seo-desc" value={seoDescription} onChange={(e) => setSeoDescription(e.target.value)} className="resize-none h-20" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cat-seo-kw">Keywords (comma separated)</Label>
                <Input id="cat-seo-kw" value={seoKeywords} onChange={(e) => setSeoKeywords(e.target.value)} placeholder="luxury, watches, men" />
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={mutation.isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={!name.trim() || !slug.trim() || mutation.isPending}>
              {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Category
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function CreateCollectionDialog({ onSuccess }: DialogProps) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [slug, setSlug] = useState("")
  const [description, setDescription] = useState("")
  const [icon, setIcon] = useState("")
  const [image, setImage] = useState("")
  const [seoTitle, setSeoTitle] = useState("")
  const [seoDescription, setSeoDescription] = useState("")
  const [seoKeywords, setSeoKeywords] = useState("")

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value)
    if (!slug || slug === generateSlug(name)) {
      setSlug(generateSlug(e.target.value))
    }
  }

  const mutation = useCreateCollectionMutation()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !slug.trim()) return

    try {
      await mutation.mutateAsync({
        name: name.trim(),
        slug: slug.trim(),
        description: description || undefined,
        icon: icon || undefined,
        image: image || undefined,
        seoTitle: seoTitle || undefined,
        seoDescription: seoDescription || undefined,
        seoKeywords: seoKeywords ? seoKeywords.split(",").map(k => k.trim()) : undefined,
      })
      setOpen(false)
      setName(""); setSlug(""); setDescription(""); setIcon(""); setImage(""); setSeoTitle(""); setSeoDescription(""); setSeoKeywords("");
      onSuccess?.()
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className={buttonVariants({ variant: "ghost", size: "sm", className: "h-8 gap-1 text-primary hover:text-primary hover:bg-primary/10" })} type="button">
        <Plus className="h-3.5 w-3.5" />
        <span>New</span>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create Collection</DialogTitle>
            <DialogDescription>
              Add a new collection to group related products.
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="basic" className="mt-4">
            <TabsList className="mb-4">
              <TabsTrigger value="basic">Basic Details</TabsTrigger>
              <TabsTrigger value="seo">SEO</TabsTrigger>
            </TabsList>
            
            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Name <span className="text-destructive">*</span></Label>
                  <Input value={name} onChange={handleNameChange} placeholder="Summer 2024" autoFocus />
                </div>
                <div className="space-y-2">
                  <Label>URL Slug <span className="text-destructive">*</span></Label>
                  <Input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="summer-2024" />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Icon (e.g. lucide icon name)</Label>
                  <Input value={icon} onChange={(e) => setIcon(e.target.value)} placeholder="Sun" />
                </div>
                <div className="space-y-2">
                  <Label>Image</Label>
                  <MediaUploader 
                    multiple={false} 
                    value={image} 
                    onChange={(val) => setImage(val as string)} 
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} className="resize-none h-20" />
              </div>
            </TabsContent>

            <TabsContent value="seo" className="space-y-4">
              <div className="space-y-2">
                <Label>Meta Title</Label>
                <Input value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Meta Description</Label>
                <Textarea value={seoDescription} onChange={(e) => setSeoDescription(e.target.value)} className="resize-none h-20" />
              </div>
              <div className="space-y-2">
                <Label>Keywords (comma separated)</Label>
                <Input value={seoKeywords} onChange={(e) => setSeoKeywords(e.target.value)} />
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={mutation.isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={!name.trim() || !slug.trim() || mutation.isPending}>
              {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Collection
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function CreateOccasionDialog({ onSuccess }: DialogProps) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [slug, setSlug] = useState("")
  const [image, setImage] = useState("")
  const [isActive, setIsActive] = useState(true)

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value)
    if (!slug || slug === generateSlug(name)) {
      setSlug(generateSlug(e.target.value))
    }
  }

  const mutation = useCreateOccasionMutation()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !slug.trim()) return

    try {
      await mutation.mutateAsync({
        name: name.trim(),
        slug: slug.trim(),
        image: image || undefined,
        isActive,
      })
      setOpen(false)
      setName(""); setSlug(""); setImage(""); setIsActive(true);
      onSuccess?.()
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className={buttonVariants({ variant: "ghost", size: "sm", className: "h-8 gap-1 text-primary hover:text-primary hover:bg-primary/10" })} type="button">
        <Plus className="h-3.5 w-3.5" />
        <span>New</span>
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create Occasion</DialogTitle>
            <DialogDescription>
              Add a new occasion for gifting or special events.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Name <span className="text-destructive">*</span></Label>
                <Input value={name} onChange={handleNameChange} placeholder="e.g. Wedding" autoFocus />
              </div>
              <div className="space-y-2">
                <Label>URL Slug <span className="text-destructive">*</span></Label>
                <Input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="wedding" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <Switch checked={isActive} onCheckedChange={setIsActive} id="occ-active" />
                  <Label htmlFor="occ-active">Active</Label>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Image</Label>
              <MediaUploader 
                multiple={false} 
                value={image} 
                onChange={(val) => setImage(val as string)} 
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={mutation.isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={!name.trim() || !slug.trim() || mutation.isPending}>
              {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Occasion
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
