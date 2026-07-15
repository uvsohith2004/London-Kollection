"use client"

import { Button } from "@workspace/ui/components/button"
import { Plus } from "lucide-react"
import { useTranslations } from "next-intl"
import { useRouter } from "next/navigation"

export function AddAddressButton() {
  const t = useTranslations("Addresses")
  const router = useRouter()

  return (
    <>
      <Button 
        onClick={() => router.push('?action=add')} 
        className="hidden md:flex h-11 px-8 rounded-full uppercase tracking-widest text-[11px] font-semibold bg-foreground text-background hover:bg-foreground/90 transition-all"
      >
        <Plus className="w-4 h-4 ltr:mr-2 rtl:ml-2" />
        {t("addNew")}
      </Button>
      {/* Mobile sticky button is handled separately, but we could also put it here if we want! */}
    </>
  )
}
