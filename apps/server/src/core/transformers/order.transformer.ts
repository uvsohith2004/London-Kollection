import type { Order } from "@workspace/api-contracts"

export function transformOrder(raw: any): Order {
  return raw as Order
}

export function transformOrderList(raw: any): Order {
  return transformOrder(raw)
}
