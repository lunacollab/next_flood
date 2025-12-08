"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Users,
  AlertTriangle,
  MapPin,
  BookOpen,
  BarChart3,
  LifeBuoy,
} from "lucide-react"

// Định nghĩa thêm thuộc tính 'variant' để tùy biến style
const adminMenuItems = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Người dùng",
    href: "/admin/users",
    icon: Users,
  },
  {
    title: "Cảnh báo",
    href: "/admin/alerts",
    icon: AlertTriangle,
  },
  {
    title: "Địa điểm",
    href: "/admin/locations",
    icon: MapPin,
  },
  {
    title: "Bài viết",
    href: "/admin/articles",
    icon: BookOpen,
  },
  {
    title: "Thống kê",
    href: "/admin/statistics",
    icon: BarChart3,
  },
  // --- [ĐÃ CHUYỂN XUỐNG CUỐI] ---
  {
    title: "Cứu trợ (SOS)",
    href: "/rescue",
    icon: LifeBuoy,
    variant: "destructive", // Đánh dấu là mục đặc biệt
  },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden md:block w-64 border-r bg-background p-4 h-full overflow-y-auto">
      <nav className="space-y-2 flex flex-col h-full">
        {/* Render các item bình thường */}
        <div className="space-y-2">
          {adminMenuItems.map((item, index) => {
            // @ts-ignore
            if (item.variant === "destructive") return null; // Bỏ qua item SOS ở vòng lặp này

            const Icon = item.icon
            const isActive = pathname === item.href || (item.href !== "/admin" && pathname?.startsWith(item.href))
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <Icon className="h-5 w-5" />
                {item.title}
              </Link>
            )
          })}
        </div>

        {/* Render mục SOS ở dưới cùng, tách biệt hẳn */}
        <div className="mt-auto pt-4 border-t">
          {adminMenuItems.filter(item => (item as any).variant === "destructive").map((item) => {
             const Icon = item.icon
             const isActive = pathname === item.href || pathname?.startsWith(item.href)

             return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-bold transition-all duration-300 group",
                  // Style đặc biệt cho mục SOS
                  isActive
                    ? "bg-red-600 text-white shadow-lg shadow-red-200 dark:shadow-none scale-105" // Khi đang chọn
                    : "bg-red-50 text-red-600 border-2 border-red-100 hover:bg-red-100 hover:border-red-300 hover:text-red-700 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900" // Khi bình thường
                )}
              >
                <Icon className={cn("h-5 w-5", !isActive && "animate-pulse")} /> {/* Icon nhấp nháy khi chưa chọn để gây chú ý */}
                {item.title}
              </Link>
             )
          })}
        </div>
      </nav>
    </aside>
  )
}

export function AdminSidebarContent() {
  const pathname = usePathname()

  return (
    <nav className="space-y-2 p-4 bg-background h-full flex flex-col">
       <div className="space-y-2">
        {adminMenuItems.map((item) => {
          // @ts-ignore
          if (item.variant === "destructive") return null;

          const Icon = item.icon
          const isActive = pathname === item.href || (item.href !== "/admin" && pathname?.startsWith(item.href))
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              {item.title}
            </Link>
          )
        })}
      </div>

      {/* Mục SOS trong Mobile Menu */}
      <div className="mt-4 pt-4 border-t">
          {adminMenuItems.filter(item => (item as any).variant === "destructive").map((item) => {
             const Icon = item.icon
             const isActive = pathname === item.href || pathname?.startsWith(item.href)

             return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-bold transition-all",
                  isActive
                    ? "bg-red-600 text-white"
                    : "bg-red-50 text-red-600 border border-red-200"
                )}
              >
                <Icon className="h-5 w-5" />
                {item.title}
              </Link>
             )
          })}
      </div>
    </nav>
  )
}