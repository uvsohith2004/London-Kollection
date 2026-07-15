import { useMutation, useQueryClient } from "@tanstack/react-query"
import { auditApi } from "@/api-client/index"
import { auditKeys } from "./queries"

export function useDeleteAuditLogMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => auditApi.deleteLog(id),
    onSuccess: () => {
      // Invalidate and refetch logs after a successful deletion
      queryClient.invalidateQueries({ queryKey: auditKeys.lists() })
    },
  })
}
