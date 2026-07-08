"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { useDevice } from "@/hooks/use-media-query"
import DesktopProfileLayout from "./layouts/desktop-layout"
import TabProfileLayout from "./layouts/tab-layout"
import MobileProfileLayout from "./layouts/mobile-layout"
import { useProfileQuery } from "./services/queries"
import { useUpdateProfileMutation, useUploadAvatarMutation } from "./services/mutations"
import { ImageCropperDialog } from "@/components/image-cropper"
import { useTranslations } from "next-intl"
import { Button } from "@workspace/ui/components/button"
import { authClient } from "@/lib/auth-client"
import { useConnectedAccountsQuery } from "./services/queries"
import { useQueryClient } from "@tanstack/react-query"

function ConnectedAccountsSection() {
  const t = useTranslations("Profile")
  const { data: accounts, isLoading } = useConnectedAccountsQuery()
  
  const handleConnectGoogle = async () => {
    await authClient.linkSocial({
      provider: "google",
      callbackURL: "/account/profile"
    })
  }

  const isGoogleConnected = accounts?.some((acc: any) => acc.providerId === "google")

  if (isLoading) {
    return (
      <div className="mt-12 max-w-3xl border-t border-border/40 pt-10">
        <h2 className="text-xl font-serif mb-4">Connected Accounts</h2>
        <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="w-4 h-4 animate-spin"/> Loading...</div>
      </div>
    )
  }

  return (
    <div className="mt-12 max-w-3xl border-t border-border/40 pt-10">
      <h2 className="text-xl font-serif mb-6 text-foreground">Connected Accounts</h2>
      
      <div className="flex items-center justify-between p-4 border border-border/50 rounded-md bg-secondary/10">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center p-2 shadow-sm">
            <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
          </div>
          <div>
            <h3 className="font-medium text-foreground">Google</h3>
            <p className="text-sm text-muted-foreground">
              {isGoogleConnected ? "Connected to your account." : "Not connected."}
            </p>
          </div>
        </div>
        
        <div>
          {isGoogleConnected ? (
            <span className="px-3 py-1 bg-green-500/10 text-green-600 text-xs font-medium rounded-full uppercase tracking-wider">
              Connected
            </span>
          ) : (
            <Button 
              variant="outline" 
              onClick={handleConnectGoogle}
              className="text-xs uppercase tracking-widest font-medium"
            >
              Connect
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}


export default function AccountProfilePage() {
  const { isDesktop, isTablet } = useDevice()
  const [mounted, setMounted] = useState(false)
  const t = useTranslations("Profile")
  
  // Using the new localized architectural hooks
  const queryClient = useQueryClient()
  const { session, isLoading: isPending } = useProfileQuery()
  const updateMutation = useUpdateProfileMutation()
  
  const [formData, setFormData] = useState({
    name: "",
    image: "",
    phone: "",
    gender: "",
    dateOfBirth: "",
  })
  
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Sync session data to form state
  useEffect(() => {
    if (session?.user) {
      setFormData({
        name: session.user.name || "",
        image: session.user.image || "",
        // @ts-ignore
        phone: session.user.phone || "",
        // @ts-ignore
        gender: session.user.gender || "",
        // @ts-ignore
        dateOfBirth: session.user.dateOfBirth ? new Date(session.user.dateOfBirth).toISOString().split('T')[0] : "",
      })
    }
  }, [session])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    updateMutation.mutate({
      name: formData.name,
      image: formData.image || null,
      // @ts-ignore
      phone: formData.phone || null,
      gender: formData.gender || null,
      dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth) : null,
    }, {
      onSuccess: () => {
        toast.success(t("success"))
      },
      onError: (err: any) => {
        toast.error(err.message || t("error"))
      }
    })
  }

  const uploadAvatarMutation = useUploadAvatarMutation()

  const handleAvatarFileSelect = (file: File) => {
    const url = URL.createObjectURL(file)
    setCropImageSrc(url)
  }

  const handleCropComplete = (croppedFile: File) => {
    uploadAvatarMutation.mutate(croppedFile, {
      onSuccess: () => {
        toast.success(t("success") || "Avatar updated successfully")
        queryClient.invalidateQueries({ queryKey: ["profile"] })
        setCropImageSrc(null)
      },
      onError: (error: any) => {
        toast.error(error?.message || "Failed to upload avatar")
        setCropImageSrc(null)
      }
    })
  }

  if (!mounted || isPending) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const props = { session, formData, setFormData, handleSubmit, isLoading: updateMutation.isPending, uploadAvatarMutation, onAvatarFileSelect: handleAvatarFileSelect }

  return (
    <div className="pb-24">
      {isDesktop ? <DesktopProfileLayout {...props} /> : isTablet ? <TabProfileLayout {...props} /> : <MobileProfileLayout {...props} />}
      <ConnectedAccountsSection />
      <ImageCropperDialog
        open={!!cropImageSrc}
        imageSrc={cropImageSrc}
        onClose={() => setCropImageSrc(null)}
        onCropComplete={handleCropComplete}
        isUploading={uploadAvatarMutation.isPending}
      />
    </div>
  )
}
