import axios from "axios"

import {
  ApiError,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  InternalServerError
} from "@/lib/errors"

const isServer = typeof window === "undefined";

let baseURL = "/api";
if (isServer) {
  baseURL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
} else {
  baseURL = process.env.NEXT_PUBLIC_SITE_URL ? `${process.env.NEXT_PUBLIC_SITE_URL}/api` : "/api";
}

export const apiClient = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
  timeout: 10000,
})

apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const guestCartId = localStorage.getItem("guest-cart-id");
      if (guestCartId) {
        config.headers["x-guest-cart-id"] = guestCartId;
      }
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

apiClient.interceptors.response.use(
  (response) => {
    const res = response.data
    
    // Normalize backend ok() / paginated() wrappers to what UI expects
    if (res && res.success === true && "data" in res) {
      if (Array.isArray(res.data)) {
        res.items = res.data
      } else if (res.data && typeof res.data === 'object') {
        // If data is an object like { ticket: ... } or { user: ... }, merge it up
        Object.assign(res, res.data)
        if (res.data.items) {
          res.items = res.data.items
        }
      }
      return res
    }
    
    return res
  },
  (error) => {
    const status = error.response?.status
    const customErrorMsg =
      error.response?.data?.error?.message ||
      error.response?.data?.message ||
      error.message ||
      "An unexpected error occurred."
      
    const details = error.response?.data?.error?.details || error.response?.data?.details;

    let normalizedError: ApiError;

    switch (status) {
      case 400:
        normalizedError = new ValidationError(customErrorMsg, details);
        break;
      case 401:
        if (typeof window !== "undefined") {
          // Handle unauthorized e.g. redirect to login if necessary
          // window.location.href = '/login'
        }
        normalizedError = new UnauthorizedError(customErrorMsg);
        break;
      case 403:
        normalizedError = new ForbiddenError(customErrorMsg);
        break;
      case 404:
        normalizedError = new NotFoundError(customErrorMsg);
        break;
      case 409:
        normalizedError = new ConflictError(customErrorMsg);
        break;
      case 429:
        normalizedError = new RateLimitError(customErrorMsg);
        break;
      case 500:
        normalizedError = new InternalServerError(customErrorMsg);
        break;
      default:
        normalizedError = new ApiError(customErrorMsg, status || 500, details);
    }
      
    return Promise.reject(normalizedError)
  }
)

export const get = async <T = any>(url: string, config?: any): Promise<T> =>
  (await apiClient.get(url, config)) as unknown as T;

export const post = async <T = any>(url: string, data?: any, config?: any): Promise<T> =>
  (await apiClient.post(url, data, config)) as unknown as T;

export const put = async <T = any>(url: string, data?: any, config?: any): Promise<T> =>
  (await apiClient.put(url, data, config)) as unknown as T;

export const patch = async <T = any>(url: string, data?: any, config?: any): Promise<T> =>
  (await apiClient.patch(url, data, config)) as unknown as T;

export const del = async <T = any>(url: string, config?: any): Promise<T> =>
  (await apiClient.delete(url, config)) as unknown as T;

