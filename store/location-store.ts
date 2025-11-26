import { create } from "zustand"
import { Location, UserLocation } from "@/lib/types"
import apiClient from "@/lib/api-client"
import { APIResponse } from "@/lib/types"

interface LocationState {
  locations: Location[]
  userLocations: UserLocation[]
  currentLocation: Location | null
  isLoading: boolean
  error: string | null
  fetchLocations: () => Promise<void>
  fetchLocationById: (id: number) => Promise<void>
  fetchUserLocations: () => Promise<void>
  subscribeLocation: (locationId: number, priority?: number, notes?: string) => Promise<void>
  unsubscribeLocation: (userLocationId: number) => Promise<void>
  clearError: () => void
}

export const useLocationStore = create<LocationState>((set) => ({
  locations: [],
  userLocations: [],
  currentLocation: null,
  isLoading: false,
  error: null,

  fetchLocations: async () => {
    set({ isLoading: true, error: null })
    try {
      const response = await apiClient.get<APIResponse<Location[]>>("/locations")
      if (response.data.success && response.data.data) {
        set({ locations: response.data.data, isLoading: false })
      } else {
        throw new Error(response.data.message || "Lấy danh sách địa điểm thất bại")
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || "Lấy danh sách địa điểm thất bại"
      set({ error: errorMessage, isLoading: false })
    }
  },

  fetchLocationById: async (id: number) => {
    set({ isLoading: true, error: null })
    try {
      const response = await apiClient.get<APIResponse<Location>>(`/locations/${id}`)
      if (response.data.success && response.data.data) {
        set({ currentLocation: response.data.data, isLoading: false })
      } else {
        throw new Error(response.data.message || "Lấy thông tin địa điểm thất bại")
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || "Lấy thông tin địa điểm thất bại"
      set({ error: errorMessage, isLoading: false })
    }
  },

  fetchUserLocations: async () => {
    set({ isLoading: true, error: null })
    try {
      const response = await apiClient.get<APIResponse<UserLocation[]>>("/user/locations")
      if (response.data.success && response.data.data) {
        set({ userLocations: response.data.data, isLoading: false })
      } else {
        throw new Error(response.data.message || "Lấy danh sách địa điểm theo dõi thất bại")
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || "Lấy danh sách địa điểm theo dõi thất bại"
      set({ error: errorMessage, isLoading: false })
    }
  },

  subscribeLocation: async (locationId: number, priority = 1, notes?: string) => {
    set({ isLoading: true, error: null })
    try {
      const response = await apiClient.post<APIResponse<UserLocation>>("/user/locations/subscribe", {
        location_id: locationId,
        priority,
        notes,
      })
      if (response.data.success && response.data.data) {
        // Update userLocations state trực tiếp để UI update ngay
        const state = useLocationStore.getState()
        const updatedUserLocations = [...state.userLocations, response.data.data]
        set({ userLocations: updatedUserLocations, isLoading: false })
        // Refresh để đảm bảo sync với backend
        await state.fetchUserLocations()
      } else {
        throw new Error(response.data.message || "Theo dõi địa điểm thất bại")
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || "Theo dõi địa điểm thất bại"
      set({ error: errorMessage, isLoading: false })
      throw error
    }
  },

  unsubscribeLocation: async (userLocationId: number) => {
    set({ isLoading: true, error: null })
    try {
      const response = await apiClient.delete<APIResponse>(`/user/locations/${userLocationId}`)
      if (response.data.success) {
        // Update userLocations state trực tiếp để UI update ngay
        const state = useLocationStore.getState()
        const updatedUserLocations = state.userLocations.filter((ul) => ul.id !== userLocationId)
        set({ userLocations: updatedUserLocations, isLoading: false })
        // Refresh để đảm bảo sync với backend
        await state.fetchUserLocations()
      } else {
        throw new Error(response.data.message || "Hủy theo dõi địa điểm thất bại")
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || "Hủy theo dõi địa điểm thất bại"
      set({ error: errorMessage, isLoading: false })
      throw error
    }
  },

  clearError: () => {
    set({ error: null })
  },
}))

