import { create } from "zustand"
import { User, Alert, Location, Article } from "@/lib/types"
import apiClient from "@/lib/api-client"
import { APIResponse } from "@/lib/types"

interface PaginationMeta {
  total: number
  limit: number
  offset: number
}

interface AdminState {
  users: User[]
  alerts: Alert[]
  locations: Location[]
  articles: Article[]
  pagination: {
    users: PaginationMeta | null
    alerts: PaginationMeta | null
    locations: PaginationMeta | null
    articles: PaginationMeta | null
  }
  statistics: {
    total_users: number
    total_alerts: number
    total_locations: number
    total_articles: number
  } | null
  isLoading: boolean
  error: string | null

  // Users
  fetchUsers: (limit?: number, offset?: number) => Promise<void>
  toggleUserStatus: (id: number) => Promise<void>
  deleteUser: (id: number) => Promise<void>

  // Alerts
  fetchAlerts: (limit?: number, offset?: number) => Promise<void>
  createAlert: (data: any) => Promise<void>
  updateAlert: (id: number, data: any) => Promise<void>
  deleteAlert: (id: number) => Promise<void>

  // Locations
  fetchLocations: (limit?: number, offset?: number) => Promise<void>
  createLocation: (data: any) => Promise<void>
  updateLocation: (id: number, data: any) => Promise<void>
  deleteLocation: (id: number) => Promise<void>

  // Articles
  fetchArticles: (limit?: number, offset?: number) => Promise<void>
  createArticle: (data: any) => Promise<void>
  updateArticle: (id: number, data: any) => Promise<void>
  deleteArticle: (id: number) => Promise<void>

  // Statistics
  fetchStatistics: () => Promise<void>

  clearError: () => void
}

export const useAdminStore = create<AdminState>((set) => ({
  users: [],
  alerts: [],
  locations: [],
  articles: [],
  pagination: {
    users: null,
    alerts: null,
    locations: null,
    articles: null,
  },
  statistics: null,
  isLoading: false,
  error: null,

  fetchUsers: async (limit = 20, offset = 0) => {
    set({ isLoading: true, error: null })
    try {
      const response = await apiClient.get<APIResponse<{ data: User[]; total: number; limit: number; offset: number }>>(
        `/admin/users?limit=${limit}&offset=${offset}`
      )
      if (response.data.success && response.data.data) {
        set({
          users: response.data.data.data || [],
          pagination: {
            ...useAdminStore.getState().pagination,
            users: {
              total: response.data.data.total || 0,
              limit: response.data.data.limit || limit,
              offset: response.data.data.offset || offset,
            },
          },
          isLoading: false,
        })
      } else {
        throw new Error(response.data.message || "Lấy danh sách người dùng thất bại")
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || "Lấy danh sách người dùng thất bại"
      set({ error: errorMessage, isLoading: false, users: [] })
    }
  },

  toggleUserStatus: async (id: number) => {
    try {
      const response = await apiClient.put<APIResponse<User>>(`/admin/users/${id}/status`)
      if (response.data.success) {
        const state = useAdminStore.getState()
        await state.fetchUsers()
      } else {
        throw new Error(response.data.message || "Cập nhật trạng thái thất bại")
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || "Cập nhật trạng thái thất bại"
      set({ error: errorMessage })
      throw error
    }
  },

  deleteUser: async (id: number) => {
    try {
      const response = await apiClient.delete<APIResponse>(`/admin/users/${id}`)
      if (response.data.success) {
        const state = useAdminStore.getState()
        await state.fetchUsers()
      } else {
        throw new Error(response.data.message || "Xóa người dùng thất bại")
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || "Xóa người dùng thất bại"
      set({ error: errorMessage })
      throw error
    }
  },

  fetchAlerts: async (limit = 20, offset = 0) => {
    set({ isLoading: true, error: null })
    try {
      const response = await apiClient.get<APIResponse<{ data: Alert[]; total: number; limit: number; offset: number }>>(
        `/admin/alerts?limit=${limit}&offset=${offset}`
      )
      if (response.data.success && response.data.data) {
        set({
          alerts: response.data.data.data || [],
          pagination: {
            ...useAdminStore.getState().pagination,
            alerts: {
              total: response.data.data.total || 0,
              limit: response.data.data.limit || limit,
              offset: response.data.data.offset || offset,
            },
          },
          isLoading: false,
        })
      } else {
        throw new Error(response.data.message || "Lấy danh sách cảnh báo thất bại")
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || "Lấy danh sách cảnh báo thất bại"
      set({ error: errorMessage, isLoading: false, alerts: [] })
    }
  },

  createAlert: async (data: any) => {
    set({ isLoading: true, error: null })
    try {
      const response = await apiClient.post<APIResponse<Alert>>("/admin/alerts", data)
      if (response.data.success) {
        const state = useAdminStore.getState()
        await state.fetchAlerts()
      } else {
        throw new Error(response.data.message || "Tạo cảnh báo thất bại")
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || "Tạo cảnh báo thất bại"
      set({ error: errorMessage, isLoading: false })
      throw error
    }
  },

  updateAlert: async (id: number, data: any) => {
    set({ isLoading: true, error: null })
    try {
      const response = await apiClient.put<APIResponse<Alert>>(`/admin/alerts/${id}`, data)
      if (response.data.success) {
        const state = useAdminStore.getState()
        await state.fetchAlerts()
      } else {
        throw new Error(response.data.message || "Cập nhật cảnh báo thất bại")
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || "Cập nhật cảnh báo thất bại"
      set({ error: errorMessage, isLoading: false })
      throw error
    }
  },

  deleteAlert: async (id: number) => {
    try {
      const response = await apiClient.delete<APIResponse>(`/admin/alerts/${id}`)
      if (response.data.success) {
        const state = useAdminStore.getState()
        await state.fetchAlerts()
      } else {
        throw new Error(response.data.message || "Xóa cảnh báo thất bại")
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || "Xóa cảnh báo thất bại"
      set({ error: errorMessage })
      throw error
    }
  },

  fetchLocations: async (limit = 20, offset = 0) => {
    set({ isLoading: true, error: null })
    try {
      const response = await apiClient.get<APIResponse<{ data: Location[]; total: number; limit: number; offset: number }>>(
        `/admin/locations?limit=${limit}&offset=${offset}`
      )
      if (response.data.success && response.data.data) {
        set({
          locations: response.data.data.data || [],
          pagination: {
            ...useAdminStore.getState().pagination,
            locations: {
              total: response.data.data.total || 0,
              limit: response.data.data.limit || limit,
              offset: response.data.data.offset || offset,
            },
          },
          isLoading: false,
        })
      } else {
        throw new Error(response.data.message || "Lấy danh sách địa điểm thất bại")
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || "Lấy danh sách địa điểm thất bại"
      set({ error: errorMessage, isLoading: false, locations: [] })
    }
  },

  createLocation: async (data: any) => {
    set({ isLoading: true, error: null })
    try {
      const response = await apiClient.post<APIResponse<Location>>("/admin/locations", data)
      if (response.data.success) {
        const state = useAdminStore.getState()
        await state.fetchLocations()
      } else {
        throw new Error(response.data.message || "Tạo địa điểm thất bại")
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || "Tạo địa điểm thất bại"
      set({ error: errorMessage, isLoading: false })
      throw error
    }
  },

  updateLocation: async (id: number, data: any) => {
    set({ isLoading: true, error: null })
    try {
      const response = await apiClient.put<APIResponse<Location>>(`/admin/locations/${id}`, data)
      if (response.data.success) {
        const state = useAdminStore.getState()
        await state.fetchLocations()
      } else {
        throw new Error(response.data.message || "Cập nhật địa điểm thất bại")
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || "Cập nhật địa điểm thất bại"
      set({ error: errorMessage, isLoading: false })
      throw error
    }
  },

  deleteLocation: async (id: number) => {
    try {
      const response = await apiClient.delete<APIResponse>(`/admin/locations/${id}`)
      if (response.data.success) {
        const state = useAdminStore.getState()
        await state.fetchLocations()
      } else {
        throw new Error(response.data.message || "Xóa địa điểm thất bại")
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || "Xóa địa điểm thất bại"
      set({ error: errorMessage })
      throw error
    }
  },

  fetchArticles: async (limit = 20, offset = 0) => {
    set({ isLoading: true, error: null })
    try {
      const response = await apiClient.get<APIResponse<{ data: Article[]; total: number; limit: number; offset: number }>>(
        `/admin/articles?limit=${limit}&offset=${offset}`
      )
      if (response.data.success && response.data.data) {
        set({
          articles: response.data.data.data || [],
          pagination: {
            ...useAdminStore.getState().pagination,
            articles: {
              total: response.data.data.total || 0,
              limit: response.data.data.limit || limit,
              offset: response.data.data.offset || offset,
            },
          },
          isLoading: false,
        })
      } else {
        throw new Error(response.data.message || "Lấy danh sách bài viết thất bại")
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || "Lấy danh sách bài viết thất bại"
      set({ error: errorMessage, isLoading: false, articles: [] })
    }
  },

  createArticle: async (data: any) => {
    set({ isLoading: true, error: null })
    try {
      const response = await apiClient.post<APIResponse<Article>>("/admin/articles", data)
      if (response.data.success) {
        const state = useAdminStore.getState()
        await state.fetchArticles()
      } else {
        throw new Error(response.data.message || "Tạo bài viết thất bại")
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || "Tạo bài viết thất bại"
      set({ error: errorMessage, isLoading: false })
      throw error
    }
  },

  updateArticle: async (id: number, data: any) => {
    set({ isLoading: true, error: null })
    try {
      const response = await apiClient.put<APIResponse<Article>>(`/admin/articles/${id}`, data)
      if (response.data.success) {
        const state = useAdminStore.getState()
        await state.fetchArticles()
      } else {
        throw new Error(response.data.message || "Cập nhật bài viết thất bại")
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || "Cập nhật bài viết thất bại"
      set({ error: errorMessage, isLoading: false })
      throw error
    }
  },

  deleteArticle: async (id: number) => {
    try {
      const response = await apiClient.delete<APIResponse>(`/admin/articles/${id}`)
      if (response.data.success) {
        const state = useAdminStore.getState()
        await state.fetchArticles()
      } else {
        throw new Error(response.data.message || "Xóa bài viết thất bại")
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || "Xóa bài viết thất bại"
      set({ error: errorMessage })
      throw error
    }
  },

  fetchStatistics: async () => {
    set({ isLoading: true, error: null })
    try {
      const response = await apiClient.get<APIResponse<{
        total_users: number
        total_alerts: number
        total_locations: number
        total_articles: number
      }>>("/admin/statistics")
      if (response.data.success && response.data.data) {
        set({ statistics: response.data.data, isLoading: false })
      } else {
        throw new Error(response.data.message || "Lấy thống kê thất bại")
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || "Lấy thống kê thất bại"
      set({ error: errorMessage, isLoading: false })
    }
  },

  clearError: () => {
    set({ error: null })
  },
}))

