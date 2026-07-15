"use client"

import * as React from "react"
import { UseFormReturn } from "react-hook-form"
import { Input } from "@workspace/ui/components/input"
import { Textarea } from "@workspace/ui/components/textarea"
import { Field, FieldLabel, FieldError, FieldDescription } from "@workspace/ui/components/field"
import { TagInput } from "@/components/ui/tag-input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Search } from "lucide-react"

interface SEOFormSectionProps {
  form: UseFormReturn<any>
  titleKey?: string
  descriptionKey?: string
  keywordsKey?: string
}

export function SEOFormSection({ 
  form, 
  titleKey = "seoTitle", 
  descriptionKey = "seoDescription", 
  keywordsKey = "seoKeywords" 
}: SEOFormSectionProps) {
  const metaTitle = form.watch(titleKey) || ""
  const metaDesc = form.watch(descriptionKey) || ""
  const textareaRef = React.useRef<HTMLTextAreaElement | null>(null)

  // Auto-resize logic for the text area
  React.useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${Math.max(80, textareaRef.current.scrollHeight)}px`
    }
  }, [metaDesc])

  return (
    <Card id="seo-settings" className="overflow-hidden border-border/60 shadow-sm">
      
      {/* Matched Premium Header Design */}
      <CardHeader className="flex flex-row items-center gap-5 border-b border-border/40 bg-muted/10 px-6 py-6 sm:px-8">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-border/50 bg-background text-primary shadow-sm">
          <Search className="h-6 w-6" />
        </div>
        <div className="flex flex-col space-y-1.5">
          <CardTitle className="text-xl font-semibold tracking-tight text-foreground">
            Search Engine Optimization
          </CardTitle>
          <CardDescription className="text-sm font-medium text-muted-foreground">
            Improve discoverability and ranking on Google and other search engines.
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col space-y-8 px-6 py-8 sm:px-8">
        
        {/* Meta Title */}
        <div className="w-full min-w-0">
          <Field className="space-y-2">
            <div className="flex items-center justify-between">
              <FieldLabel htmlFor={titleKey} className="font-semibold">Meta Title</FieldLabel>
              <span className={`text-xs font-medium ${metaTitle.length > 60 ? 'text-destructive' : 'text-muted-foreground'}`}>
                {metaTitle.length} / 60
              </span>
            </div>
            <Input 
              id={titleKey}
              placeholder="e.g. Classic White T-Shirt | London Kollection" 
              {...form.register(titleKey)} 
              className="h-11 w-full min-w-0" 
            />
            {metaTitle.length > 60 && (
              <FieldDescription className="text-xs text-destructive">
                Recommended length is under 60 characters to prevent truncation.
              </FieldDescription>
            )}
            <FieldError errors={[form.formState.errors[titleKey]]} />
          </Field>
        </div>

        {/* Meta Description */}
        <div className="w-full min-w-0">
          <Field className="space-y-2">
            <div className="flex items-center justify-between">
              <FieldLabel htmlFor={descriptionKey} className="font-semibold">Meta Description</FieldLabel>
              <span className={`text-xs font-medium ${metaDesc.length > 160 ? 'text-destructive' : 'text-muted-foreground'}`}>
                {metaDesc.length} / 160
              </span>
            </div>
            <Textarea 
              id={descriptionKey}
              placeholder="Write a brief summary for search engines..." 
              maxLength={160}
              {...form.register(descriptionKey)} 
              ref={(e) => {
                form.register(descriptionKey).ref(e)
                textareaRef.current = e
              }}
              className="min-h-[80px]  w-full min-w-0 resize-none break-words overflow-hidden text-base sm:text-sm" 
            />
            {metaDesc.length > 160 && (
              <FieldDescription className="text-xs text-destructive">
                Recommended length is under 160 characters for optimal display in search results.
              </FieldDescription>
            )}
            <FieldError errors={[form.formState.errors[descriptionKey]]} />
          </Field>
        </div>

        {/* SEO Keywords */}
        <div className="w-full min-w-0 border-t border-border/40 pt-8">
          <Field className="space-y-2">
            <FieldLabel htmlFor={keywordsKey} className="font-semibold">Search Keywords</FieldLabel>
            <div className="w-full min-w-0">
              <TagInput 
                id={keywordsKey}
                placeholder="Add keyword and press enter..."
                value={form.watch(keywordsKey) || []}
                onChange={(val: string[]) => form.setValue(keywordsKey, val, { shouldValidate: true })}
              />
            </div>
            <FieldDescription className="text-xs text-muted-foreground">
              Press Enter or type a comma to add a keyword. Used for internal search and meta tags.
            </FieldDescription>
            <FieldError errors={[form.formState.errors[keywordsKey]]} />
          </Field>
        </div>

      </CardContent>
    </Card>
  )
}
