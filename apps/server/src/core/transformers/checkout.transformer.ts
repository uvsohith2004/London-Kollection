import type { OrderPreviewSummary } from "@workspace/api-contracts"

export function transformOrderPreviewSummary(raw: any): OrderPreviewSummary {
  return raw as OrderPreviewSummary
}
