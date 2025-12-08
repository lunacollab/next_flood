"use client"

import { useEffect } from "react"
import { useAuthStore } from "@/store/auth-store"

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setHydrated, isHydrated, token } = useAuthStore()

  useEffect(() => {
    // Đảm bảo hydration được set sau khi component mount
    // Check localStorage trực tiếp để đảm bảo hydration được set ngay lập tức
    if (typeof window !== "undefined" && !isHydrated) {
      // Check xem có token trong localStorage không (persist middleware đã rehydrate)
      const storedToken = localStorage.getItem("token")
      const storedAuth = localStorage.getItem("auth-storage")
      
      // Nếu có token hoặc có stored auth data, set hydrated ngay
      if (storedToken || storedAuth) {
        setHydrated()
      } else {
        // Nếu không có, đợi một chút để persist middleware có thời gian rehydrate
        const timer = setTimeout(() => {
          setHydrated()
        }, 50)
        return () => clearTimeout(timer)
      }
    }
  }, [isHydrated, setHydrated, token])

  return <>{children}</>
}

