import type { ReturnRequest } from "@workspace/api-contracts"

export function transformReturnRequest(raw: any): ReturnRequest {
  return raw as ReturnRequest
}

export function transformReturnRequestList(raw: any): ReturnRequest {
  return transformReturnRequest(raw)
}
