"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { useAdminStore } from "@/store/admin-store"
import { useLocationStore } from "@/store/location-store"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { updateAlertSchema, type UpdateAlertInput } from "@/lib/validations/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import apiClient from "@/lib/api-client"
import { Alert as AlertType } from "@/lib/types"
import { toast } from "@/hooks/use-toast"

export default function EditAlertPage() {
  const router = useRouter()
  const params = useParams()
  const { updateAlert, error, clearError } = useAdminStore()
  const { locations, fetchLocations } = useLocationStore()
  const [isLoading, setIsLoading] = useState(false)
  const [alert, setAlert] = useState<AlertType | null>(null)
  const alertId = parseInt(params.id as string)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<UpdateAlertInput>({
    resolver: zodResolver(updateAlertSchema),
  })

  useEffect(() => {
    fetchLocations()
    fetchAlert()
  }, [fetchLocations])

  const fetchAlert = async () => {
    try {
      const response = await apiClient.get(`/admin/alerts/${alertId}`)
      if (response.data.success && response.data.data) {
        const alertData = response.data.data
        setAlert(alertData)
        setValue("level", alertData.level)
        setValue("title", alertData.title)
        setValue("description", alertData.description)
        if (alertData.water_level) setValue("water_level", alertData.water_level)
        if (alertData.rainfall) setValue("rainfall", alertData.rainfall)
        if (alertData.wind_speed) setValue("wind_speed", alertData.wind_speed)
        if (alertData.temperature) setValue("temperature", alertData.temperature)
        if (alertData.humidity) setValue("humidity", alertData.humidity)
        if (alertData.forecast) setValue("forecast", alertData.forecast)
        if (alertData.safety_instructions) setValue("safety_instructions", alertData.safety_instructions)
        setValue("is_active", alertData.is_active)
      }
    } catch (error: any) {
      console.error("Failed to fetch alert:", error)
      toast.error(error?.response?.data?.message || "Không thể tải thông tin cảnh báo")
    }
  }

  const onSubmit = async (data: UpdateAlertInput) => {
    setIsLoading(true)
    clearError()
    try {
      await updateAlert(alertId, data)
      toast.success("Cập nhật cảnh báo thành công")
      router.push("/admin/alerts")
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Cập nhật cảnh báo thất bại")
    } finally {
      setIsLoading(false)
    }
  }

  if (!alert) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 flex justify-center">
        <div className="w-full max-w-6xl">
          <p className="text-sm sm:text-base text-muted-foreground">Đang tải...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 flex justify-center">
      <div className="w-full max-w-6xl">
        <div className="mb-4 sm:mb-6">
          <button
            onClick={() => router.back()}
            className="text-xs sm:text-sm text-muted-foreground hover:text-primary mb-3 sm:mb-4"
          >
            ← Quay lại
          </button>
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Chỉnh sửa cảnh báo</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Cập nhật thông tin cảnh báo
          </p>
        </div>

      <Card>
        <CardHeader>
          <CardTitle>Thông tin cảnh báo</CardTitle>
          <CardDescription>
            Cập nhật thông tin chi tiết về cảnh báo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="level">Mức độ cảnh báo *</Label>
              <Select
                defaultValue={alert.level}
                onValueChange={(value) => setValue("level", value as any)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="info">Thông tin</SelectItem>
                  <SelectItem value="warning">Cảnh báo</SelectItem>
                  <SelectItem value="danger">Nguy hiểm</SelectItem>
                  <SelectItem value="critical">Rất nguy hiểm</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Tiêu đề *</Label>
              <Input
                id="title"
                {...register("title")}
              />
              {errors.title && (
                <p className="text-sm text-destructive">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Mô tả *</Label>
              <textarea
                id="description"
                className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                {...register("description")}
              />
              {errors.description && (
                <p className="text-sm text-destructive">{errors.description.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="water_level">Mực nước (m)</Label>
                <Input
                  id="water_level"
                  type="number"
                  step="0.1"
                  {...register("water_level", { valueAsNumber: true })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="rainfall">Lượng mưa (mm)</Label>
                <Input
                  id="rainfall"
                  type="number"
                  step="0.1"
                  {...register("rainfall", { valueAsNumber: true })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="wind_speed">Tốc độ gió (km/h)</Label>
                <Input
                  id="wind_speed"
                  type="number"
                  step="0.1"
                  {...register("wind_speed", { valueAsNumber: true })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="temperature">Nhiệt độ (°C)</Label>
                <Input
                  id="temperature"
                  type="number"
                  step="0.1"
                  {...register("temperature", { valueAsNumber: true })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="humidity">Độ ẩm (%)</Label>
                <Input
                  id="humidity"
                  type="number"
                  min="0"
                  max="100"
                  {...register("humidity", { valueAsNumber: true })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="forecast">Dự báo</Label>
              <textarea
                id="forecast"
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                {...register("forecast")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="safety_instructions">Lưu ý an toàn</Label>
              <textarea
                id="safety_instructions"
                className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                {...register("safety_instructions")}
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_active"
                checked={watch("is_active") ?? alert.is_active}
                onChange={(e) => setValue("is_active", e.target.checked)}
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="is_active" className="cursor-pointer">
                Đang hoạt động
              </Label>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
                {isLoading ? "Đang lưu..." : "Lưu thay đổi"}
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

