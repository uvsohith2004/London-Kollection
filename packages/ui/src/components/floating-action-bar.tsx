import * as React from "react"
import { cn } from "@workspace/ui/lib/utils"

export interface FloatingActionBarProps extends React.HTMLAttributes<HTMLDivElement> {}

const FloatingActionBar = React.forwardRef<HTMLDivElement, FloatingActionBarProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "sticky bottom-6 z-40 mx-auto mt-12 flex max-w-fit items-center gap-4 rounded-full border border-border/40 bg-background/90 p-2 px-4 py-3 shadow-2xl backdrop-blur-xl transition-all duration-300 animate-in slide-in-from-bottom-10",
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)
FloatingActionBar.displayName = "FloatingActionBar"

export { FloatingActionBar }
