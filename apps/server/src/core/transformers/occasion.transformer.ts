import type { Occasion } from "@workspace/api-contracts"

export function transformOccasion(raw: any): Occasion {
  return raw as Occasion
}

export function transformOccasionList(raw: any): Occasion {
  return transformOccasion(raw)
}
