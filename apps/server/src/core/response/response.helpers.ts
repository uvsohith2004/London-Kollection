import { ApiResponse, PaginationMeta } from "./response.types"
import { RESPONSE_MESSAGES } from "./response.constants"

export function ok<T>(data: T, message?: string, meta?: Record<string, any>): ApiResponse<T> {
  return {
    success: true,
    data,
    ...(message && { message }),
    ...(meta && { meta }),
  }
}

export function created<T>(data: T, message = RESPONSE_MESSAGES.CREATED, meta?: Record<string, any>): ApiResponse<T> {
  return {
    success: true,
    data,
    message,
    ...(meta && { meta }),
  }
}

export function paginated<T>(
  data: T[],
  meta: PaginationMeta,
  message?: string
): ApiResponse<T[]> {
  return {
    success: true,
    data,
    meta,
    ...(message && { message }),
  }
}

export function noContent(): ApiResponse<null> {
  return {
    success: true,
    data: null,
  }
}

export function accepted<T>(data: T, message = RESPONSE_MESSAGES.ACCEPTED): ApiResponse<T> {
  return {
    success: true,
    data,
    message,
  }
}

export function fail(code: string, message: string, details?: Record<string, any>): ApiResponse<null> {
  return {
    success: false,
    error: {
      code,
      message,
      ...(details && { details }),
    },
  }
}
