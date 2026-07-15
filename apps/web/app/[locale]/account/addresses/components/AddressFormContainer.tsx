"use client"

import { AddressForm } from "@/components/address-form/index"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"

export function AddressFormContainer({ address }: { address?: any }) {
  const router = useRouter()
  const t = useTranslations("Addresses")

  const handleClose = () => {
    router.push('?')
  }

  const handleSuccess = () => {
    router.refresh()
    router.push('?')
  }

  return (
    <div className="mb-12 bg-card p-5 md:p-8 rounded-2xl border border-border shadow-sm animate-in fade-in slide-in-from-top-4 duration-500">
      <div className="mb-6 border-b border-border/40 pb-4 md:border-b-0 md:pb-0">
        <h2 className="text-lg md:text-xl font-medium text-foreground">{address ? t("edit") : t("addNew")}</h2>
        <p className="text-sm text-muted-foreground hidden md:block">{t("formDesc")}</p>
      </div>
      <AddressForm 
        address={address} 
        onSuccess={handleSuccess} 
        onCancel={handleClose} 
      />
    </div>
  )
}
