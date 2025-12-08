"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useAuthStore } from "@/store/auth-store"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Bell, LogOut, Menu, User, Shield, X, KeyRound, Users } from "lucide-react" // Đã thêm icon Users nếu cần dùng
import { useNotificationStore } from "@/store/notification-store"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { ThemeToggle } from "@/components/theme/theme-toggle"

export function Header() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, isAuthenticated, logout } = useAuthStore()
  const { unreadCount, fetchNotifications } = useNotificationStore()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated])

  const handleLogout = () => {
    logout()
    window.location.href = "/login"
  }

  // --- CẬP NHẬT: Thêm mục "Cộng đồng" vào danh sách ---
  const navItems = [
    { href: "/dashboard", label: "Trang chủ" },
    { href: "/alerts", label: "Cảnh báo" },
    { href: "/locations", label: "Địa điểm" },
    { href: "/community", label: "Cộng đồng" }, // <-- MỚI THÊM
    { href: "/contacts", label: "Người thân" },
    { href: "/articles", label: "Kiến thức" },
  ]

  // Don't show header on login/register pages and admin pages
  if (pathname === "/login" || pathname === "/register" || pathname?.startsWith("/admin")) {
    return null
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/90 shadow-sm transition-colors">
      <div className="container mx-auto px-4">
        <div className="flex h-18 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 text-white shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all duration-300">
              <span className="text-2xl">🌊</span>
            </div>
            <div className="hidden sm:block">
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 dark:from-blue-400 dark:to-blue-500 bg-clip-text text-transparent">
                Cảnh Báo Lũ Lụt
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          {isAuthenticated && (
            <nav className="hidden md:flex items-center gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300",
                    pathname === item.href
                      ? "bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-600 text-white shadow-md shadow-blue-500/30 dark:shadow-blue-500/50"
                      : "text-foreground hover:text-primary hover:bg-accent"
                  )}
                >
                  {item.label}
                </Link>
              ))}
              {user?.role === "admin" && (
                <Link
                  href="/admin"
                  className={cn(
                    "px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 flex items-center gap-2",
                    pathname?.startsWith("/admin")
                      ? "bg-gradient-to-r from-purple-600 to-purple-700 dark:from-purple-500 dark:to-purple-600 text-white shadow-md shadow-purple-500/30 dark:shadow-purple-500/50"
                      : "text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                  )}
                >
                  <Shield className="h-4 w-4" />
                  <span className="hidden lg:inline">Quản trị</span>
                </Link>
              )}
            </nav>
          )}

          {/* Right side actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />
            {isAuthenticated ? (
              <>
                <Link href="/notifications">
                  <Button variant="ghost" size="icon" className="relative h-10 w-10 rounded-xl hover:bg-accent transition-all">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-r from-red-500 to-red-600 text-xs text-white font-semibold shadow-lg animate-pulse">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    )}
                  </Button>
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-accent transition-all p-0 overflow-hidden">
                      {user?.avatar_url ? (
                        <img
                          src={user.avatar_url}
                          alt={user.full_name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-600 text-white text-sm font-semibold">
                          {user?.full_name?.charAt(0).toUpperCase() || <User className="h-5 w-5" />}
                        </div>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 bg-popover">
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user?.full_name}</p>
                        <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => router.push("/profile")} className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      <span>Hồ sơ</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push("/profile/password")} className="cursor-pointer">
                      <KeyRound className="mr-2 h-4 w-4" />
                      <span>Thay đổi mật khẩu</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Đăng xuất</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                {/* Mobile menu button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden h-10 w-10 rounded-xl hover:bg-accent transition-all"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                  {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </Button>
              </>
            ) : (
              <div className="flex items-center gap-2 sm:gap-3">
                <Link href="/login">
                  <Button variant="ghost" size="sm" className="h-10 px-4 rounded-xl hover:bg-accent transition-all">
                    Đăng nhập
                  </Button>
                </Link>
                <Link href="/register">
                  <Button 
                    size="sm" 
                    className="h-10 px-4 sm:px-5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-600 hover:from-blue-700 hover:to-blue-800 dark:hover:from-blue-600 dark:hover:to-blue-700 shadow-md hover:shadow-lg transition-all duration-300 text-white"
                  >
                    <span className="hidden sm:inline">Đăng ký</span>
                    <span className="sm:hidden">ĐK</span>
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && isAuthenticated && (
          <nav className="md:hidden py-4 border-t animate-fade-in bg-background/95 backdrop-blur-md">
            <div className="flex flex-col gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300",
                    pathname === item.href
                      ? "bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-600 text-white shadow-md"
                      : "text-foreground hover:text-primary hover:bg-accent"
                  )}
                >
                  {item.label}
                </Link>
              ))}
              {user?.role === "admin" && (
                <Link
                  href="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 flex items-center gap-2",
                    pathname?.startsWith("/admin")
                      ? "bg-gradient-to-r from-purple-600 to-purple-700 dark:from-purple-500 dark:to-purple-600 text-white shadow-md"
                      : "text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                  )}
                >
                  <Shield className="h-4 w-4" />
                  Quản trị
                </Link>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  )
}