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
} from "@/lib/api/index"
import { adminCatalogKeys } from "./queries"

export function useCreateProductMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      toast.success("Product created successfully")
      queryClient.invalidateQueries({ queryKey: adminCatalogKeys.products })
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create product")
    },
  })
}

export function useUpdateProductMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      updateProduct(id, data),
    onSuccess: () => {
      toast.success("Product updated successfully")
      queryClient.invalidateQueries({ queryKey: adminCatalogKeys.products })
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update product")
    },
  })
}

export function useDeleteProductMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      toast.success("Product deleted successfully")
      queryClient.invalidateQueries({ queryKey: adminCatalogKeys.products })
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete product")
    },
  })
}

// Categories
export function useCreateCategoryMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      toast.success("Category created")
      queryClient.invalidateQueries({ queryKey: adminCatalogKeys.categories })
    },
    onError: (error: any) =>
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
      queryClient.invalidateQueries({ queryKey: adminCatalogKeys.categories })
    },
    onError: (error: any) =>
      toast.error(error.message || "Failed to update category"),
  })
}

export function useDeleteCategoryMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      toast.success("Category deleted")
      queryClient.invalidateQueries({ queryKey: adminCatalogKeys.categories })
    },
    onError: (error: any) =>
      toast.error(error.message || "Failed to delete category"),
  })
}

// Collections
export function useCreateCollectionMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createCollection,
    onSuccess: () => {
      toast.success("Collection created")
      queryClient.invalidateQueries({ queryKey: adminCatalogKeys.collections })
    },
    onError: (error: any) =>
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
      queryClient.invalidateQueries({ queryKey: adminCatalogKeys.collections })
    },
    onError: (error: any) =>
      toast.error(error.message || "Failed to update collection"),
  })
}

export function useDeleteCollectionMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteCollection,
    onSuccess: () => {
      toast.success("Collection deleted")
      queryClient.invalidateQueries({ queryKey: adminCatalogKeys.collections })
    },
    onError: (error: any) =>
      toast.error(error.message || "Failed to delete collection"),
  })
}

// Occasions
export function useCreateOccasionMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createOccasion,
    onSuccess: () => {
      toast.success("Occasion created")
      queryClient.invalidateQueries({ queryKey: adminCatalogKeys.occasions })
    },
    onError: (error: any) =>
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
      queryClient.invalidateQueries({ queryKey: adminCatalogKeys.occasions })
    },
    onError: (error: any) =>
      toast.error(error.message || "Failed to update occasion"),
  })
}

export function useDeleteOccasionMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteOccasion,
    onSuccess: () => {
      toast.success("Occasion deleted")
      queryClient.invalidateQueries({ queryKey: adminCatalogKeys.occasions })
    },
    onError: (error: any) =>
      toast.error(error.message || "Failed to delete occasion"),
  })
}
