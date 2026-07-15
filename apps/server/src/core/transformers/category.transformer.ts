import type { Category } from "@workspace/api-contracts"

export function transformCategory(raw: any): Category {
  return {
    ...raw,
  }
}

export function transformCategoryList(raw: any): Category {
  return transformCategory(raw)
}
