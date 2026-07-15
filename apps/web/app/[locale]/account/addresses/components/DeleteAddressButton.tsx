"use client"

import { Button } from "@workspace/ui/components/button"
import { Trash2 } from "lucide-react"
import { useTranslations } from "next-intl"
import { useDeleteAddressMutation } from "../services/mutations"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export function DeleteAddressButton({ addressId, className }: { addressId: string, className?: string }) {
  const t = useTranslations("Addresses")
  const router = useRouter()
  const deleteMutation = useDeleteAddressMutation()

  const handleDelete = () => {
    if (!confirm(t("deleteConfirm"))) return
    
    deleteMutation.mutate(addressId, {
      onSuccess: () => {
        toast.success(t("deleteSuccess"))
        router.refresh()
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.error || t("deleteError"))
      }
    })
  }

  return (
    <Button 
      variant="ghost" 
      size="sm" 
      onClick={handleDelete} 
      disabled={deleteMutation.isPending}
      className={className || "h-9 w-9 p-0 text-destructive hover:bg-destructive/10 hover:text-destructive"}
    >
      <Trash2 className="w-4 h-4" />
    </Button>
  )
}
