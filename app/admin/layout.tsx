"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/store/auth-store"
import { useRequireAuth } from "@/hooks/use-require-auth"
import { AdminSidebar } from "@/components/layout/admin-sidebar"
import { AdminHeader } from "@/components/layout/admin-header"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { user, isAuthenticated, isHydrated } = useRequireAuth()

  useEffect(() => {
    // Đợi hydration xong trước khi check auth
    if (!isHydrated) return

    if (user?.role !== "admin") {
      router.push("/dashboard")
      return
    }
  }, [isHydrated, isAuthenticated, user, router])

  if (!isHydrated) {
    return (
      <div className="flex min-h-screen">
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Đang tải...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated || user?.role !== "admin") {
    return null
  }

  return (
    <div className="flex min-h-screen flex-col">
      <AdminHeader />
      <div className="flex flex-1 overflow-hidden">
        <AdminSidebar />
        <main className="flex-1 overflow-auto min-w-0">{children}</main>
      </div>
    </div>
  )
}

