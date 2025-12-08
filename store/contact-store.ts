import { create } from "zustand"
import { Contact } from "@/lib/types"
import apiClient from "@/lib/api-client"
import { APIResponse } from "@/lib/types"
import { CreateContactInput, UpdateContactInput } from "@/lib/validations/contact"

interface ContactState {
  contacts: Contact[]
  currentContact: Contact | null
  isLoading: boolean
  error: string | null
  fetchContacts: () => Promise<void>
  fetchContactById: (id: number) => Promise<void>
  createContact: (data: CreateContactInput, avatarFile?: File | null) => Promise<void>
  updateContact: (id: number, data: UpdateContactInput, avatarFile?: File | null) => Promise<void>
  deleteContact: (id: number) => Promise<void>
  clearError: () => void
}

export const useContactStore = create<ContactState>((set) => ({
  contacts: [],
  currentContact: null,
  isLoading: false,
  error: null,

  fetchContacts: async () => {
    set({ isLoading: true, error: null })
    try {
      const response = await apiClient.get<APIResponse<Contact[]>>("/contacts")
      if (response.data.success && response.data.data) {
        set({ contacts: response.data.data, isLoading: false })
      } else {
        throw new Error(response.data.message || "Lấy danh sách liên hệ thất bại")
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || "Lấy danh sách liên hệ thất bại"
      set({ error: errorMessage, isLoading: false })
    }
  },

  fetchContactById: async (id: number) => {
    set({ isLoading: true, error: null })
    try {
      const response = await apiClient.get<APIResponse<Contact>>(`/contacts/${id}`)
      if (response.data.success && response.data.data) {
        set({ currentContact: response.data.data, isLoading: false })
      } else {
        throw new Error(response.data.message || "Lấy thông tin liên hệ thất bại")
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || "Lấy thông tin liên hệ thất bại"
      set({ error: errorMessage, isLoading: false })
    }
  },

  createContact: async (data: CreateContactInput, avatarFile?: File | null) => {
    set({ isLoading: true, error: null })
    try {
      const formData = new FormData()
      formData.append("full_name", data.full_name)
      formData.append("phone", data.phone)
      if (data.email) formData.append("email", data.email)
      if (data.relationship) formData.append("relationship", data.relationship)
      formData.append("is_emergency", data.is_emergency.toString())
      if (avatarFile) {
        formData.append("avatar", avatarFile)
      }

      const response = await apiClient.post<APIResponse<Contact>>("/contacts", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      if (response.data.success && response.data.data) {
        // Refresh contacts
        const state = useContactStore.getState()
        await state.fetchContacts()
      } else {
        throw new Error(response.data.message || "Thêm liên hệ thất bại")
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || "Thêm liên hệ thất bại"
      set({ error: errorMessage, isLoading: false })
      throw error
    }
  },

  updateContact: async (id: number, data: UpdateContactInput, avatarFile?: File | null) => {
    set({ isLoading: true, error: null })
    try {
      const formData = new FormData()
      formData.append("full_name", data.full_name)
      formData.append("phone", data.phone)
      if (data.email) formData.append("email", data.email)
      if (data.relationship) formData.append("relationship", data.relationship)
      formData.append("is_emergency", data.is_emergency.toString())
      if (avatarFile) {
        formData.append("avatar", avatarFile)
      }

      const response = await apiClient.put<APIResponse<Contact>>(`/contacts/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      if (response.data.success && response.data.data) {
        // Refresh contacts
        const state = useContactStore.getState()
        await state.fetchContacts()
      } else {
        throw new Error(response.data.message || "Cập nhật liên hệ thất bại")
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || "Cập nhật liên hệ thất bại"
      set({ error: errorMessage, isLoading: false })
      throw error
    }
  },

  deleteContact: async (id: number) => {
    set({ isLoading: true, error: null })
    try {
      const response = await apiClient.delete<APIResponse>(`/contacts/${id}`)
      if (response.data.success) {
        // Refresh contacts
        const state = useContactStore.getState()
        await state.fetchContacts()
      } else {
        throw new Error(response.data.message || "Xóa liên hệ thất bại")
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || "Xóa liên hệ thất bại"
      set({ error: errorMessage, isLoading: false })
      throw error
    }
  },

  clearError: () => {
    set({ error: null })
  },
}))

