"use client"

import { useEffect, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/store/auth-store"
import { useRequireAuth } from "@/hooks/use-require-auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { User, Mail, Phone, MapPin, Camera, Shield } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import apiClient from "@/lib/api-client"
import { User as UserType } from "@/lib/types"
import { useState } from "react"
import { toast } from "@/hooks/use-toast"

export default function ProfilePage() {
  const router = useRouter()
  const { user, isAuthenticated, isHydrated } = useRequireAuth()
  const { updateUser } = useAuthStore()
  const [profile, setProfile] = useState<UserType | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const hasFetched = useRef(false) // Track if we've already fetched

  const fetchProfile = useCallback(async () => {
    if (isLoading || hasFetched.current) return // Prevent concurrent calls and multiple fetches
    
    setIsLoading(true)
    hasFetched.current = true
    try {
      const response = await apiClient.get("/user/profile")
      if (response.data.success && response.data.data) {
        const profileData = response.data.data
        setProfile(profileData)
        // Cập nhật user trong store
        updateUser(profileData)
        // Set avatar preview
        if (profileData.avatar_url) {
          setAvatarPreview(profileData.avatar_url)
        } else {
          setAvatarPreview(null)
        }
      }
    } catch (error: any) {
      console.error("Failed to fetch profile:", error)
      toast.error(error?.response?.data?.message || "Không thể tải thông tin profile")
      hasFetched.current = false // Reset on error so we can retry
    } finally {
      setIsLoading(false)
    }
  }, [isLoading, updateUser])

  useEffect(() => {
    // Đợi hydration xong trước khi check auth
    if (!isHydrated) return

    // Redirect admin đến trang admin
    if (user?.role === "admin") {
      router.push("/admin")
      return
    }

    // Chỉ fetch một lần khi mount và authenticated
    if (isAuthenticated && !hasFetched.current && !profile) {
      fetchProfile()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHydrated, isAuthenticated, user?.role])

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Hiển thị preview ngay
    const reader = new FileReader()
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string)
    }
    reader.readAsDataURL(file)

    // Tự động upload avatar
    setIsSaving(true)
    try {
      const formData = new FormData()
      formData.append("avatar", file)
      // Gửi kèm các field khác để không mất dữ liệu
      if (profile) {
        if (profile.full_name) formData.append("full_name", profile.full_name)
        if (profile.phone) formData.append("phone", profile.phone)
        if (profile.address) formData.append("address", profile.address)
      }

      const response = await apiClient.put("/user/profile", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      if (response.data.success && response.data.data) {
        const updatedProfile = response.data.data
        updateUser(updatedProfile)
        setProfile(updatedProfile)
        if (updatedProfile.avatar_url) {
          setAvatarPreview(updatedProfile.avatar_url)
        }
        // Reset file input
        e.target.value = ""
      }
    } catch (error: any) {
      console.error("Failed to upload avatar:", error)
      toast.error(error?.response?.data?.message || "Không thể cập nhật avatar")
      // Revert preview nếu lỗi
      if (profile?.avatar_url) {
        setAvatarPreview(profile.avatar_url)
      } else {
        setAvatarPreview(null)
      }
    } finally {
      setIsSaving(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!profile) return

    setIsSaving(true)
    try {
      const formData = new FormData()
      formData.append("full_name", profile.full_name)
      if (profile.phone) formData.append("phone", profile.phone)
      if (profile.address) formData.append("address", profile.address)

      const response = await apiClient.put("/user/profile", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      if (response.data.success && response.data.data) {
        const updatedProfile = response.data.data
        updateUser(updatedProfile)
        setProfile(updatedProfile)
        if (updatedProfile.avatar_url) {
          setAvatarPreview(updatedProfile.avatar_url)
        }
        toast.success("Cập nhật profile thành công!")
      }
    } catch (error: any) {
      console.error("Failed to update profile:", error)
      toast.error(error?.response?.data?.message || "Không thể cập nhật profile")
    } finally {
      setIsSaving(false)
    }
  }

  if (!isAuthenticated || isLoading || !profile) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center justify-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">Thông tin cá nhân</h1>
        <p className="text-muted-foreground text-lg">
          Quản lý thông tin tài khoản của bạn
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Avatar Section */}
        <Card className="border-2">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 relative">
              <div className="relative h-32 w-32 mx-auto">
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="Avatar"
                    className="h-32 w-32 rounded-full object-cover border-4 border-primary"
                  />
                ) : (
                  <div className="flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white text-4xl font-bold border-4 border-primary">
                    {profile.full_name.charAt(0).toUpperCase()}
                  </div>
                )}
                <label
                  htmlFor="avatar-upload"
                  className="absolute bottom-0 right-0 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-colors"
                >
                  <Camera className="h-5 w-5" />
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                </label>
              </div>
            </div>
            <CardTitle className="text-xl">{profile.full_name}</CardTitle>
            <CardDescription>{profile.email}</CardDescription>
            {profile.role === "admin" && (
              <Badge className="mt-2 bg-purple-500">
                <Shield className="mr-1 h-3 w-3" />
                Quản trị viên
              </Badge>
            )}
          </CardHeader>
        </Card>

        {/* Profile Form */}
        <Card className="md:col-span-2 border-2">
          <CardHeader>
            <CardTitle>Thông tin cơ bản</CardTitle>
            <CardDescription>
              Cập nhật thông tin cá nhân của bạn
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="flex items-center gap-3 rounded-lg border bg-muted px-3 py-2">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    disabled
                    className="border-0 bg-transparent p-0 focus-visible:ring-0"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Email không thể thay đổi
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="full_name">Họ tên *</Label>
                <div className="flex items-center gap-3 rounded-lg border px-3 py-2 focus-within:ring-2 focus-within:ring-primary">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <Input
                    id="full_name"
                    value={profile.full_name}
                    onChange={(e) =>
                      setProfile({ ...profile, full_name: e.target.value })
                    }
                    required
                    className="border-0 p-0 focus-visible:ring-0"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Số điện thoại</Label>
                <div className="flex items-center gap-3 rounded-lg border px-3 py-2 focus-within:ring-2 focus-within:ring-primary">
                  <Phone className="h-5 w-5 text-muted-foreground" />
                  <Input
                    id="phone"
                    type="tel"
                    value={profile.phone || ""}
                    onChange={(e) =>
                      setProfile({ ...profile, phone: e.target.value })
                    }
                    className="border-0 p-0 focus-visible:ring-0"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Địa chỉ</Label>
                <div className="flex items-center gap-3 rounded-lg border px-3 py-2 focus-within:ring-2 focus-within:ring-primary">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                  <Input
                    id="address"
                    value={profile.address || ""}
                    onChange={(e) =>
                      setProfile({ ...profile, address: e.target.value })
                    }
                    className="border-0 p-0 focus-visible:ring-0"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                >
                  {isSaving ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      Đang lưu...
                    </>
                  ) : (
                    "Lưu thay đổi"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/profile/password")}
                  className="flex-1"
                >
                  Đổi mật khẩu
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
