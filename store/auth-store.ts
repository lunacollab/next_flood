import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import { User, APIResponse } from "@/lib/types"
import apiClient from "@/lib/api-client"
import { LoginInput, RegisterInput } from "@/lib/validations/auth"

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  isHydrated: boolean
  error: string | null
  login: (credentials: LoginInput) => Promise<void>
  register: (data: RegisterInput) => Promise<void>
  logout: () => void
  updateUser: (user: User) => void
  clearError: () => void
  setHydrated: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      isHydrated: false,
      error: null,

      setHydrated: () => {
        set({ isHydrated: true })
      },

      login: async (credentials: LoginInput) => {
        set({ isLoading: true, error: null })
        try {
          const response = await apiClient.post<APIResponse<{ token: string; user: User }>>(
            "/auth/login",
            credentials
          )
          if (response.data.success && response.data.data) {
            const { token, user } = response.data.data
            localStorage.setItem("token", token)
            set({
              user,
              token,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            })
          } else {
            throw new Error(response.data.message || "Đăng nhập thất bại")
          }
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || error.message || "Đăng nhập thất bại"
          set({ error: errorMessage, isLoading: false, isAuthenticated: false })
          throw error
        }
      },

      register: async (data: RegisterInput) => {
        set({ isLoading: true, error: null })
        try {
          const response = await apiClient.post<APIResponse<User>>("/auth/register", data)
          if (response.data.success && response.data.data) {
            set({ isLoading: false, error: null })
          } else {
            throw new Error(response.data.message || "Đăng ký thất bại")
          }
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || error.message || "Đăng ký thất bại"
          set({ error: errorMessage, isLoading: false })
          throw error
        }
      },

      logout: () => {
        localStorage.removeItem("token")
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null,
        })
      },

      updateUser: (user: User) => {
        set({ user })
      },

      clearError: () => {
        set({ error: null })
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        // Khi rehydrate xong, set isHydrated = true
        if (state) {
          state.setHydrated()
          // Đồng bộ token vào localStorage nếu có
          if (state.token) {
            localStorage.setItem("token", state.token)
          }
        }
      },
    }
  )
)

