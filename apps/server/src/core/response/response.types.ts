export interface ApiError {
  code: string
  message: string
  details?: Record<string, any>
}

export interface PaginationMeta {
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  meta?: PaginationMeta | Record<string, any>
  error?: ApiError
}

export interface ApiSuccess<T = any> extends ApiResponse<T> {
  success: true
  data: T
}
