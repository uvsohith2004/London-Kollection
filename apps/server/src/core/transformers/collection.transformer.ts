import type { Collection } from "@workspace/api-contracts"

export function transformCollection(raw: any): Collection {
  return {
    ...raw,
  }
}

export function transformCollectionList(raw: any): Collection {
  return transformCollection(raw)
}
