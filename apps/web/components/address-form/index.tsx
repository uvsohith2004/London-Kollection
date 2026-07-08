"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { useDevice } from "@/hooks/use-media-query"
import { useCreateAddressMutation, useUpdateAddressMutation } from "@/app/[locale]/account/addresses/services/mutations"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import DesktopAddressForm from "./layouts/desktop-form"
import TabAddressForm from "./layouts/tab-form"
import MobileAddressForm from "./layouts/mobile-form"
import { useTranslations } from "next-intl"

export const GOVERNORATES = [
  "Al Asimah",
  "Hawalli",
  "Farwaniya",
  "Ahmadi",
  "Mubarak Al-Kabeer",
  "Jahra"
]

const addressSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().min(8, "Valid phone number is required"),
  governorate: z.string().min(1, "Governorate is required"),
  area: z.string().min(2, "Area is required"),
  block: z.string().min(1, "Block is required"),
  street: z.string().min(1, "Street is required"),
  avenue: z.string().optional(),
  building: z.string().min(1, "Building/House is required"),
  floor: z.string().optional(),
  flat: z.string().optional(),
  paci: z.string().optional(),
  directions: z.string().optional(),
  isDefault: z.boolean()
})

export type AddressFormValues = z.infer<typeof addressSchema>

export function AddressForm({ 
  address, 
  onSuccess, 
  onCancel 
}: { 
  address?: any, 
  onSuccess: () => void,
  onCancel: () => void 
}) {
  const { isDesktop, isTablet } = useDevice()
  const [mounted, setMounted] = useState(false)
  const t = useTranslations("AddressForm")
  const isEditing = !!address

  const createMutation = useCreateAddressMutation()
  const updateMutation = useUpdateAddressMutation()
  const isSaving = createMutation.isPending || updateMutation.isPending

  const form = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      name: "",
      phone: "",
      governorate: "",
      area: "",
      block: "",
      street: "",
      avenue: "",
      building: "",
      floor: "",
      flat: "",
      paci: "",
      directions: "",
      isDefault: false
    }
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (address) {
      const getVal = (str: string, prefix: string) => str.match(new RegExp(`${prefix}:\\s*([^,|]+)`))?.[1]?.trim() || ""
      const fullString = `${address.addressLine1} | ${address.addressLine2 || ""} | PACI: ${address.postalCode}`
      
      form.reset({
        name: address.name || "",
        phone: address.phone || "",
        governorate: address.state || "",
        area: address.city || "",
        block: getVal(fullString, "Block") || getVal(fullString, "Blk"),
        street: getVal(fullString, "Street") || getVal(fullString, "St"),
        avenue: getVal(fullString, "Avenue") || getVal(fullString, "Ave"),
        building: getVal(fullString, "Building") || getVal(fullString, "Bldg") || getVal(fullString, "House"),
        floor: getVal(fullString, "Floor") || getVal(fullString, "Flr"),
        flat: getVal(fullString, "Flat") || getVal(fullString, "Apt"),
        paci: address.postalCode !== "00000" ? address.postalCode : "",
        directions: address.landmark || "",
        isDefault: address.default || false
      })
    }
  }, [address, form])

  const onSubmit = (data: AddressFormValues) => {
    const addressLine1 = `Block: ${data.block}, Street: ${data.street}${data.avenue ? `, Avenue: ${data.avenue}` : ''}, Building: ${data.building}`
    const addressLine2 = `${data.floor ? `Floor: ${data.floor}, ` : ''}${data.flat ? `Flat: ${data.flat}` : ''}`
    
    const payload = {
      name: data.name,
      phone: data.phone,
      country: "Kuwait",
      state: data.governorate,
      city: data.area,
      postalCode: data.paci || "00000",
      addressLine1,
      addressLine2: addressLine2.replace(/,\s*$/, ""),
      landmark: data.directions,
      default: data.isDefault,
      type: "shipping"
    }

    if (isEditing) {
      updateMutation.mutate({ id: address.id, data: payload }, {
        onSuccess: () => {
          toast.success(t("addressUpdated"))
          onSuccess()
        },
        onError: (err: any) => {
          toast.error(err.response?.data?.error || t("addressUpdateError"))
        }
      })
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => {
          toast.success(t("addressAdded"))
          onSuccess()
        },
        onError: (err: any) => {
          toast.error(err.response?.data?.error || t("addressAddError"))
        }
      })
    }
  }

  if (!mounted) return null

  const props = { 
    form, 
    onSubmit: form.handleSubmit(onSubmit) as any, 
    isSaving, 
    onCancel 
  }

  if (isDesktop) return <DesktopAddressForm {...props} />
  if (isTablet) return <TabAddressForm {...props} />
  return <MobileAddressForm {...props} />
}
