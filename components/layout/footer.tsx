"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

export function Footer() {
  const pathname = usePathname()

  // Don't show footer on login/register pages and admin pages
  if (pathname === "/login" || pathname === "/register" || pathname?.startsWith("/admin")) {
    return null
  }

  return (
    <footer className="border-t bg-muted/50 mt-auto transition-colors">
      <div className="container mx-auto px-4 py-8 sm:py-12">
        <div className="grid gap-8 sm:gap-12 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                <span className="text-lg">🌊</span>
              </div>
              <span className="text-base sm:text-lg font-bold">Cảnh Báo Lũ Lụt</span>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Hệ thống cảnh báo lũ lụt thời gian thực, bảo vệ bạn và gia đình.
            </p>
          </div>

          <div>
            <h3 className="mb-4 font-semibold text-sm sm:text-base">Liên kết nhanh</h3>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <Link href="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
                  Trang chủ
                </Link>
              </li>
              <li>
                <Link href="/alerts" className="text-muted-foreground hover:text-foreground transition-colors">
                  Cảnh báo
                </Link>
              </li>
              <li>
                <Link href="/articles" className="text-muted-foreground hover:text-foreground transition-colors">
                  Kiến thức
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 font-semibold text-sm sm:text-base">Hỗ trợ</h3>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <Link href="/articles" className="text-muted-foreground hover:text-foreground transition-colors">
                  Hướng dẫn sử dụng
                </Link>
              </li>
              <li>
                <Link href="/articles" className="text-muted-foreground hover:text-foreground transition-colors">
                  Phòng chống lũ lụt
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 font-semibold text-sm sm:text-base">Liên hệ</h3>
            <ul className="space-y-2 text-xs sm:text-sm text-muted-foreground">
              <li>Email: support@flood-warning.vn</li>
              <li>Hotline: 1900-xxxx</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 sm:mt-12 border-t pt-6 sm:pt-8 text-center text-xs sm:text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Hệ thống cảnh báo lũ lụt. Tất cả quyền được bảo lưu.</p>
        </div>
      </div>
    </footer>
  )
}
