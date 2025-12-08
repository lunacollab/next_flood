"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAdminStore } from "@/store/admin-store"
import { useLocationStore } from "@/store/location-store"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { createAlertSchema, type CreateAlertInput } from "@/lib/validations/alert"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "@/hooks/use-toast"

export default function NewAlertPage() {
  const router = useRouter()
  const { createAlert, error, clearError } = useAdminStore()
  const { locations, fetchLocations } = useLocationStore()
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<CreateAlertInput>({
    resolver: zodResolver(createAlertSchema),
    defaultValues: {
      level: "warning",
    },
  })

  useEffect(() => {
    fetchLocations()
  }, [fetchLocations])

  const onSubmit = async (data: CreateAlertInput) => {
    setIsLoading(true)
    clearError()
    try {
      await createAlert(data)
      toast.success("Tạo cảnh báo thành công")
      router.push("/admin/alerts")
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Tạo cảnh báo thất bại")
    } finally {
      setIsLoading(false)
    }
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
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Tạo cảnh báo mới</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Tạo cảnh báo lũ lụt mới cho hệ thống
          </p>
        </div>

      <Card>
        <CardHeader>
          <CardTitle>Thông tin cảnh báo</CardTitle>
          <CardDescription>
            Điền thông tin chi tiết về cảnh báo
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
              <Label htmlFor="location_id">Địa điểm *</Label>
              <Select
                onValueChange={(value) => setValue("location_id", parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn địa điểm" />
                </SelectTrigger>
                <SelectContent>
                  {locations.map((location) => (
                    <SelectItem key={location.id} value={location.id.toString()}>
                      {location.name} - {location.province}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.location_id && (
                <p className="text-sm text-destructive">{errors.location_id.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="level">Mức độ cảnh báo *</Label>
              <Select
                defaultValue="warning"
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
              {errors.level && (
                <p className="text-sm text-destructive">{errors.level.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Tiêu đề *</Label>
              <Input
                id="title"
                placeholder="Cảnh báo mực nước dâng cao"
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
                placeholder="Mô tả chi tiết về cảnh báo..."
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
                  placeholder="2.5"
                  {...register("water_level", { valueAsNumber: true })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="rainfall">Lượng mưa (mm)</Label>
                <Input
                  id="rainfall"
                  type="number"
                  step="0.1"
                  placeholder="150.0"
                  {...register("rainfall", { valueAsNumber: true })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="wind_speed">Tốc độ gió (km/h)</Label>
                <Input
                  id="wind_speed"
                  type="number"
                  step="0.1"
                  placeholder="20.0"
                  {...register("wind_speed", { valueAsNumber: true })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="temperature">Nhiệt độ (°C)</Label>
                <Input
                  id="temperature"
                  type="number"
                  step="0.1"
                  placeholder="28.5"
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
                  placeholder="85"
                  {...register("humidity", { valueAsNumber: true })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="forecast">Dự báo</Label>
              <textarea
                id="forecast"
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                placeholder="Dự báo thời tiết..."
                {...register("forecast")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="safety_instructions">Lưu ý an toàn</Label>
              <textarea
                id="safety_instructions"
                className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                placeholder="Hướng dẫn an toàn cho người dân..."
                {...register("safety_instructions")}
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
                {isLoading ? "Đang tạo..." : "Tạo cảnh báo"}
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

