import { useQuery } from "@tanstack/react-query"
import { auditApi, AuditLog } from "@/lib/api/index"

export const auditKeys = {
  all: ["auditLogs"] as const,
  lists: () => [...auditKeys.all, "list"] as const,
}

export function useAuditLogsQuery() {
  return useQuery<AuditLog[], Error>({
    queryKey: auditKeys.lists(),
    queryFn: auditApi.getLogs,
  })
}
