"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/store/auth-store"
import { useRequireAuth } from "@/hooks/use-require-auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { changePasswordSchema, type ChangePasswordInput } from "@/lib/validations/auth"
import apiClient from "@/lib/api-client"
import { ArrowLeft } from "lucide-react"
import { toast } from "@/hooks/use-toast"

export default function AdminChangePasswordPage() {
  const router = useRouter()
  const { isAuthenticated, isHydrated, user } = useRequireAuth()
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
  })

  const onSubmit = async (data: ChangePasswordInput) => {
    setIsLoading(true)
    try {
      const response = await apiClient.put("/admin/profile/password", data)
      if (response.data.success) {
        toast.success("Đổi mật khẩu thành công")
        setTimeout(() => {
          router.push("/admin/profile")
        }, 1500)
      } else {
        toast.error(response.data.message || "Đổi mật khẩu thất bại")
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || "Đổi mật khẩu thất bại")
    } finally {
      setIsLoading(false)
    }
  }

  if (!isHydrated) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 flex justify-center">
        <div className="w-full max-w-6xl">
          <div className="text-center py-12">
            <p className="text-sm sm:text-base text-muted-foreground">Đang tải...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!isAuthenticated || user?.role !== "admin") {
    return null
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 flex justify-center">
      <div className="w-full max-w-6xl">
      <div className="mb-4 sm:mb-6 text-center">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-3 sm:mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Quay lại
        </Button>
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Đổi mật khẩu</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Thay đổi mật khẩu tài khoản quản trị viên
        </p>
      </div>

      <Card className="mx-auto">
        <CardHeader>
          <CardTitle>Thay đổi mật khẩu</CardTitle>
          <CardDescription>
            Nhập mật khẩu cũ và mật khẩu mới của bạn
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

            <div className="space-y-2">
              <Label htmlFor="old_password">Mật khẩu cũ *</Label>
              <Input
                id="old_password"
                type="password"
                placeholder="••••••••"
                {...register("old_password")}
              />
              {errors.old_password && (
                <p className="text-sm text-destructive">{errors.old_password.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="new_password">Mật khẩu mới *</Label>
              <Input
                id="new_password"
                type="password"
                placeholder="••••••••"
                {...register("new_password")}
              />
              {errors.new_password && (
                <p className="text-sm text-destructive">{errors.new_password.message}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Mật khẩu phải có ít nhất 6 ký tự
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <Button type="submit" disabled={isLoading} className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800">
                {isLoading ? "Đang xử lý..." : "Đổi mật khẩu"}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.back()} className="w-full sm:w-auto">
                Hủy
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      </div>
    </div>
  )
}

