"use client"

import * as React from "react"
import { Search, Loader2, User, Mail, Shield } from "lucide-react"

import { useAdminUsersQuery } from "@/app/[locale]/admin/queries"
import { Input } from "@workspace/ui/components/input"

export default function ClientelePage() {
  const [search, setSearch] = React.useState("")
  const { data: responseData, isLoading } = useAdminUsersQuery({ q: search })
  const users = responseData?.items || responseData?.data || (Array.isArray(responseData) ? responseData : [])

  return (
    <div className="mx-auto max-w-[1400px] space-y-12 pb-24 font-sans">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <h2 className="font-heading text-4xl font-light tracking-tight text-foreground">
            Clientele Registry
          </h2>
          <p className="text-sm font-medium tracking-widest text-muted-foreground uppercase">
            User Accounts & Permissions
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input 
            placeholder="Search users..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 pl-10" 
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-border/40 bg-card">
        {isLoading ? (
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="divide-y divide-border/40">
            {users.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground">
                No clients found.
              </div>
            ) : (
              users.map((user: any) => (
                <div key={user.id} className="flex items-center justify-between p-6 hover:bg-muted/20 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted text-foreground">
                      <User className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{user.name || "Unknown User"}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Mail className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{user.email}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="inline-flex items-center rounded-full bg-muted/50 px-3 py-1 text-[10px] font-bold tracking-wider uppercase text-foreground">
                      <Shield className="mr-1.5 h-3 w-3 text-muted-foreground" />
                      {user.role || "Customer"}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}
