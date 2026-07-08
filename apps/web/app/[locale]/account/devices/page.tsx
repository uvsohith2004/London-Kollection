"use client"

import { useState, useEffect } from "react"
import { authClient } from "@/lib/auth-client"
import { Button } from "@workspace/ui/components/button"
import { toast } from "sonner"
import { Loader2, Monitor, Smartphone, Laptop, Tablet, LogOut, CheckCircle2 } from "lucide-react"
import { UAParser } from "ua-parser-js"
import { formatDistanceToNow } from "date-fns"
import { cn } from "@workspace/ui/lib/utils"
import { useTranslations, useLocale } from 'next-intl'

type Session = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  expiresAt: Date;
  token: string;
  ipAddress?: string | null;
  userAgent?: string | null;
};

export default function AccountDevicesPage() {
  const { data: currentSession, isPending: isSessionLoading } = authClient.useSession()
  const [sessions, setSessions] = useState<Session[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [revokingId, setRevokingId] = useState<string | null>(null)
  const t = useTranslations('Devices')

  useEffect(() => {
    fetchSessions()
  }, [])

  const fetchSessions = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await authClient.listSessions()
      if (error) throw error
      setSessions(data as Session[])
    } catch (error: any) {
      toast.error(error.message || t("loadError"))
    } finally {
      setIsLoading(false)
    }
  }

  const handleRevoke = async (token: string) => {
    setRevokingId(token)
    try {
      const { error } = await authClient.revokeSession({ token })
      if (error) throw error
      toast.success(t("revokeSuccess"))
      setSessions(prev => prev.filter(s => s.token !== token))
    } catch (error: any) {
      toast.error(error.message || t("revokeError"))
    } finally {
      setRevokingId(null)
    }
  }

  const handleRevokeAllOther = async () => {
    if (!confirm(t("confirmRevokeAll"))) return
    setIsLoading(true)
    try {
      const { error } = await authClient.revokeOtherSessions()
      if (error) throw error
      toast.success(t("revokeAllSuccess"))
      fetchSessions()
    } catch (error: any) {
      toast.error(error.message || t("revokeAllError"))
      setIsLoading(false)
    }
  }

  const getDeviceDetails = (userAgent?: string | null) => {
    if (!userAgent) return { os: t("unknownOS"), browser: t("unknownBrowser"), type: "desktop" as const }
    const parser = new UAParser(userAgent)
    const os = parser.getOS().name || t("unknownOS")
    const browser = parser.getBrowser().name || t("unknownBrowser")
    const type = parser.getDevice().type || "desktop"
    return { os, browser, type }
  }

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case "mobile": return <Smartphone className="w-5 h-5 md:w-6 md:h-6" />
      case "tablet": return <Tablet className="w-5 h-5 md:w-6 md:h-6" />
      default: return <Laptop className="w-5 h-5 md:w-6 md:h-6" />
    }
  }

  if (isSessionLoading || (isLoading && sessions.length === 0)) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const currentToken = currentSession?.session?.token

  return (
    <>
      <DesktopDevices 
        sessions={sessions} 
        currentToken={currentToken} 
        onRevoke={handleRevoke}
        onRevokeAll={handleRevokeAllOther}
        getDeviceDetails={getDeviceDetails}
        getDeviceIcon={getDeviceIcon}
        revokingId={revokingId}
      />
      <MobileDevices 
        sessions={sessions} 
        currentToken={currentToken} 
        onRevoke={handleRevoke}
        onRevokeAll={handleRevokeAllOther}
        getDeviceDetails={getDeviceDetails}
        getDeviceIcon={getDeviceIcon}
        revokingId={revokingId}
      />
    </>
  )
}

function DesktopDevices({ sessions, currentToken, onRevoke, onRevokeAll, getDeviceDetails, getDeviceIcon, revokingId }: any) {
  const t = useTranslations('Devices')
  return (
    <div className="hidden md:block max-w-4xl">
      <div className="mb-10 flex items-center justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl font-serif tracking-tight mb-2">{t('title')}</h1>
          <p className="text-muted-foreground">{t('description')}</p>
        </div>
        {sessions.length > 1 && (
          <Button variant="outline" onClick={onRevokeAll} className="h-10">
            {t('signOutAll')}
          </Button>
        )}
      </div>

      <div className="grid gap-4">
        {sessions.map((session: any) => {
          const isCurrent = session.token === currentToken
          const { os, browser, type } = getDeviceDetails(session.userAgent)
          
          return (
            <div 
              key={session.id} 
              dir="ltr"
              className={cn(
                "flex items-center justify-between p-6 rounded-2xl border transition-all",
                isCurrent ? "border-primary/50 bg-primary/5" : "border-border/40 bg-card hover:border-border"
              )}
            >
              <div className="flex items-center gap-6">
                <div className={cn(
                  "p-4 rounded-full flex items-center justify-center shrink-0",
                  isCurrent ? "bg-primary/10 text-primary" : "bg-secondary text-muted-foreground"
                )}>
                  {getDeviceIcon(type)}
                </div>
                
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-semibold text-lg">{os} • {browser}</h3>
                    {isCurrent && (
                      <span className="flex items-center text-xs font-medium bg-primary/10 text-primary px-2.5 py-1 rounded-full">
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                        {t('current')}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    {session.ipAddress && (
                      <span className="flex items-center">
                        {session.ipAddress}
                      </span>
                    )}
                    <span>•</span>
                    <span>{t('lastActive', { time: formatDistanceToNow(new Date(session.updatedAt)) })}</span>
                  </div>
                </div>
              </div>

              {!isCurrent && (
                <Button 
                  variant="ghost" 
                  onClick={() => onRevoke(session.token)}
                  disabled={revokingId === session.token}
                  className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                >
                  {revokingId === session.token ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <LogOut className="w-4 h-4 mr-2" />
                      {t('signOut')}
                    </>
                  )}
                </Button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function MobileDevices({ sessions, currentToken, onRevoke, onRevokeAll, getDeviceDetails, getDeviceIcon, revokingId }: any) {
  const t = useTranslations('Devices')
  return (
    <div className="block md:hidden pb-24">
      <div className="mb-6 px-1">
        <h1 className="text-2xl font-serif tracking-tight mb-2">{t('title')}</h1>
        <p className="text-sm text-muted-foreground">{t('descriptionMobile')}</p>
      </div>

      <div className="flex flex-col gap-3">
        {sessions.map((session: any) => {
          const isCurrent = session.token === currentToken
          const { os, browser, type } = getDeviceDetails(session.userAgent)
          
          return (
            <div 
              key={session.id} 
              dir="ltr"
              className={cn(
                "flex flex-col p-5 rounded-2xl border",
                isCurrent ? "border-primary/40 bg-primary/5" : "border-border/40 bg-card"
              )}
            >
              <div className="flex items-start gap-4">
                <div className={cn(
                  "p-3 rounded-full flex items-center justify-center shrink-0 mt-1",
                  isCurrent ? "bg-primary/10 text-primary" : "bg-secondary text-muted-foreground"
                )}>
                  {getDeviceIcon(type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="font-semibold truncate">{os}</h3>
                    {isCurrent && (
                      <span className="flex items-center text-[10px] font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                        {t('currentUpper')}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-foreground/80 mb-2">{browser}</p>
                  <p className="text-xs text-muted-foreground mb-4">
                    {session.ipAddress && <span className="block mb-0.5">{session.ipAddress}</span>}
                    {t('lastActive', { time: formatDistanceToNow(new Date(session.updatedAt)) })}
                  </p>

                  {!isCurrent && (
                    <Button 
                      variant="outline"
                      size="sm"
                      onClick={() => onRevoke(session.token)}
                      disabled={revokingId === session.token}
                      className="w-full text-red-500 border-red-500/20 hover:bg-red-500/10 h-10 rounded-xl"
                    >
                      {revokingId === session.token ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <LogOut className="w-4 h-4 mr-2" />
                          {t('signOutDevice')}
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )
        })}

        {sessions.length > 1 && (
          <div className="mt-4 px-1">
            <Button 
              variant="outline" 
              onClick={onRevokeAll}
              className="w-full h-12 rounded-xl text-muted-foreground"
            >
              {t('signOutAll')}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

