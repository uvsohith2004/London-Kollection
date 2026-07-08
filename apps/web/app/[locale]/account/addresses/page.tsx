"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { useDevice } from "@/hooks/use-media-query"
import { useAddressesQuery } from "./services/queries"
import { useDeleteAddressMutation, useSetDefaultAddressMutation } from "./services/mutations"
import DesktopAddressesLayout from "./layouts/desktop-layout"
import TabAddressesLayout from "./layouts/tab-layout"
import MobileAddressesLayout from "./layouts/mobile-layout"

import { useTranslations } from "next-intl"

export default function AccountAddressesPage() {
  const { isDesktop, isTablet } = useDevice()
  const [mounted, setMounted] = useState(false)
  const t = useTranslations("Addresses")
  const [isEditingAddress, setIsEditingAddress] = useState<boolean>(false)
  const [editingAddressData, setEditingAddressData] = useState<any>(null)

  // Using the new localized architectural hooks
  const { data: addresses = [], isLoading, isError, refetch } = useAddressesQuery()
  const deleteMutation = useDeleteAddressMutation()
  const setDefaultMutation = useSetDefaultAddressMutation()

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleDelete = (id: string) => {
    if (!confirm(t("deleteConfirm"))) return
    
    deleteMutation.mutate(id, {
      onSuccess: () => {
        toast.success(t("deleteSuccess"))
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.error || t("deleteError"))
      }
    })
  }

  const handleSetDefault = (id: string, type: string) => {
    setDefaultMutation.mutate({ id, type }, {
      onSuccess: () => {
        toast.success(t("setDefaultSuccess"))
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.error || t("setDefaultError"))
      }
    })
  }

  const handleAddClick = () => {
    setEditingAddressData(null)
    setIsEditingAddress(true)
  }

  const handleEditClick = (address: any) => {
    setEditingAddressData(address)
    setIsEditingAddress(true)
  }

  const handleCloseForm = () => {
    setIsEditingAddress(false)
    setEditingAddressData(null)
  }

  const handleFormSuccess = () => {
    handleCloseForm()
    refetch()
  }

  if (!mounted || isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <p className="text-muted-foreground">{t("loadError")}</p>
      </div>
    )
  }

  const props = {
    addresses,
    onAdd: handleAddClick,
    onEdit: handleEditClick,
    onDelete: handleDelete,
    onSetDefault: handleSetDefault,
    isEditingAddress,
    editingAddressData,
    handleFormSuccess,
    handleCloseForm
  }

  if (isDesktop) return <DesktopAddressesLayout {...props} />
  if (isTablet) return <TabAddressesLayout {...props} />
  return <MobileAddressesLayout {...props} />
}
