import { create } from "zustand"
import { Alert } from "@/lib/types"
import apiClient from "@/lib/api-client"
import { APIResponse } from "@/lib/types"

interface AlertState {
  alerts: Alert[]
  currentAlert: Alert | null
  isLoading: boolean
  error: string | null
  fetchAlerts: (limit?: number, offset?: number) => Promise<void>
  fetchAlertById: (id: number) => Promise<void>
  fetchAlertsByLocation: (locationId: number) => Promise<void>
  fetchUserAlerts: () => Promise<void>
  clearError: () => void
}

export const useAlertStore = create<AlertState>((set) => ({
  alerts: [],
  currentAlert: null,
  isLoading: false,
  error: null,

  fetchAlerts: async (limit = 20, offset = 0) => {
    set({ isLoading: true, error: null })
    try {
      const response = await apiClient.get<APIResponse<Alert[]>>("/alerts", {
        params: { limit, offset },
      })
      if (response.data.success && response.data.data) {
        set({ alerts: response.data.data, isLoading: false })
      } else {
        throw new Error(response.data.message || "Lấy danh sách cảnh báo thất bại")
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || "Lấy danh sách cảnh báo thất bại"
      set({ error: errorMessage, isLoading: false })
    }
  },

  fetchAlertById: async (id: number) => {
    set({ isLoading: true, error: null })
    try {
      const response = await apiClient.get<APIResponse<Alert>>(`/alerts/${id}`)
      if (response.data.success && response.data.data) {
        set({ currentAlert: response.data.data, isLoading: false })
      } else {
        throw new Error(response.data.message || "Lấy thông tin cảnh báo thất bại")
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || "Lấy thông tin cảnh báo thất bại"
      set({ error: errorMessage, isLoading: false })
    }
  },

  fetchAlertsByLocation: async (locationId: number) => {
    set({ isLoading: true, error: null })
    try {
      const response = await apiClient.get<APIResponse<Alert[]>>(`/alerts/location/${locationId}`)
      if (response.data.success && response.data.data) {
        set({ alerts: response.data.data, isLoading: false })
      } else {
        throw new Error(response.data.message || "Lấy cảnh báo theo địa điểm thất bại")
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || "Lấy cảnh báo theo địa điểm thất bại"
      set({ error: errorMessage, isLoading: false })
    }
  },

  fetchUserAlerts: async () => {
    set({ isLoading: true, error: null })
    try {
      const response = await apiClient.get<APIResponse<Alert[]>>("/user/alerts")
      if (response.data.success && response.data.data) {
        set({ alerts: response.data.data, isLoading: false })
      } else {
        throw new Error(response.data.message || "Lấy cảnh báo của bạn thất bại")
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || "Lấy cảnh báo của bạn thất bại"
      set({ error: errorMessage, isLoading: false })
    }
  },

  clearError: () => {
    set({ error: null })
  },
}))

