import type { Brand } from "@workspace/api-contracts"

export function transformBrand(raw: any): Brand {
  return raw as Brand
}

export function transformBrandList(raw: any): Brand {
  return transformBrand(raw)
}
