export interface User {
  id: number
  email: string
  full_name: string
  phone?: string
  address?: string
  avatar_path?: string
  avatar_url?: string
  role: "user" | "admin"
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Location {
  id: number
  name: string
  province: string
  district?: string
  ward?: string
  latitude: number
  longitude: number
  description?: string
  image_path?: string
  image_url?: string
  is_monitoring: boolean
  created_at: string
  updated_at: string
}

export interface UserLocation {
  id: number
  user_id: number
  location_id: number
  priority: number
  notes?: string
  created_at: string
  location?: Location
}

export type AlertLevel = "info" | "warning" | "danger" | "critical"

export interface AlertShelter {
  name: string
  address: string
  capacity: number
  coordinates: {
    lat: number
    lng: number
  }
}

export interface EmergencyContact {
  name: string
  phone: string
}

export interface Alert {
  id: number
  location_id: number
  level: AlertLevel
  title: string
  description: string
  water_level?: number
  rainfall?: number
  wind_speed?: number
  temperature?: number
  humidity?: number
  forecast?: string
  safety_instructions?: string
  shelters?: AlertShelter[]
  emergency_contacts?: EmergencyContact[]
  image_path?: string
  image_url?: string
  is_active: boolean
  start_time?: string
  end_time?: string
  created_by?: number
  created_at: string
  updated_at: string
  location?: Location
}

export interface Contact {
  id: number
  user_id: number
  full_name: string
  phone: string
  email?: string
  relationship?: string
  avatar_path?: string
  avatar_url?: string
  is_emergency: boolean
  created_at: string
  updated_at: string
}

export interface Notification {
  id: number
  user_id: number
  alert_id?: number
  title: string
  message: string
  type: "alert" | "system" | "info"
  is_read: boolean
  sent_at: string
}

export interface Article {
  id: number
  title: string
  slug: string
  summary?: string
  content: string
  category: string
  thumbnail_path?: string
  thumbnail_url?: string
  author_id?: number
  view_count: number
  is_published: boolean
  published_at?: string
  created_at: string
  updated_at: string
}

export interface Shelter {
  id: number
  location_id: number
  name: string
  address: string
  latitude: number
  longitude: number
  capacity: number
  current_occupancy: number
  contact_phone?: string
  contact_person?: string
  facilities?: string
  image_path?: string
  image_url?: string
  is_available: boolean
  created_at: string
  updated_at: string
}

export interface EmergencyHotline {
  id: number
  location_id?: number
  name: string
  phone: string
  description?: string
  category?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface APIResponse<T = any> {
  success: boolean
  message: string
  data?: T
  error?: string
}

export interface PaginatedResponse<T = any> {
  success: boolean
  message: string
  data: T[]
  meta: {
    page: number
    per_page: number
    total: number
    total_pages: number
  }
}

