"use client"

import * as React from "react"
import { EyeIcon, EyeOffIcon } from "lucide-react"
import { Input } from "@workspace/ui/components/input"
import { cn } from "@workspace/ui/lib/utils"

const PasswordInput = React.forwardRef<HTMLInputElement, React.ComponentProps<typeof Input>>(
  ({ className, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false)

    return (
      <div className="relative w-full">
        <Input
          type={showPassword ? "text" : "password"}
          className={cn("pr-10", className)}
          ref={ref}
          {...props}
        />
        <button
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          className="absolute right-0 top-1/2 -translate-y-1/2 flex h-full w-10 items-center justify-center text-muted-foreground hover:text-foreground focus-visible:outline-none transition-colors"
          tabIndex={-1}
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? (
            <EyeOffIcon className="h-4 w-4" aria-hidden="true" />
          ) : (
            <EyeIcon className="h-4 w-4" aria-hidden="true" />
          )}
        </button>
        {/* Hide default native password toggle in Edge */}
        <style dangerouslySetInnerHTML={{ __html: `
          input[type="password"]::-ms-reveal,
          input[type="password"]::-ms-clear {
            display: none;
          }
        ` }} />
      </div>
    )
  }
)
PasswordInput.displayName = "PasswordInput"

export { PasswordInput }
