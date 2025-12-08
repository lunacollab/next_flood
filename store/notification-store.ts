import { create } from "zustand"
import { Notification } from "@/lib/types"
import apiClient from "@/lib/api-client"
import { APIResponse } from "@/lib/types"

interface NotificationState {
  notifications: Notification[]
  unreadCount: number
  isLoading: boolean
  error: string | null
  fetchNotifications: (limit?: number, offset?: number) => Promise<void>
  markAsRead: (id: number) => Promise<void>
  markAllAsRead: () => Promise<void>
  deleteNotification: (id: number) => Promise<void>
  clearError: () => void
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,

  fetchNotifications: async (limit = 20, offset = 0) => {
    set({ isLoading: true, error: null })
    try {
      const response = await apiClient.get<APIResponse<Notification[]>>("/notifications", {
        params: { limit, offset },
      })
      if (response.data.success && response.data.data) {
        const notifications = response.data.data
        const unreadCount = notifications.filter((n) => !n.is_read).length
        set({ notifications, unreadCount, isLoading: false })
      } else {
        throw new Error(response.data.message || "Lấy danh sách thông báo thất bại")
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || "Lấy danh sách thông báo thất bại"
      set({ error: errorMessage, isLoading: false })
    }
  },

  markAsRead: async (id: number) => {
    try {
      const response = await apiClient.put<APIResponse>(`/notifications/${id}/read`)
      if (response.data.success) {
        // Update local state
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, is_read: true } : n
          ),
          unreadCount: Math.max(0, state.unreadCount - 1),
        }))
      } else {
        throw new Error(response.data.message || "Đánh dấu đã đọc thất bại")
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || "Đánh dấu đã đọc thất bại"
      set({ error: errorMessage })
      throw error
    }
  },

  markAllAsRead: async () => {
    try {
      const response = await apiClient.post<APIResponse>("/notifications/mark-all-read")
      if (response.data.success) {
        // Update local state
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, is_read: true })),
          unreadCount: 0,
        }))
      } else {
        throw new Error(response.data.message || "Đánh dấu tất cả đã đọc thất bại")
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || "Đánh dấu tất cả đã đọc thất bại"
      set({ error: errorMessage })
      throw error
    }
  },

  deleteNotification: async (id: number) => {
    try {
      const response = await apiClient.delete<APIResponse>(`/notifications/${id}`)
      if (response.data.success) {
        // Update local state
        set((state) => {
          const notification = state.notifications.find((n) => n.id === id)
          return {
            notifications: state.notifications.filter((n) => n.id !== id),
            unreadCount: notification && !notification.is_read ? Math.max(0, state.unreadCount - 1) : state.unreadCount,
          }
        })
      } else {
        throw new Error(response.data.message || "Xóa thông báo thất bại")
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || "Xóa thông báo thất bại"
      set({ error: errorMessage })
      throw error
    }
  },

  clearError: () => {
    set({ error: null })
  },
}))

