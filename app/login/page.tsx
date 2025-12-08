import { LoginForm } from "@/components/auth/login-form"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Home } from "lucide-react"

export default function LoginPage() {
  return (
    <div className="w-full max-w-md mx-auto px-4 relative z-10 animate-fade-in-up">
      {/* Back to home button */}
      <div className="mb-6">
        <Link href="/">
          <Button
            variant="ghost"
            size="sm"
            className="text-foreground hover:text-primary hover:bg-accent transition-all"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            <Home className="mr-2 h-4 w-4" />
            Trở về trang chủ
          </Button>
        </Link>
      </div>

      <div className="mb-8 text-center">
        <Link href="/" className="inline-flex items-center gap-3 mb-6 group">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-2xl group-hover:shadow-blue-500/50 group-hover:scale-105 transition-all duration-300">
            <span className="text-3xl">🌊</span>
          </div>
          <div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 dark:from-blue-400 dark:to-blue-500 bg-clip-text text-transparent">
              Cảnh Báo Lũ Lụt
            </span>
          </div>
        </Link>
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Chào mừng trở lại
        </h1>
        <p className="text-muted-foreground">
          Đăng nhập để tiếp tục sử dụng dịch vụ
        </p>
      </div>
      <LoginForm />
    </div>
  )
}
