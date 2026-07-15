"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useTranslations } from "next-intl"
import { toast } from "sonner"
import { api } from "@/api"
import { Save, RefreshCw, Send, AlertTriangle, CheckCircle, XCircle } from "lucide-react"
import { StickySaveBar } from "@workspace/ui/components/sticky-save-bar"

export default function EmailSettingsPage() {
  const t = useTranslations()
  const queryClient = useQueryClient()
  
  const [testEmail, setTestEmail] = useState("")

  const { data: config, isLoading: isConfigLoading } = useQuery({
    queryKey: ["admin", "email", "config"],
    queryFn: async () => {
      const res = await api.get("/admin/email/config")
      return res.data
    },
  })

  const { data: health, isLoading: isHealthLoading } = useQuery({
    queryKey: ["admin", "email", "health"],
    queryFn: async () => {
      const res = await api.get("/admin/email/health")
      return res.data
    },
    refetchInterval: 10000,
  })

  const updateConfig = useMutation({
    mutationFn: async (newConfig: any) => {
      const res = await api.put("/admin/email/config", newConfig)
      return res.data
    },
    onSuccess: () => {
      toast.success("Email configuration updated")
      queryClient.invalidateQueries({ queryKey: ["admin", "email", "config"] })
    },
    onError: (error) => {
      toast.error("Failed to update configuration")
    },
  })

  const sendTestEmail = useMutation({
    mutationFn: async () => {
      const res = await api.post("/admin/email/test", { to: testEmail })
      return res.data
    },
    onSuccess: () => {
      toast.success("Test email sent successfully")
      queryClient.invalidateQueries({ queryKey: ["admin", "email", "health"] })
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to send test email")
    },
  })

  if (isConfigLoading) {
    return <div className="p-8 flex items-center justify-center h-[50vh]"><RefreshCw className="animate-spin text-gray-400" /></div>
  }

  if (!config) {
    return (
      <div className="p-8 flex flex-col items-center justify-center h-[50vh] space-y-4">
        <AlertTriangle className="w-10 h-10 text-red-500" />
        <p className="text-muted-foreground text-center">Failed to load email configuration.<br />Please ensure the server is running and you are authenticated.</p>
      </div>
    )
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    updateConfig.mutate({
      activeProvider: formData.get("activeProvider"),
      fallbackProvider: formData.get("fallbackProvider") || null,
      fromName: formData.get("fromName"),
      fromAddress: formData.get("fromAddress"),
      replyTo: formData.get("replyTo") || null,
      maintenanceMode: formData.get("maintenanceMode") === "true",
      maxRetries: Number(formData.get("maxRetries")),
    })
  }

  return (
    <div className="mx-auto max-w-4xl space-y-10 pb-16 font-sans">
      <div>
        <h2 className="text-3xl font-semibold tracking-tight text-foreground">Email Infrastructure</h2>
        <p className="text-sm text-muted-foreground mt-2">Manage runtime email providers, fallback strategies, and view real-time health metrics. Credentials are securely loaded from environment variables.</p>
      </div>

      <div className="flex flex-col space-y-8">
        <div className="bg-card rounded-2xl border border-border/40 overflow-hidden shadow-sm">
            <div className="px-6 py-5 border-b border-border/40 bg-muted/20">
              <h2 className="font-semibold text-foreground">Provider Configuration</h2>
            </div>
            <form id="email-settings-form" onSubmit={handleSubmit} className="p-6 space-y-6">
              
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-2">Active Provider</label>
                  <select name="activeProvider" defaultValue={config.activeProvider} className="w-full rounded-md border-border/60 bg-background text-sm shadow-sm focus:border-primary focus:ring-primary h-10 px-3">
                    <option value="nodemailer">SMTP (Nodemailer)</option>
                    <option value="resend">Resend</option>
                    <option value="ses">AWS SES</option>
                  </select>
                  <p className="mt-1 text-xs text-muted-foreground/70">The primary provider used for outgoing emails.</p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-2">Fallback Provider</label>
                  <select name="fallbackProvider" defaultValue={config.fallbackProvider || ""} className="w-full rounded-md border-border/60 bg-background text-sm shadow-sm focus:border-primary focus:ring-primary h-10 px-3">
                    <option value="">None (Disable Fallback)</option>
                    <option value="nodemailer">SMTP (Nodemailer)</option>
                    <option value="resend">Resend</option>
                    <option value="ses">AWS SES</option>
                  </select>
                  <p className="mt-1 text-xs text-muted-foreground/70">Automatically used if the primary provider fails.</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-2">Sender Name</label>
                  <input type="text" name="fromName" defaultValue={config.fromName} className="w-full rounded-md border-border/60 bg-background text-sm shadow-sm focus:border-primary focus:ring-primary h-10 px-3" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-2">Sender Address</label>
                  <input type="email" name="fromAddress" defaultValue={config.fromAddress} className="w-full rounded-md border-border/60 bg-background text-sm shadow-sm focus:border-primary focus:ring-primary h-10 px-3" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-2">Reply-To (Optional)</label>
                  <input type="email" name="replyTo" defaultValue={config.replyTo || ""} className="w-full rounded-md border-border/60 bg-background text-sm shadow-sm focus:border-primary focus:ring-primary h-10 px-3" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-2">Max Retries</label>
                  <input type="number" name="maxRetries" defaultValue={config.maxRetries} min="0" max="5" className="w-full rounded-md border-border/60 bg-background text-sm shadow-sm focus:border-primary focus:ring-primary h-10 px-3" />
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input type="checkbox" name="maintenanceMode" value="true" defaultChecked={config.maintenanceMode} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                  <span className="text-sm font-medium text-foreground">Maintenance Mode (Drops all outgoing emails)</span>
                </label>
              </div>
            </form>
          </div>

        <div className="bg-card rounded-2xl border border-border/40 overflow-hidden shadow-sm">
            <div className="px-6 py-5 border-b border-border/40 bg-muted/20">
              <h2 className="font-semibold text-foreground">Send Test Email</h2>
            </div>
            <div className="p-6">
              <div className="flex gap-4">
                <input 
                  type="email" 
                  placeholder="admin@example.com" 
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  className="flex-1 rounded-md border-border/60 bg-background text-sm shadow-sm focus:border-primary focus:ring-primary h-10 px-3" 
                />
                <button 
                  onClick={() => sendTestEmail.mutate()}
                  disabled={!testEmail || sendTestEmail.isPending}
                  className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-8 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                >
                  {sendTestEmail.isPending ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                  Test Connection
                </button>
              </div>
            </div>
          </div>

        <div className="bg-card rounded-2xl border border-border/40 overflow-hidden shadow-sm">
          <div className="px-6 py-5 border-b border-border/40 bg-muted/20 flex justify-between items-center">
            <h2 className="font-semibold text-foreground">Provider Health</h2>
            <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
          </div>
          <div className="divide-y divide-border/40">
            {isHealthLoading && !health ? (
              <div className="p-6 flex justify-center"><RefreshCw className="w-5 h-5 animate-spin text-muted-foreground" /></div>
            ) : health?.length === 0 ? (
              <div className="p-6 text-center text-sm text-muted-foreground">No emails sent yet.</div>
            ) : (
              health?.map((h: any) => (
              <div key={h.provider} className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-medium text-foreground capitalize">{h.provider}</span>
                  {h.status === "healthy" && <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wide uppercase bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400"><CheckCircle className="w-3 h-3 mr-1" /> Healthy</span>}
                  {h.status === "degraded" && <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wide uppercase bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"><AlertTriangle className="w-3 h-3 mr-1" /> Degraded</span>}
                  {h.status === "down" && <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wide uppercase bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"><XCircle className="w-3 h-3 mr-1" /> Down</span>}
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                  <div>
                    <p className="text-muted-foreground text-xs mb-1">Total Sent</p>
                    <p className="font-medium text-foreground">{h.totalSent}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs mb-1">Failures</p>
                    <p className="font-medium text-red-600 dark:text-red-400">{h.totalFailures}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-muted-foreground text-xs mb-1">Avg Response Time</p>
                    <p className="font-medium text-foreground">{h.averageResponseTimeMs}ms</p>
                  </div>
                </div>

                {h.lastErrorMessage && (
                  <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/10 text-red-700 dark:text-red-400 text-xs rounded-lg border border-red-100 dark:border-red-900/30 break-words">
                    <span className="font-semibold block mb-1">Last Error:</span>
                    {h.lastErrorMessage}
                  </div>
                )}
              </div>
            )))}
          </div>
        </div>
      </div>

      <StickySaveBar 
        formId="email-settings-form"
        isPending={updateConfig.isPending}
        saveActionLabel="Save Configuration"
        infoPanel={
          <div className="flex items-center gap-2">
            <span className="font-medium text-foreground">Email Settings</span>
          </div>
        }
      />
    </div>
  )
}
