"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/store/auth-store"

export function useRequireAuth(redirectTo: string = "/login") {
  const router = useRouter()
  const { user, isAuthenticated, isHydrated } = useAuthStore()

  useEffect(() => {
    // Đợi hydration xong trước khi check auth
    if (!isHydrated) return

    if (!isAuthenticated) {
      router.push(redirectTo)
      return
    }
  }, [isHydrated, isAuthenticated, router, redirectTo])

  return {
    isAuthenticated: isHydrated && isAuthenticated,
    user,
    isHydrated,
  }
}

