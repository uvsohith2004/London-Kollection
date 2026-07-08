"use client"

import * as React from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@workspace/ui/components/tabs"
import { Button } from "@workspace/ui/components/button"
import { Plus, Settings } from "lucide-react"

import { RulesTab } from "./components/rules-tab"
import { RatesTab } from "./components/rates-tab"
import { ClassesTab } from "./components/classes-tab"

export default function TaxesPage() {
  return (
    <div className="mx-auto max-w-[1400px] space-y-12 pb-24 font-sans">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <h2 className="font-heading text-4xl font-light tracking-tight text-foreground uppercase">
            Tax Management
          </h2>
          <p className="text-sm font-medium tracking-widest text-muted-foreground uppercase">
            Rates, Rules & Classes
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" className="rounded-full">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Tabs defaultValue="rules" className="w-full">
        <TabsList className="mb-8 w-full justify-start rounded-none border-b border-border/40 bg-transparent p-0">
          <TabsTrigger 
            value="rules"
            className="data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:text-foreground rounded-none border-b-2 border-transparent px-8 py-4 text-xs font-bold tracking-widest text-muted-foreground uppercase transition-all"
          >
            Tax Rules
          </TabsTrigger>
          <TabsTrigger 
            value="rates"
            className="data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:text-foreground rounded-none border-b-2 border-transparent px-8 py-4 text-xs font-bold tracking-widest text-muted-foreground uppercase transition-all"
          >
            Tax Rates
          </TabsTrigger>
          <TabsTrigger 
            value="classes"
            className="data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:text-foreground rounded-none border-b-2 border-transparent px-8 py-4 text-xs font-bold tracking-widest text-muted-foreground uppercase transition-all"
          >
            Tax Classes
          </TabsTrigger>
        </TabsList>

        <TabsContent value="rules" className="animate-in fade-in duration-500">
          <RulesTab />
        </TabsContent>
        <TabsContent value="rates" className="animate-in fade-in duration-500">
          <RatesTab />
        </TabsContent>
        <TabsContent value="classes" className="animate-in fade-in duration-500">
          <ClassesTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
