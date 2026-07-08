import axios from "axios"

const baseURL = process.env.NEXT_PUBLIC_API_URL || "/api"

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
    console.log(config.baseURL, config.url)
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
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        // Handle unauthorized e.g. redirect to login
        // window.location.href = '/login'
      }
    }

    // Try to parse standard error format: { success: false, error: { message } }
    const customError =
      error.response?.data?.error?.message ||
      error.response?.data?.message ||
      error.message ||
      "An unexpected error occurred."
      
    return Promise.reject(new Error(customError))
  }
)
