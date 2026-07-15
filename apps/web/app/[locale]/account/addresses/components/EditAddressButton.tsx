"use client"

import { Button } from "@workspace/ui/components/button"
import { Edit3 } from "lucide-react"
import { useTranslations } from "next-intl"
import { useRouter } from "next/navigation"

export function EditAddressButton({ addressId, className }: { addressId: string, className?: string }) {
  const t = useTranslations("Addresses")
  const router = useRouter()

  return (
    <Button 
      variant="secondary" 
      size="sm" 
      onClick={() => router.push(`?action=edit&id=${addressId}`)} 
      className={className || "h-9 px-5 rounded-lg text-xs"}
    >
      <Edit3 className="w-3.5 h-3.5 mr-2" /> {t("editBtn")}
    </Button>
  )
}
