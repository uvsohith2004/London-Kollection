"use client"

import * as React from "react"
import { Plus, X, Settings2, GripVertical } from "lucide-react"
import { Input } from "@workspace/ui/components/input"
import { Button } from "@workspace/ui/components/button"
import { UseFormReturn } from "react-hook-form"
import { ProductFormValues } from "./use-product-form"

interface OptionBuilderProps {
  form: UseFormReturn<ProductFormValues>
  index: number
  onRemove: () => void
}

export function OptionBuilder({ form, index, onRemove }: OptionBuilderProps) {
  const [inputValue, setInputValue] = React.useState("")
  const [isEditingName, setIsEditingName] = React.useState(false)
  
  const namePath = `options.${index}.name` as const
  const valuesPath = `options.${index}.values` as const

  const name = form.watch(namePath)
  const values = form.watch(valuesPath) || []
  const nameError = form.formState.errors.options?.[index]?.name?.message
  const valuesError = form.formState.errors.options?.[index]?.values?.message

  const addValue = (e?: React.MouseEvent | React.KeyboardEvent) => {
    e?.preventDefault()
    const trimmed = inputValue.trim()
    if (!trimmed) return

    if (!values.includes(trimmed)) {
      form.setValue(valuesPath, [...values, trimmed], { shouldValidate: true })
    }
    setInputValue("")
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      addValue(e)
    }
  }

  const removeValue = (valToRemove: string) => {
    form.setValue(
      valuesPath,
      values.filter(v => v !== valToRemove),
      { shouldValidate: true }
    )
  }

  return (
    <div className="group relative bg-card border rounded-xl p-5 shadow-sm transition-all duration-200 hover:border-primary/30">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={onRemove}
        className="absolute -top-3 -right-3 h-8 w-8 rounded-full bg-background border border-border shadow-sm hover:bg-destructive hover:text-destructive-foreground opacity-0 group-hover:opacity-100 transition-all duration-200"
      >
        <X className="h-4 w-4" />
      </Button>

      <div className="space-y-4">
        {/* Title Area */}
        <div className="flex items-center justify-between border-b border-border/50 pb-3">
          <div className="flex-1">
            {!name || isEditingName ? (
              <div className="flex items-center gap-2 max-w-sm">
                <Input
                  placeholder="e.g. Color, Size, Material"
                  {...form.register(namePath)}
                  className="h-9 text-base font-semibold"
                  autoFocus={isEditingName}
                  onBlur={() => setIsEditingName(false)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      setIsEditingName(false)
                    }
                  }}
                />
                <Button 
                  type="button" 
                  size="sm" 
                  variant="secondary" 
                  onClick={() => setIsEditingName(false)}
                >
                  Done
                </Button>
              </div>
            ) : (
              <h3 
                className="text-lg font-semibold flex items-center gap-2 cursor-pointer hover:text-primary transition-colors w-fit"
                onClick={() => setIsEditingName(true)}
                title="Click to edit"
              >
                {name} <Settings2 className="w-4 h-4 text-muted-foreground opacity-50 group-hover:opacity-100" />
              </h3>
            )}
            {nameError && (
              <p className="text-xs text-destructive mt-1">{nameError}</p>
            )}
          </div>
        </div>

        {/* Chips Area */}
        <div className="flex flex-wrap items-center gap-2">
          {values.map((val) => (
            <div
              key={val}
              className="flex items-center gap-1.5 pl-3 pr-1.5 py-1.5 bg-muted text-foreground text-sm font-medium rounded-full border border-border/50 hover:border-primary/50 transition-colors"
            >
              <span>{val}</span>
              <button
                type="button"
                onClick={() => removeValue(val)}
                className="rounded-full p-0.5 hover:bg-destructive/10 hover:text-destructive transition-colors focus:outline-none"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
          
          <div className="relative">
            <Input
              placeholder="Add value..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              className="h-9 w-[160px] rounded-full pl-4 pr-8 bg-transparent border-dashed focus:border-solid"
            />
            <button
              type="button"
              onClick={addValue}
              disabled={!inputValue.trim()}
              className="absolute right-1 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-primary disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {valuesError && (
          <p className="text-xs text-destructive">{valuesError}</p>
        )}
      </div>
    </div>
  )
}
