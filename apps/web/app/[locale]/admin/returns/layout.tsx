"use client"

import { ReactNode } from "react"
import { Tabs, TabsList, TabsTrigger } from "@workspace/ui/components/tabs"
import { useRouter } from "@/i18n/routing"
import { Card } from "@workspace/ui/components/card"

export default function ReturnsLayout({ children }: { children: ReactNode }) {
  const router = useRouter()
  // Try to extract active tab from the URL pathname roughly (for highlighting)
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Returns & Exchanges</h2>
      </div>
      <p className="text-muted-foreground">
        Manage active return requests, define return eligibility rules, and create custom return forms.
      </p>

      <div className="border-b">
        <div className="flex h-12 items-center px-4">
          <Tabs defaultValue="forms" className="w-full">
            <TabsList>
              <TabsTrigger value="requests" onClick={() => router.push("/admin/returns")}>
                Active Requests
              </TabsTrigger>
              <TabsTrigger value="forms" onClick={() => router.push("/admin/returns/forms")}>
                Return Forms
              </TabsTrigger>
              <TabsTrigger value="eligibility" onClick={() => router.push("/admin/returns/eligibility")}>
                Eligibility Settings
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>
      <div className="pt-4">
        {children}
      </div>
    </div>
  )
}
