import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from "axios"
import { API_BASE_URL } from "./constants"

// Tạo axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

// Request interceptor để thêm token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token")
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor để xử lý lỗi
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ success: boolean; message: string; error?: string }>) => {
    if (error.response?.status === 401) {
      // Unauthorized - xóa token và redirect về login
      // Nhưng không redirect nếu đang ở trang login hoặc register
      // Và không redirect nếu request đang được gọi từ trang login/register
      if (typeof window !== "undefined") {
        const currentPath = window.location.pathname
        const isAuthPage = currentPath === "/login" || currentPath === "/register"
        const isAuthRequest = error.config?.url?.includes("/auth/login") || error.config?.url?.includes("/auth/register")
        
        // Chỉ redirect nếu không phải trang auth và không phải request auth
        if (!isAuthPage && !isAuthRequest) {
          // Clear auth state
          localStorage.removeItem("token")
          localStorage.removeItem("user")
          localStorage.removeItem("auth-storage")
          
          // Chỉ redirect nếu chưa ở trang login
          if (currentPath !== "/login") {
            window.location.href = "/login"
          }
        }
      }
    }
    return Promise.reject(error)
  }
)

export default apiClient

