"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { useAuthStore } from "@/store/auth-store"
import { useRequireAuth } from "@/hooks/use-require-auth"
import { useContactStore } from "@/store/contact-store"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { updateContactSchema, type UpdateContactInput } from "@/lib/validations/contact"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, Upload, User, X } from "lucide-react"
import { toast } from "@/hooks/use-toast"

export default function EditContactPage() {
  const router = useRouter()
  const params = useParams()
  const { isAuthenticated, isHydrated } = useRequireAuth()
  const { fetchContactById, currentContact, updateContact, error, clearError } = useContactStore()
  const [isLoading, setIsLoading] = useState(false)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const contactId = parseInt(params.id as string)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<UpdateContactInput>({
    resolver: zodResolver(updateContactSchema),
  })

  const isEmergency = watch("is_emergency")

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setAvatarFile(file)
      setAvatarPreview(URL.createObjectURL(file))
    }
  }

  const handleRemoveAvatar = () => {
    setAvatarFile(null)
    if (currentContact?.avatar_url) {
      setAvatarPreview(currentContact.avatar_url)
    } else {
      setAvatarPreview(null)
    }
  }

  useEffect(() => {
    // Đợi hydration xong trước khi check auth
    if (!isHydrated) return

    if (isAuthenticated && contactId) {
      fetchContactById(contactId)
    }
  }, [isHydrated, isAuthenticated, router, contactId, fetchContactById])

  useEffect(() => {
    if (currentContact) {
      setValue("full_name", currentContact.full_name)
      setValue("phone", currentContact.phone)
      setValue("email", currentContact.email || "")
      setValue("relationship", currentContact.relationship || "")
      setValue("is_emergency", currentContact.is_emergency)
      if (currentContact.avatar_url) {
        setAvatarPreview(currentContact.avatar_url)
      }
    }
  }, [currentContact, setValue])

  const onSubmit = async (data: UpdateContactInput) => {
    setIsLoading(true)
    clearError()
    try {
      await updateContact(contactId, data, avatarFile)
      toast.success("Cập nhật liên hệ thành công")
      router.push("/contacts")
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Cập nhật liên hệ thất bại")
    } finally {
      setIsLoading(false)
    }
  }

  if (!isHydrated) {
    return (
      <div className="container mx-auto px-4 py-6 sm:py-8 max-w-2xl">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Đang tải...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated || !currentContact) {
    return (
      <div className="container mx-auto px-4 py-6 sm:py-8 max-w-2xl">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Đang tải...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8 max-w-2xl">
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Quay lại
      </Button>

      <article className="animate-fade-in-up">
        {/* Header Section */}
        <header className="mb-8 sm:mb-10 pb-6 sm:pb-8 border-b border-border">
          <h1 className="mb-3 sm:mb-4 text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight tracking-tight text-foreground">
            Chỉnh sửa liên hệ
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
            Cập nhật thông tin người thân hoặc liên hệ khẩn cấp
          </p>
        </header>

        {/* Form Section */}
        <div className="bg-card rounded-xl border shadow-sm">
          <div className="p-6 sm:p-8 lg:p-10">
            <div className="mb-6 sm:mb-8">
              <h2 className="text-lg sm:text-xl font-semibold mb-2 text-foreground">Thông tin liên hệ</h2>
              <p className="text-sm sm:text-base text-muted-foreground">
                Cập nhật thông tin người thân hoặc liên hệ khẩn cấp
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 sm:space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

              <div className="space-y-2">
                <Label htmlFor="full_name" className="text-sm font-medium">Họ tên *</Label>
                <Input
                  id="full_name"
                  placeholder="Nguyễn Văn A"
                  className="h-11"
                  {...register("full_name")}
                />
                {errors.full_name && (
                  <p className="text-sm text-destructive mt-1">{errors.full_name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium">Số điện thoại *</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="0901234567"
                  className="h-11"
                  {...register("phone")}
                />
                {errors.phone && (
                  <p className="text-sm text-destructive mt-1">{errors.phone.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">Email (tùy chọn)</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@example.com"
                  className="h-11"
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-sm text-destructive mt-1">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="relationship" className="text-sm font-medium">Mối quan hệ (tùy chọn)</Label>
                <Input
                  id="relationship"
                  placeholder="Bố, Mẹ, Anh, Chị..."
                  className="h-11"
                  {...register("relationship")}
                />
                {errors.relationship && (
                  <p className="text-sm text-destructive mt-1">{errors.relationship.message}</p>
                )}
              </div>

              {/* Avatar Upload */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Ảnh đại diện (tùy chọn)</Label>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    {avatarPreview ? (
                      <div className="relative">
                        <img
                          src={avatarPreview}
                          alt="Avatar preview"
                          className="h-20 w-20 rounded-full object-cover border-2 border-border"
                        />
                        <button
                          type="button"
                          onClick={handleRemoveAvatar}
                          className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center hover:bg-destructive/90 transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center border-2 border-border">
                        <User className="h-10 w-10 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <label
                      htmlFor="avatar"
                      className="flex items-center justify-center gap-2 px-4 py-2 border border-border rounded-lg cursor-pointer hover:bg-muted transition-colors text-sm font-medium"
                    >
                      <Upload className="h-4 w-4" />
                      {avatarFile ? "Đổi ảnh" : avatarPreview ? "Đổi ảnh" : "Chọn ảnh"}
                    </label>
                    <input
                      id="avatar"
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      JPG, PNG hoặc GIF. Tối đa 5MB
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-start space-x-3 pt-2">
                <Checkbox
                  id="is_emergency"
                  checked={isEmergency}
                  onCheckedChange={(checked) => setValue("is_emergency", checked === true)}
                  className="mt-1"
                />
                <div className="space-y-1">
                  <Label htmlFor="is_emergency" className="text-sm font-medium cursor-pointer">
                    Đánh dấu là liên hệ khẩn cấp
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Liên hệ khẩn cấp sẽ được ưu tiên thông báo khi có cảnh báo lũ lụt
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-border">
                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="flex-1 sm:flex-none min-w-[140px]"
                >
                  {isLoading ? "Đang lưu..." : "Lưu thay đổi"}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => router.back()}
                  className="flex-1 sm:flex-none"
                >
                  Hủy
                </Button>
              </div>
            </form>
          </div>
        </div>
      </article>
    </div>
  )
}

