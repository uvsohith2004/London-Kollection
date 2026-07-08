"use client"

import * as React from "react"
import {  X, Loader2, Image as  Plus } from "lucide-react"
import { useDropzone } from "react-dropzone"
import { useUploadMediaMutation } from "@/app/[locale]/admin/mutations"
import { cn } from "@workspace/ui/lib/utils"
import { ImageCropperDialog } from "./image-cropper"

interface MediaUploaderProps {
  value?: any // Can be string, string[], OptimizedImageAsset, or OptimizedImageAsset[]
  onChange: (value: any) => void
  multiple?: boolean
  preset?: "avatar" | "product" | "banner" | "category" | "logo"
  className?: string
  cropAspect?: number
  cropShape?: "rect" | "round"
}

export function MediaUploader({ value, onChange, multiple = false, preset, className, cropAspect, cropShape }: MediaUploaderProps) {
  const uploadMutation = useUploadMediaMutation()
  
  // Ensure values is always an array for internal state handling
  const values = React.useMemo(() => {
    if (!value) return []
    return Array.isArray(value) ? value : [value]
  }, [value])
  
  // Local state to hold temporary blob URLs for immediate preview
  const [localPreviews, setLocalPreviews] = React.useState<Record<string, string>>({})
  const [cropFileToProcess, setCropFileToProcess] = React.useState<File | null>(null)

  const processFiles = React.useCallback(async (files: File[]) => {
    try {
      const newUrls: any[] = []
      const newLocalPreviews = { ...localPreviews }
      
      for (const file of files) {
        // Create a temporary local preview immediately
        const tempId = Math.random().toString(36).substring(7)
        const objectUrl = URL.createObjectURL(file)
        newLocalPreviews[tempId] = objectUrl
        setLocalPreviews(newLocalPreviews)

        // Upload each file
        const res: any = await uploadMutation.mutateAsync({ file, preset })
        
        // res should contain the url (e.g., res.url or res.key) or avif/webp if optimized
        const previewKey = res.avif?.url || res.url || res.key 
        const finalValue = res.avif ? res : previewKey
        
        // Map the final URL to the local preview so we can use the local preview until refresh
        if (previewKey) {
          newLocalPreviews[previewKey] = objectUrl
        }
        setLocalPreviews(newLocalPreviews)
        
        newUrls.push(finalValue)
      }

      if (multiple) {
        onChange([...values, ...newUrls])
      } else {
        onChange(newUrls[0] || "")
      }
    } catch (err) {
      console.error("Upload failed", err)
    }
  }, [multiple, onChange, values, uploadMutation, localPreviews, preset])

  const onDrop = React.useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (cropAspect && file && !multiple) {
      setCropFileToProcess(file)
      return
    }
    await processFiles(acceptedFiles)
  }, [cropAspect, multiple, processFiles])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp', '.svg']
    },
    multiple
  })

  const handleRemove = (e: React.MouseEvent, indexToRemove: number) => {
    e.stopPropagation()
    if (multiple) {
      const newValues = values.filter((_, i) => i !== indexToRemove)
      onChange(newValues)
    } else {
      onChange("")
    }
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex flex-wrap gap-4">
        {/* Render existing images */}
        {values.map((val, idx) => {
          const isString = typeof val === "string"
          const urlKey = isString ? val : (val?.avif?.url || val?.webp?.url || val?.url || "")
          return (
            <div key={idx} className="relative group w-24 h-24 sm:w-32 sm:h-32 rounded-xl overflow-hidden border border-border/40 bg-muted shrink-0">
              <img 
                src={localPreviews[urlKey] || urlKey} 
                alt={`Preview ${idx}`} 
                className="w-full h-full object-cover transition-transform group-hover:scale-105"
                onError={(e) => {
                  // If the remote URL fails, and we don't have a local preview, it shows broken.
                }}
              />
            <button
              type="button"
              onClick={(e) => handleRemove(e, idx)}
              className="absolute top-1.5 right-1.5 p-1.5 bg-background/80 backdrop-blur-md rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive hover:text-destructive-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )})}

        {/* Plus Box Uploader */}
        {(!multiple && values.length === 0) || multiple ? (
          <div 
            {...getRootProps()} 
            className={cn(
              "w-24 h-24 sm:w-32 sm:h-32 border-2 border-dashed rounded-xl transition-colors text-center cursor-pointer flex flex-col items-center justify-center shrink-0",
              isDragActive ? "border-primary bg-primary/5" : "border-border/60 hover:border-primary/50 hover:bg-muted/10",
              uploadMutation.isPending && "opacity-50 pointer-events-none"
            )}
          >
            <input {...getInputProps()} />
            {uploadMutation.isPending ? (
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            ) : (
              <Plus className="h-6 w-6 text-muted-foreground" />
            )}
          </div>
        ) : null}
      </div>

      {cropFileToProcess && (
        <ImageCropperDialog
          open={!!cropFileToProcess}
          imageSrc={URL.createObjectURL(cropFileToProcess)}
          onClose={() => setCropFileToProcess(null)}
          onCropComplete={async (croppedFile) => {
            setCropFileToProcess(null)
            await processFiles([croppedFile])
          }}
          isUploading={uploadMutation.isPending}
          cropShape={cropShape}
          aspect={cropAspect}
        />
      )}
    </div>
  )
}
