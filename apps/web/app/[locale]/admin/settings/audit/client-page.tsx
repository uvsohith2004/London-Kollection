"use client"

import { useState } from "react"
import { useAuditLogsQuery } from "./queries"
import { useDeleteAuditLogMutation } from "./mutations"
import { Input } from "@workspace/ui/components/input"
import { Button } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"
import { 
  Loader2, 
  Search, 
  Trash2, 
  AlertCircle, 
  CheckCircle2, 
  AlertTriangle,
  Clock,
  ShieldAlert
} from "lucide-react"

export default function AuditComponent() {
  const [searchQuery, setSearchQuery] = useState("")
  
  const { data: logs, isLoading, isError } = useAuditLogsQuery()
  const { mutate: deleteLog, isPending: isDeleting } = useDeleteAuditLogMutation()

  const filteredLogs = logs?.filter((log) => 
    log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.actor.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.target.toLowerCase().includes(searchQuery.toLowerCase())
  ) || []

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "success": 
        return { icon: CheckCircle2, bg: "bg-emerald-500/10", text: "text-emerald-600 dark:text-emerald-400" }
      case "warning": 
        return { icon: AlertTriangle, bg: "bg-amber-500/10", text: "text-amber-600 dark:text-amber-400" }
      case "error": 
        return { icon: ShieldAlert, bg: "bg-destructive/10", text: "text-destructive" }
      default: 
        return { icon: AlertCircle, bg: "bg-muted", text: "text-muted-foreground" }
    }
  }

  // Soft Input Style for the search bar
  const softInputClass = "h-12 w-full rounded-xl border border-transparent bg-muted/40 pl-11 pr-4 text-sm transition-all hover:bg-muted/60 focus-visible:border-border focus-visible:bg-background focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:outline-none"

  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-16 font-sans">
      
      {/* Header Section */}
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight text-foreground">
            System Audit
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Monitor system activities, access logs, and security events in real-time.
          </p>
        </div>

        {/* Soft Search Input */}
        <div className="relative w-full sm:w-80 shrink-0">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search action, actor, or target..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={softInputClass}
          />
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex h-64 flex-col items-center justify-center space-y-4 rounded-2xl border border-border/40 bg-card shadow-sm">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <span className="text-xs font-medium tracking-widest text-muted-foreground uppercase">
            Syncing Registry...
          </span>
        </div>
      )}

      {/* Error State */}
      {isError && (
        <div className="flex h-64 flex-col items-center justify-center space-y-2 rounded-2xl border border-destructive/20 bg-destructive/5 text-center">
          <AlertCircle className="h-8 w-8 text-destructive mb-2" />
          <h3 className="font-medium text-destructive">Failed to load audit logs</h3>
          <p className="text-sm text-destructive/80">Please check your connection and try again.</p>
        </div>
      )}

      {/* Data States */}
      {!isLoading && !isError && (
        <>
          {/* MOBILE VIEW (< 768px): Tactile Cards */}
          <div className="grid gap-4 md:hidden">
            {filteredLogs.length === 0 ? (
              <div className="py-12 text-center text-sm text-muted-foreground rounded-2xl border border-border/40 bg-card">
                No logs found matching your criteria.
              </div>
            ) : (
              filteredLogs.map((log) => {
                const StatusConfig = getStatusConfig(log.status)
                const StatusIcon = StatusConfig.icon

                return (
                  <div 
                    key={log.id} 
                    className="flex flex-col rounded-2xl border border-border/40 bg-card p-5 shadow-sm transition-all active:scale-[0.98]"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", StatusConfig.bg, StatusConfig.text)}>
                          <StatusIcon className="h-5 w-5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-foreground">{log.action}</h4>
                          <p className="text-xs text-muted-foreground">{log.actor}</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteLog(log.id)}
                        disabled={isDeleting}
                        className="h-8 w-8 rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-border/40 pt-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <span className="font-medium">Target:</span> {log.target}
                      </div>
                      <div className="flex items-center gap-1.5 ml-auto">
                        <Clock className="h-3 w-3" />
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {/* TABLET & DESKTOP VIEW (>= 768px): Unified List */}
          <div className="hidden overflow-hidden rounded-2xl border border-border/40 bg-card shadow-sm md:block">
            
            {/* List Header */}
            <div className="grid grid-cols-12 items-center border-b border-border/40 bg-muted/10 px-6 py-4 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
              <div className="col-span-1 text-center">Status</div>
              <div className="col-span-3">Action</div>
              <div className="col-span-3">Actor</div>
              <div className="col-span-2">Target</div>
              <div className="col-span-2">Timestamp</div>
              <div className="col-span-1 text-right">Manage</div>
            </div>

            {/* List Body */}
            <div className="divide-y divide-border/40">
              {filteredLogs.length === 0 ? (
                <div className="py-16 text-center text-sm text-muted-foreground">
                  No logs found matching "{searchQuery}".
                </div>
              ) : (
                filteredLogs.map((log) => {
                  const StatusConfig = getStatusConfig(log.status)
                  const StatusIcon = StatusConfig.icon

                  return (
                    <div 
                      key={log.id} 
                      className="grid grid-cols-12 items-center px-6 py-4 transition-colors hover:bg-muted/20"
                    >
                      {/* Status */}
                      <div className="col-span-1 flex justify-center">
                        <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg", StatusConfig.bg, StatusConfig.text)}>
                          <StatusIcon className="h-4 w-4" />
                        </div>
                      </div>

                      {/* Action */}
                      <div className="col-span-3 truncate pr-4">
                        <span className="text-sm font-medium text-foreground">{log.action}</span>
                      </div>

                      {/* Actor */}
                      <div className="col-span-3 truncate pr-4">
                        <span className="text-sm text-muted-foreground">{log.actor}</span>
                      </div>

                      {/* Target */}
                      <div className="col-span-2 truncate pr-4">
                        <span className="text-sm text-muted-foreground">{log.target}</span>
                      </div>

                      {/* Timestamp */}
                      <div className="col-span-2 text-xs text-muted-foreground">
                        {new Date(log.timestamp).toLocaleString([], { 
                          month: 'short', 
                          day: 'numeric', 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </div>

                      {/* Actions */}
                      <div className="col-span-1 flex justify-end">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteLog(log.id)}
                          disabled={isDeleting}
                          className="h-8 w-8 rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                          title="Delete Log"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
