import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import {
  createProduct,
  updateProduct,
  deleteProduct,
  createCategory,
  updateCategory,
  deleteCategory,
  createCollection,
  updateCollection,
  deleteCollection,
  createOccasion,
  updateOccasion,
  deleteOccasion,
  createBrand,
  updateBrand,
  deleteBrand,
  updateAdminOrderStatus,
  updateAdminReturnStatus,
  updateAdminUserRole,
  overviewApi,
  auditApi,
  createFlashSaleProduct,
  deleteFlashSaleProduct,
  createTaxClass,
  updateTaxClass,
  deleteTaxClass,
  createTaxRate,
  updateTaxRate,
  deleteTaxRate,
  createTaxRule,
  updateTaxRule,
  deleteTaxRule,
} from "@/api"
import { adminKeys } from "./queries"
import { apiClient } from "@/api/client"

// -- Products --
export function useCreateProductMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      toast.success("Product created successfully")
      queryClient.invalidateQueries({ queryKey: adminKeys.products() })
    },
    onError: (error: Error) =>
      toast.error(error.message || "Failed to create product"),
  })
}

export function useUpdateProductMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      updateProduct(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: adminKeys.products() })
      const previousProducts = queryClient.getQueryData(adminKeys.products())
      
      // Attempt optimistic update for list queries if needed
      queryClient.setQueriesData({ queryKey: adminKeys.products() }, (old: any) => {
        if (!old) return old
        const items = Array.isArray(old) ? old : (old?.items || [])
        return {
          ...old,
          items: items.map((item: any) => item.id === id ? { ...item, ...data } : item)
        }
      })
      
      return { previousProducts }
    },
    onSuccess: () => {
      toast.success("Product updated successfully")
    },
    onError: (error: Error, _, context) => {
      toast.error(error.message || "Failed to update product")
      if (context?.previousProducts) {
        queryClient.setQueriesData({ queryKey: adminKeys.products() }, context.previousProducts)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.products() })
    }
  })
}

export function useDeleteProductMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteProduct,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: adminKeys.products() })
      const previousProducts = queryClient.getQueryData(adminKeys.products())
      
      queryClient.setQueriesData({ queryKey: adminKeys.products() }, (old: any) => {
        if (!old) return old
        const items = Array.isArray(old) ? old : (old?.items || [])
        return {
          ...old,
          items: items.filter((item: any) => item.id !== id)
        }
      })
      
      return { previousProducts }
    },
    onSuccess: () => {
      toast.success("Product deleted successfully")
    },
    onError: (error: Error, _, context) => {
      toast.error(error.message || "Failed to delete product")
      if (context?.previousProducts) {
        queryClient.setQueriesData({ queryKey: adminKeys.products() }, context.previousProducts)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.products() })
    }
  })
}

// -- Categories --
export function useCreateCategoryMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      toast.success("Category created")
      queryClient.invalidateQueries({ queryKey: adminKeys.categories() })
    },
    onError: (error: Error) =>
      toast.error(error.message || "Failed to create category"),
  })
}

export function useUpdateCategoryMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      updateCategory(id, data),
    onSuccess: () => {
      toast.success("Category updated")
      queryClient.invalidateQueries({ queryKey: adminKeys.categories() })
    },
    onError: (error: Error) =>
      toast.error(error.message || "Failed to update category"),
  })
}

export function useDeleteCategoryMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      toast.success("Category deleted")
      queryClient.invalidateQueries({ queryKey: adminKeys.categories() })
    },
    onError: (error: Error) =>
      toast.error(error.message || "Failed to delete category"),
  })
}

// -- Collections --
export function useCreateCollectionMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createCollection,
    onSuccess: () => {
      toast.success("Collection created")
      queryClient.invalidateQueries({ queryKey: adminKeys.collections() })
    },
    onError: (error: Error) =>
      toast.error(error.message || "Failed to create collection"),
  })
}

export function useUpdateCollectionMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      updateCollection(id, data),
    onSuccess: () => {
      toast.success("Collection updated")
      queryClient.invalidateQueries({ queryKey: adminKeys.collections() })
    },
    onError: (error: Error) =>
      toast.error(error.message || "Failed to update collection"),
  })
}

export function useDeleteCollectionMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteCollection,
    onSuccess: () => {
      toast.success("Collection deleted")
      queryClient.invalidateQueries({ queryKey: adminKeys.collections() })
    },
    onError: (error: Error) =>
      toast.error(error.message || "Failed to delete collection"),
  })
}

// -- Occasions --
export function useCreateOccasionMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createOccasion,
    onSuccess: () => {
      toast.success("Occasion created")
      queryClient.invalidateQueries({ queryKey: adminKeys.occasions() })
    },
    onError: (error: Error) =>
      toast.error(error.message || "Failed to create occasion"),
  })
}

export function useUpdateOccasionMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      updateOccasion(id, data),
    onSuccess: () => {
      toast.success("Occasion updated")
      queryClient.invalidateQueries({ queryKey: adminKeys.occasions() })
    },
    onError: (error: Error) =>
      toast.error(error.message || "Failed to update occasion"),
  })
}

export function useDeleteOccasionMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteOccasion,
    onSuccess: () => {
      toast.success("Occasion deleted")
      queryClient.invalidateQueries({ queryKey: adminKeys.occasions() })
    },
    onError: (error: Error) =>
      toast.error(error.message || "Failed to delete occasion"),
  })
}

// -- Brands --
export function useCreateBrandMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createBrand,
    onSuccess: () => {
      toast.success("Brand created")
      queryClient.invalidateQueries({ queryKey: adminKeys.brands() })
    },
    onError: (error: Error) =>
      toast.error(error.message || "Failed to create brand"),
  })
}

export function useUpdateBrandMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      updateBrand(id, data),
    onSuccess: () => {
      toast.success("Brand updated")
      queryClient.invalidateQueries({ queryKey: adminKeys.brands() })
    },
    onError: (error: Error) =>
      toast.error(error.message || "Failed to update brand"),
  })
}

export function useDeleteBrandMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteBrand,
    onSuccess: () => {
      toast.success("Brand deleted")
      queryClient.invalidateQueries({ queryKey: adminKeys.brands() })
    },
    onError: (error: Error) =>
      toast.error(error.message || "Failed to delete brand"),
  })
}

// -- Taxes --
export function useCreateTaxClassMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createTaxClass,
    onSuccess: () => {
      toast.success("Tax class created")
      queryClient.invalidateQueries({ queryKey: adminKeys.taxes() })
    },
    onError: (error: Error) =>
      toast.error(error.message || "Failed to create tax class"),
  })
}

export function useUpdateTaxClassMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      updateTaxClass(id, data),
    onSuccess: () => {
      toast.success("Tax class updated")
      queryClient.invalidateQueries({ queryKey: adminKeys.taxes() })
    },
    onError: (error: Error) =>
      toast.error(error.message || "Failed to update tax class"),
  })
}

export function useDeleteTaxClassMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteTaxClass,
    onSuccess: () => {
      toast.success("Tax class deleted")
      queryClient.invalidateQueries({ queryKey: adminKeys.taxes() })
    },
    onError: (error: Error) =>
      toast.error(error.message || "Failed to delete tax class"),
  })
}

export function useCreateTaxRateMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createTaxRate,
    onSuccess: () => {
      toast.success("Tax rate created")
      queryClient.invalidateQueries({ queryKey: adminKeys.taxes() })
    },
    onError: (error: Error) =>
      toast.error(error.message || "Failed to create tax rate"),
  })
}

export function useUpdateTaxRateMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      updateTaxRate(id, data),
    onSuccess: () => {
      toast.success("Tax rate updated")
      queryClient.invalidateQueries({ queryKey: adminKeys.taxes() })
    },
    onError: (error: Error) =>
      toast.error(error.message || "Failed to update tax rate"),
  })
}

export function useDeleteTaxRateMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteTaxRate,
    onSuccess: () => {
      toast.success("Tax rate deleted")
      queryClient.invalidateQueries({ queryKey: adminKeys.taxes() })
    },
    onError: (error: Error) =>
      toast.error(error.message || "Failed to delete tax rate"),
  })
}

export function useCreateTaxRuleMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createTaxRule,
    onSuccess: () => {
      toast.success("Tax rule created")
      queryClient.invalidateQueries({ queryKey: adminKeys.taxes() })
    },
    onError: (error: Error) =>
      toast.error(error.message || "Failed to create tax rule"),
  })
}

export function useUpdateTaxRuleMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      updateTaxRule(id, data),
    onSuccess: () => {
      toast.success("Tax rule updated")
      queryClient.invalidateQueries({ queryKey: adminKeys.taxes() })
    },
    onError: (error: Error) =>
      toast.error(error.message || "Failed to update tax rule"),
  })
}

export function useDeleteTaxRuleMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteTaxRule,
    onSuccess: () => {
      toast.success("Tax rule deleted")
      queryClient.invalidateQueries({ queryKey: adminKeys.taxes() })
    },
    onError: (error: Error) =>
      toast.error(error.message || "Failed to delete tax rule"),
  })
}

// -- Orders --
export function useUpdateOrderStatusMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string
      data: { status?: string; paymentStatus?: string; description?: string }
    }) => updateAdminOrderStatus(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: adminKeys.orders() })
      const previousOrders = queryClient.getQueryData(adminKeys.orders())
      
      queryClient.setQueriesData({ queryKey: adminKeys.orders() }, (old: any) => {
        if (!old) return old
        const items = Array.isArray(old) ? old : (old?.items || [])
        return {
          ...old,
          items: items.map((item: any) => item.id === id ? { ...item, ...data } : item)
        }
      })
      return { previousOrders }
    },
    onSuccess: () => {
      toast.success("Order status updated")
    },
    onError: (error: Error, _, context) => {
      toast.error(error.message || "Failed to update order status")
      if (context?.previousOrders) {
        queryClient.setQueriesData({ queryKey: adminKeys.orders() }, context.previousOrders)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.orders() })
    }
  })
}

// -- Returns --
export function useUpdateReturnStatusMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string
      data: { status: string; resolutionDetails?: string; pickupDate?: string }
    }) => updateAdminReturnStatus(id, data),
    onSuccess: () => {
      toast.success("Return status updated")
      queryClient.invalidateQueries({ queryKey: adminKeys.returns() })
    },
    onError: (error: Error) =>
      toast.error(error.message || "Failed to update return status"),
  })
}

// -- Users --
export function useUpdateUserRoleMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, role }: { id: string; role: string }) =>
      updateAdminUserRole(id, { role }),
    onSuccess: () => {
      toast.success("User role updated")
      queryClient.invalidateQueries({ queryKey: adminKeys.users() })
    },
    onError: (error: Error) =>
      toast.error(error.message || "Failed to update user role"),
  })
}

// -- Dashboard --
export function useExportReportMutation() {
  return useMutation({
    mutationFn: overviewApi.exportReport,
    onSuccess: (url) => {
      toast.success("Report generated successfully", {
        description: "Your download will begin shortly.",
      })
    },
    onError: (error: Error) =>
      toast.error(error.message || "Failed to generate report"),
  })
}

// -- Settings --
export function useUpdateSettingsMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: any) => {
      const { updateSettings } = await import("@/api")
      return updateSettings(payload)
    },
    onSuccess: () => {
      toast.success("Settings updated successfully")
      queryClient.invalidateQueries({
        queryKey: [...adminKeys.all, "settings"],
      })
    },
    onError: (error: Error) =>
      toast.error(error.message || "Failed to update settings"),
  })
}

// -- Media Upload (Uses FormData) --
export function useUploadMediaMutation() {
  return useMutation({
    mutationFn: async ({ file, preset }: { file: File; preset?: string }) => {
      const formData = new FormData()
      formData.append("file", file)
      if (preset) formData.append("preset", preset)
      return await apiClient.post("/media/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        timeout: 60000, // 60 seconds specifically for large uploads and R2 processing
      })
    },
    onSuccess: () => toast.success("Media uploaded successfully"),
    onError: (error: Error) =>
      toast.error(error.message || "Failed to upload media"),
  })
}

// -- Hero Carousel --
export function useCreateHeroCarouselMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: any) => {
      const { createHeroCarousel } = await import("@/api")
      return createHeroCarousel(payload)
    },
    onSuccess: () => {
      toast.success("Hero slide created")
      queryClient.invalidateQueries({ queryKey: adminKeys.heroCarousel() })
    },
    onError: (error: Error) =>
      toast.error(error.message || "Failed to create hero slide"),
  })
}

export function useUpdateHeroCarouselMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const { updateHeroCarousel } = await import("@/api")
      return updateHeroCarousel(id, data)
    },
    onSuccess: () => {
      toast.success("Hero slide updated")
      queryClient.invalidateQueries({ queryKey: adminKeys.heroCarousel() })
    },
    onError: (error: Error) =>
      toast.error(error.message || "Failed to update hero slide"),
  })
}

export function useDeleteHeroCarouselMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { deleteHeroCarousel } = await import("@/api")
      return deleteHeroCarousel(id)
    },
    onSuccess: () => {
      toast.success("Hero slide deleted")
      queryClient.invalidateQueries({ queryKey: adminKeys.heroCarousel() })
    },
    onError: (error: Error) =>
      toast.error(error.message || "Failed to delete hero slide"),
  })
}

export function useReorderHeroCarouselMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: any) => {
      const { reorderHeroCarousel } = await import("@/api")
      return reorderHeroCarousel(payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.heroCarousel() })
    },
    onError: (error: Error) =>
      toast.error(error.message || "Failed to reorder hero slides"),
  })
}

// -- Flash Sale --
export function useToggleFlashSaleMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: { isActive: boolean; endTime?: string }) => {
      const { toggleFlashSale } = await import("@/api")
      return toggleFlashSale(payload)
    },
    onSuccess: () => {
      toast.success("Flash sale status updated")
      queryClient.invalidateQueries({ queryKey: adminKeys.flashSale() })
    },
    onError: (error: Error) =>
      toast.error(error.message || "Failed to update flash sale status"),
  })
}

export function useCreateFlashSaleProductMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: any) => {
      const { createFlashSaleProduct } = await import("@/api")
      return createFlashSaleProduct(payload)
    },
    onSuccess: () => {
      toast.success("Product added to flash sale")
      queryClient.invalidateQueries({ queryKey: adminKeys.flashSale() })
    },
    onError: (error: Error) =>
      toast.error(error.message || "Failed to add product to flash sale"),
  })
}

export function useUpdateFlashSaleProductMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const { updateFlashSaleProduct } = await import("@/api")
      return updateFlashSaleProduct(id, data)
    },
    onSuccess: () => {
      toast.success("Flash sale product updated")
      queryClient.invalidateQueries({ queryKey: adminKeys.flashSale() })
    },
    onError: (error: Error) =>
      toast.error(error.message || "Failed to update flash sale product"),
  })
}

export function useDeleteFlashSaleProductMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { deleteFlashSaleProduct } = await import("@/api")
      return deleteFlashSaleProduct(id)
    },
    onSuccess: () => {
      toast.success("Product removed from flash sale")
      queryClient.invalidateQueries({ queryKey: adminKeys.flashSale() })
    },
    onError: (error: Error) =>
      toast.error(error.message || "Failed to remove product from flash sale"),
  })
}

// -- Featured Pieces & Collections --
export function useSetFeaturedPiecesMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: any) => {
      const { setFeaturedPieces } = await import("@/api")
      return setFeaturedPieces(payload)
    },
    onSuccess: () => {
      toast.success("Featured pieces updated")
      queryClient.invalidateQueries({ queryKey: [...adminKeys.all, "featuredPieces"] })
    },
    onError: (error: Error) =>
      toast.error(error.message || "Failed to update featured pieces"),
  })
}

export function useUpdateFeaturedPieceStatusMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const { updateFeaturedPieceStatus } = await import("@/api")
      return updateFeaturedPieceStatus(id, data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...adminKeys.all, "featuredPieces"] })
    },
    onError: (error: Error) =>
      toast.error(error.message || "Failed to update status"),
  })
}

export function useSetFeaturedCollectionsMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: any) => {
      const { setFeaturedCollections } = await import("@/api")
      return setFeaturedCollections(payload)
    },
    onSuccess: () => {
      toast.success("Featured collections updated")
      queryClient.invalidateQueries({ queryKey: [...adminKeys.all, "featuredCollections"] })
    },
    onError: (error: Error) =>
      toast.error(error.message || "Failed to update featured collections"),
  })
}

export function useUpdateFeaturedCollectionStatusMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const { updateFeaturedCollectionStatus } = await import("@/api")
      return updateFeaturedCollectionStatus(id, data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...adminKeys.all, "featuredCollections"] })
    },
    onError: (error: Error) =>
      toast.error(error.message || "Failed to update status"),
  })
}
