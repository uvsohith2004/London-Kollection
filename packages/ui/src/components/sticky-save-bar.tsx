"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import { Loader2, Save, X } from "lucide-react"

import { cn } from "@workspace/ui/lib/utils"
import { Button } from "@workspace/ui/components/button"

export interface StickySaveBarProps {
  onSave?: () => void
  onCancel?: () => void
  isPending?: boolean
  disabled?: boolean
  saveActionLabel?: React.ReactNode
  cancelActionLabel?: React.ReactNode
  infoPanel?: React.ReactNode
  formId?: string
}

export function StickySaveBar({
  onSave,
  onCancel,
  isPending = false,
  disabled = false,
  saveActionLabel = "Save",
  cancelActionLabel = "Cancel",
  infoPanel,
  formId,
}: StickySaveBarProps) {
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const portalElement = document.getElementById("admin-save-bar-portal")
  if (!portalElement) {
    console.warn("StickySaveBar: #admin-save-bar-portal not found in the DOM.")
    return null
  }

  // Determine button type and click handler based on formId
  const primaryButtonProps = formId
    ? { type: "submit" as const, form: formId }
    : { type: "button" as const, onClick: onSave }

  const barContent = (
    <div className="pointer-events-auto w-full pb-safe border-t border-border bg-background/95 backdrop-blur-xl animate-in slide-in-from-bottom-8 duration-300 fade-in">
      {/* Desktop & Tablet Layout */}
      <div className="hidden sm:flex items-center justify-between gap-6 px-6 py-4">
        <div className="flex-1 min-w-0">
          {infoPanel && (
            <div className="flex items-center gap-4 text-sm text-muted-foreground truncate">
              {infoPanel}
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-3 shrink-0">
          {onCancel && (
            <Button
              variant="outline"
              type="button"
              onClick={onCancel}
              disabled={isPending}
              className="min-w-[100px] rounded-xl"
            >
              <X className="mr-2 h-4 w-4" />
              {cancelActionLabel}
            </Button>
          )}
          <Button
            {...primaryButtonProps}
            disabled={disabled || isPending}
            className="min-w-[140px] rounded-xl font-bold tracking-widest uppercase transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            {isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            {isPending ? "Saving..." : saveActionLabel}
          </Button>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="flex sm:hidden flex-col gap-3 px-4 py-3">
        {infoPanel && (
          <div className="text-xs text-muted-foreground truncate">
            {infoPanel}
          </div>
        )}
        <div className="flex items-center gap-2">
          {onCancel && (
            <Button
              variant="outline"
              type="button"
              onClick={onCancel}
              disabled={isPending}
              className="flex-1 rounded-xl h-12"
            >
              {cancelActionLabel}
            </Button>
          )}
          <Button
            {...primaryButtonProps}
            disabled={disabled || isPending}
            className="flex-[2] rounded-xl h-12 font-bold tracking-widest uppercase"
          >
            {isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            {isPending ? "Saving..." : saveActionLabel}
          </Button>
        </div>
      </div>
    </div>
  )

  return createPortal(barContent, portalElement)
}
