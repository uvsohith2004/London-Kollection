"use client"

import * as React from "react"
import { X } from "lucide-react"
import { Input } from "@workspace/ui/components/input"
import { cn } from "@workspace/ui/lib/utils"

interface TagInputProps extends Omit<React.ComponentProps<"input">, "value" | "onChange"> {
  value: string[]
  onChange: (value: string[]) => void
}

export const TagInput = React.forwardRef<HTMLInputElement, TagInputProps>(
  ({ value = [], onChange, className, ...props }, ref) => {
    const [inputValue, setInputValue] = React.useState("")

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" || e.key === ",") {
        e.preventDefault()
        const newTag = inputValue.trim()
        if (newTag && !value.includes(newTag)) {
          onChange([...value, newTag])
        }
        setInputValue("")
      } else if (e.key === "Backspace" && !inputValue && value.length > 0) {
        onChange(value.slice(0, -1))
      }
    }

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
      e.preventDefault()
      const pastedText = e.clipboardData.getData("text")
      if (!pastedText) return
      
      const pastedTags = pastedText
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)

      if (pastedTags.length > 0) {
        const newTags = Array.from(new Set([...value, ...pastedTags]))
        onChange(newTags)
      }
    }

    const removeTag = (tagToRemove: string) => {
      onChange(value.filter(tag => tag !== tagToRemove))
    }

    return (
      <div className={cn("flex min-h-11 w-full flex-wrap gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2", className)}>
        {value.map((tag: string) => (
          <span key={tag} className="flex items-center gap-1 rounded-md bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground">
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="rounded-full outline-none hover:bg-muted focus:bg-muted"
            >
              <X className="h-3 w-3" />
              <span className="sr-only">Remove {tag}</span>
            </button>
          </span>
        ))}
        <input
          ref={ref}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          className="flex-1 bg-transparent outline-none placeholder:text-muted-foreground min-w-[120px]"
          {...props}
        />
      </div>
    )
  }
)
TagInput.displayName = "TagInput"
