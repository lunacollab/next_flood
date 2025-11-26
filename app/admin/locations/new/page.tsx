"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAdminStore } from "@/store/admin-store"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { createLocationSchema, type CreateLocationInput } from "@/lib/validations/admin-location"
import { Checkbox } from "@/components/ui/checkbox"
import { LocationPickerMap } from "@/components/map/location-picker-map"
import { toast } from "@/hooks/use-toast"

export default function NewLocationPage() {
  const router = useRouter()
  const { createLocation, error, clearError } = useAdminStore()
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<CreateLocationInput>({
    resolver: zodResolver(createLocationSchema),
    defaultValues: {
      is_monitoring: true,
      latitude: 16.0544,
      longitude: 108.2022,
    },
  })

  const isMonitoring = watch("is_monitoring")
  const latitude = watch("latitude")
  const longitude = watch("longitude")
  const [selectedPosition, setSelectedPosition] = useState<[number, number] | null>(null)

  useEffect(() => {
    if (latitude && longitude) {
      setSelectedPosition([latitude, longitude])
    }
  }, [latitude, longitude])

  const handleMapClick = (lat: number, lng: number) => {
    // Làm tròn về 6 số thập phân để phù hợp với step="0.000001"
    const roundedLat = Math.round(lat * 1000000) / 1000000
    const roundedLng = Math.round(lng * 1000000) / 1000000
    setValue("latitude", roundedLat, { shouldValidate: true })
    setValue("longitude", roundedLng, { shouldValidate: true })
    setSelectedPosition([roundedLat, roundedLng])
  }

  const onSubmit = async (data: any) => {
    const formData: CreateLocationInput = {
      ...data,
      is_monitoring: data.is_monitoring ?? true,
    }
    setIsLoading(true)
    clearError()
    try {
      await createLocation(formData)
      toast.success("Tạo địa điểm thành công")
      router.push("/admin/locations")
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Tạo địa điểm thất bại")
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
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Thêm địa điểm mới</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Thêm địa điểm mới vào hệ thống
          </p>
        </div>

      <Card>
        <CardHeader>
          <CardTitle>Thông tin địa điểm</CardTitle>
          <CardDescription>
            Điền thông tin chi tiết về địa điểm
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
              <Label htmlFor="name">Tên địa điểm *</Label>
              <Input
                id="name"
                placeholder="Sông Hàn - Khu vực Cầu Rồng"
                {...register("name")}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="province">Tỉnh/Thành phố *</Label>
                <Input
                  id="province"
                  placeholder="Đà Nẵng"
                  {...register("province")}
                />
                {errors.province && (
                  <p className="text-sm text-destructive">{errors.province.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="district">Quận/Huyện</Label>
                <Input
                  id="district"
                  placeholder="Hải Châu"
                  {...register("district")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ward">Phường/Xã</Label>
                <Input
                  id="ward"
                  placeholder="Hải Châu 1"
                  {...register("ward")}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Chọn vị trí trên bản đồ *</Label>
              <p className="text-sm text-muted-foreground mb-2">
                Click vào bản đồ để chọn vị trí, tọa độ sẽ tự động được điền vào
              </p>
              <LocationPickerMap
                center={selectedPosition || [16.0544, 108.2022]}
                zoom={11}
                height="400px"
                onLocationSelect={handleMapClick}
                selectedPosition={selectedPosition}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="latitude">Vĩ độ *</Label>
                <Input
                  id="latitude"
                  type="number"
                  step="0.000001"
                  placeholder="16.061224"
                  {...register("latitude", { valueAsNumber: true })}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value)
                    if (!isNaN(value)) {
                      const roundedValue = Math.round(value * 1000000) / 1000000
                      setValue("latitude", roundedValue, { shouldValidate: true })
                      if (longitude) {
                        setSelectedPosition([roundedValue, longitude])
                      }
                    }
                  }}
                />
                {errors.latitude && (
                  <p className="text-sm text-destructive">{errors.latitude.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="longitude">Kinh độ *</Label>
                <Input
                  id="longitude"
                  type="number"
                  step="0.000001"
                  placeholder="108.227755"
                  {...register("longitude", { valueAsNumber: true })}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value)
                    if (!isNaN(value)) {
                      const roundedValue = Math.round(value * 1000000) / 1000000
                      setValue("longitude", roundedValue, { shouldValidate: true })
                      if (latitude) {
                        setSelectedPosition([latitude, roundedValue])
                      }
                    }
                  }}
                />
                {errors.longitude && (
                  <p className="text-sm text-destructive">{errors.longitude.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Mô tả</Label>
              <textarea
                id="description"
                className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                placeholder="Mô tả về địa điểm..."
                {...register("description")}
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_monitoring"
                checked={isMonitoring}
                onChange={(e) => setValue("is_monitoring", e.target.checked)}
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="is_monitoring" className="cursor-pointer">
                Đang theo dõi
              </Label>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
                {isLoading ? "Đang tạo..." : "Tạo địa điểm"}
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

