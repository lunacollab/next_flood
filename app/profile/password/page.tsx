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
import { toast } from "@/hooks/use-toast"

export default function ChangePasswordPage() {
  const router = useRouter()
  const { isAuthenticated, isHydrated } = useRequireAuth()
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
      const response = await apiClient.put("/user/password", data)
      if (response.data.success) {
        toast.success("Đổi mật khẩu thành công")
        setTimeout(() => {
          router.push("/profile")
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
      <div className="container mx-auto py-8 px-4 max-w-2xl">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Đang tải...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-2xl">
      <div className="mb-6 text-center">
        <button
          onClick={() => router.back()}
          className="text-sm text-muted-foreground hover:text-primary mb-4"
        >
          ← Quay lại
        </button>
        <h1 className="text-3xl font-bold mb-2">Đổi mật khẩu</h1>
        <p className="text-muted-foreground">
          Thay đổi mật khẩu tài khoản của bạn
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

            <div className="flex gap-2">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Đang xử lý..." : "Đổi mật khẩu"}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Hủy
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

