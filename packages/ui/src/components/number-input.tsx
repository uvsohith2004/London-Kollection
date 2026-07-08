import * as React from "react"
import { cn } from "@workspace/ui/lib/utils"
import { Input } from "@workspace/ui/components/input"

export interface NumberInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  allowDecimals?: boolean
}

const NumberInput = React.forwardRef<HTMLInputElement, NumberInputProps>(
  ({ className, allowDecimals = true, onKeyDown, ...props }, ref) => {
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      const allowedKeys = [
        "Backspace", "Tab", "End", "Home", "ArrowLeft", "ArrowRight", "Delete", "Enter", "Escape"
      ];
      const isNumber = /^[0-9]$/.test(e.key);
      const isDecimal = e.key === "." || e.key === ",";
      
      // Allow Ctrl/Cmd + A, C, V, X
      const isShortcut = (e.ctrlKey || e.metaKey) && ["a", "c", "v", "x"].includes(e.key.toLowerCase());

      if (!isNumber && !allowedKeys.includes(e.key) && !(allowDecimals && isDecimal) && !isShortcut) {
        e.preventDefault();
      }

      // Prevent multiple decimals
      if (allowDecimals && isDecimal) {
        const value = e.currentTarget.value;
        if (value.includes(".") || value.includes(",")) {
          e.preventDefault();
        }
      }

      if (onKeyDown) {
        onKeyDown(e);
      }
    };

    return (
      <Input
        type="text"
        inputMode={allowDecimals ? "decimal" : "numeric"}
        className={cn("tabular-nums text-right font-mono transition-shadow focus-visible:ring-2 focus-visible:ring-foreground", className)}
        ref={ref}
        onKeyDown={handleKeyDown}
        {...props}
      />
    )
  }
)
NumberInput.displayName = "NumberInput"

export { NumberInput }
