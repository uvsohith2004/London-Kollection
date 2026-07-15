"use client"

import { Button } from "@workspace/ui/components/button"
import { useTranslations } from "next-intl"
import { useSetDefaultAddressMutation } from "../services/mutations"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export function DefaultAddressButton({ addressId, addressType, className }: { addressId: string, addressType: string, className?: string }) {
  const t = useTranslations("Addresses")
  const router = useRouter()
  const setDefaultMutation = useSetDefaultAddressMutation()

  const handleSetDefault = () => {
    setDefaultMutation.mutate({ id: addressId, type: addressType }, {
      onSuccess: () => {
        toast.success(t("setDefaultSuccess"))
        router.refresh()
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.error || t("setDefaultError"))
      }
    })
  }

  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={handleSetDefault} 
      disabled={setDefaultMutation.isPending}
      className={className || "h-9 rounded-lg border-border text-xs"}
    >
      {t("setDefault")}
    </Button>
  )
}
