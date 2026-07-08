"use client"

import * as React from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@workspace/ui/components/tabs"

import { CategoriesTab } from "./components/categories-tab"
import { BrandsTab } from "./components/brands-tab"
import { CollectionsTab } from "./components/collections-tab"
import { OccasionsTab } from "./components/occasions-tab"

export default function CatalogPage() {
  return (
    <div className="mx-auto max-w-[1400px] space-y-12 pb-24 font-sans">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <h2 className="font-heading text-4xl font-light tracking-tight text-foreground uppercase">
            Catalog
          </h2>
          <p className="text-sm font-medium tracking-widest text-muted-foreground uppercase">
            Taxonomy & Organization
          </p>
        </div>
      </div>

      <Tabs defaultValue="categories" className="w-full">
        <TabsList className="mb-8 w-full justify-start rounded-none border-b border-border/40 bg-transparent p-0">
          <TabsTrigger 
            value="categories"
            className="data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:text-foreground rounded-none border-b-2 border-transparent px-8 py-4 text-xs font-bold tracking-widest text-muted-foreground uppercase transition-all"
          >
            Categories
          </TabsTrigger>
          <TabsTrigger 
            value="brands"
            className="data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:text-foreground rounded-none border-b-2 border-transparent px-8 py-4 text-xs font-bold tracking-widest text-muted-foreground uppercase transition-all"
          >
            Brands
          </TabsTrigger>
          <TabsTrigger 
            value="collections"
            className="data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:text-foreground rounded-none border-b-2 border-transparent px-8 py-4 text-xs font-bold tracking-widest text-muted-foreground uppercase transition-all"
          >
            Collections
          </TabsTrigger>
          <TabsTrigger 
            value="occasions"
            className="data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:text-foreground rounded-none border-b-2 border-transparent px-8 py-4 text-xs font-bold tracking-widest text-muted-foreground uppercase transition-all"
          >
            Occasions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="categories" className="animate-in fade-in duration-500">
          <CategoriesTab />
        </TabsContent>
        <TabsContent value="brands" className="animate-in fade-in duration-500">
          <BrandsTab />
        </TabsContent>
        <TabsContent value="collections" className="animate-in fade-in duration-500">
          <CollectionsTab />
        </TabsContent>
        <TabsContent value="occasions" className="animate-in fade-in duration-500">
          <OccasionsTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
