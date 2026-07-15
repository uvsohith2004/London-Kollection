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
  building: z.string().min(1, "Building/House is required"),
  floorFlat: z.string().optional(),
  landmark: z.string().optional(),
  isDefault: z.boolean().optional()
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
      building: "",
      floorFlat: "",
      landmark: "",
      isDefault: false
    }
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (address) {
      let parsedAddress = { block: "", street: "", building: "", floorFlat: "" };
      try {
        parsedAddress = JSON.parse(address.addressLine1);
      } catch (e) {
        // Fallback for legacy format if any
        parsedAddress.block = address.addressLine1 || "";
      }
      
      let initialPhone = address.phone || "";
      if (initialPhone && !initialPhone.startsWith("+")) {
        initialPhone = "+" + initialPhone;
      }

      form.reset({
        name: address.name || "",
        phone: initialPhone,
        governorate: address.state || "",
        area: address.city || "",
        block: parsedAddress.block || "",
        street: parsedAddress.street || "",
        building: parsedAddress.building || "",
        floorFlat: parsedAddress.floorFlat || "",
        landmark: address.landmark || "",
        isDefault: address.default || false
      })
    }
  }, [address, form])

  const onSubmit = (data: AddressFormValues) => {
    const addressLine1 = JSON.stringify({
      block: data.block,
      street: data.street,
      building: data.building,
      floorFlat: data.floorFlat || ''
    })
    
    const payload = {
      name: data.name,
      phone: data.phone,
      country: "KW",
      state: data.governorate,
      city: data.area,
      postalCode: "00000",
      addressLine1,
      landmark: data.landmark,
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
