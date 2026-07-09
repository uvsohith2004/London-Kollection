"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { Label } from "@workspace/ui/components/label"
import { Button } from "@workspace/ui/components/button"
import { Moon, Sun } from "lucide-react"
import { cn } from "@workspace/ui/lib/utils"

const THEMES = [
  { name: "zinc", color: "bg-zinc-500" },
  { name: "red", color: "bg-red-500" },
]

export function ThemeSelector() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [activeColor, setActiveColor] = React.useState<string | null>(null)
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem("theme-color") || "zinc"
    setActiveColor(saved)
  }, [])



  const handleColorChange = (colorName: string) => {
    setActiveColor(colorName)
    localStorage.setItem("theme-color", colorName)
    if (colorName === "zinc") {
      document.documentElement.removeAttribute("data-theme")
    } else {
      document.documentElement.setAttribute("data-theme", colorName)
    }
  }

  return (
    <div className="space-y-6">
      {/* Dark Mode Toggle */}
      <div className="space-y-3">
        <Label className="text-foreground text-base">Appearance</Label>
        <div className="grid grid-cols-2 gap-2 bg-secondary/30 p-1 rounded-xl">
          <Button
            type="button"
            variant="ghost"
            className={cn(
              "h-12 w-full justify-center gap-2 rounded-lg transition-all",
              (mounted && (theme === "light" || (theme === "system" && resolvedTheme === "light")))
                ? "bg-background text-foreground shadow-sm ring-1 ring-border/50" 
                : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
            )}
            onClick={() => setTheme("light")}
          >
            <Sun className="h-5 w-5" />
            Light
          </Button>
          <Button
            type="button"
            variant="ghost"
            className={cn(
              "h-12 w-full justify-center gap-2 rounded-lg transition-all",
              (mounted && (theme === "dark" || (theme === "system" && resolvedTheme === "dark")))
                ? "bg-background text-foreground shadow-sm ring-1 ring-border/50" 
                : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
            )}
            onClick={() => setTheme("dark")}
          >
            <Moon className="h-5 w-5" />
            Dark
          </Button>
        </div>
      </div>

      {/* Theme Color Selector */}
      <div className="space-y-3">
        <Label className="text-foreground text-base">Theme Color</Label>
        <div className="flex flex-wrap items-center gap-3">
          {THEMES.map((t) => (
            <button
              key={t.name}
              type="button"
              onClick={() => handleColorChange(t.name)}
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full transition-all hover:scale-110",
                (mounted && activeColor === t.name) ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : "ring-1 ring-border"
              )}
            >
              <span className={cn("h-8 w-8 rounded-full", t.color)} />
              <span className="sr-only">{t.name} theme</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
