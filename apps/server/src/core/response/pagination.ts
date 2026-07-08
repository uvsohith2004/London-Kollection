import { PaginationMeta } from "./response.types"

export function calculateTotalPages(totalItems: number, limit: number): number {
  return Math.ceil(totalItems / limit) || 1
}

export function buildPaginationMeta(
  total: number,
  page: number,
  limit: number
): PaginationMeta {
  return {
    total,
    page,
    limit,
    totalPages: calculateTotalPages(total, limit),
  }
}
