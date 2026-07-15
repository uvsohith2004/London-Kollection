"use client"

import { useQuery } from "@tanstack/react-query"
import { categoryQueries } from "@/queries/category.queries"
import { CategorySection } from "./components/category-section"
import { ScrollArea } from "@workspace/ui/components/scroll-area"
import { Separator } from "@workspace/ui/components/separator"
import Link from "next/link"

export function CategoriesClientPage() {
  const { data: response } = useQuery(categoryQueries.list())
  
  const categories = Array.isArray(response) ? response : (response?.items || [])
  const activeCategories = categories.filter((c: any) => c.isActive !== false)

  return (
    <div className="container mx-auto px-4 py-12 md:py-16">
      <div className="mb-12">
        <h1 className="font-heading text-5xl md:text-6xl font-bold tracking-tighter">
          Discover Categories
        </h1>
        <p className="mt-4 text-muted-foreground text-lg max-w-2xl">
          Explore our curated selection of premium pieces, meticulously organized by style and purpose.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
        <aside className="hidden lg:block w-64 shrink-0">
          <div className="sticky top-24">
            <h3 className="font-serif text-xl font-semibold mb-6">Directory</h3>
            <ScrollArea className="h-[calc(100vh-12rem)] pr-4">
              <nav className="flex flex-col space-y-1">
                {activeCategories.map((cat: any) => (
                  <Link 
                    key={cat.id} 
                    href={`#category-${cat.slug}`}
                    className="group flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-secondary/40 transition-all text-sm font-medium text-muted-foreground hover:text-foreground"
                  >
                    <span>{cat.name}</span>
                  </Link>
                ))}
              </nav>
            </ScrollArea>
          </div>
        </aside>

        <div className="flex-1 w-full min-w-0">
          {activeCategories.map((cat: any, index: number) => (
            <div key={cat.id}>
              <CategorySection category={cat} />
              {index < activeCategories.length - 1 && (
                <Separator className="my-16 md:my-24 bg-border/50" />
              )}
            </div>
          ))}

          {activeCategories.length === 0 && (
            <div className="py-24 text-center text-muted-foreground">
              No categories found.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
