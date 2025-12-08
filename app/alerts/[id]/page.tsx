"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { useAuthStore } from "@/store/auth-store"
import { useRequireAuth } from "@/hooks/use-require-auth"
import { useAlertStore } from "@/store/alert-store"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ALERT_LEVELS } from "@/lib/constants"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle, MapPin, Clock, Droplet, CloudRain, Wind, Thermometer, Gauge, Phone, Home, ArrowLeft } from "lucide-react"
import { format } from "date-fns"
import { Alert as AlertType } from "@/lib/types"
import { FloodMap } from "@/components/map/flood-map"

export default function AlertDetailPage() {
  const router = useRouter()
  const params = useParams()
  const { isAuthenticated, isHydrated } = useRequireAuth()
  const { fetchAlertById, currentAlert, isLoading } = useAlertStore()
  const alertId = parseInt(params.id as string)

  useEffect(() => {
    // Đợi hydration xong trước khi check auth
    if (!isHydrated) return

    if (isAuthenticated && alertId) {
      fetchAlertById(alertId)
    }
  }, [isHydrated, isAuthenticated, router, alertId, fetchAlertById])

  if (!isHydrated || !isAuthenticated || isLoading || !currentAlert) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex items-center justify-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
        </div>
      </div>
    )
  }

  const levelConfig = ALERT_LEVELS[currentAlert.level]

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Quay lại
      </Button>

      <div className="mb-6">
        <div className="mb-4 flex items-center gap-2 flex-wrap">
          <Badge className={`${levelConfig.bgColor} ${levelConfig.textColor} border-0 text-base px-4 py-1 font-semibold`}>
            {levelConfig.label}
          </Badge>
          {currentAlert.location && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <MapPin className="h-5 w-5" />
              <span className="font-medium">{currentAlert.location.name}</span>
            </div>
          )}
        </div>
        <h1 className="mb-4 text-4xl font-bold">{currentAlert.title}</h1>
        <div className="flex items-center gap-4 text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {format(new Date(currentAlert.created_at), "dd/MM/yyyy HH:mm")}
          </div>
          {currentAlert.is_active && (
            <Badge variant="default" className="bg-green-500">Đang hoạt động</Badge>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-2">
            <CardHeader>
              <CardTitle>Mô tả chi tiết</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap leading-relaxed">{currentAlert.description}</p>
            </CardContent>
          </Card>

          {/* Weather Data */}
          {(currentAlert.water_level ||
            currentAlert.rainfall ||
            currentAlert.wind_speed ||
            currentAlert.temperature ||
            currentAlert.humidity) && (
            <Card className="border-2">
              <CardHeader>
                <CardTitle>Thông số thời tiết</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {currentAlert.water_level && (
                    <div className="flex items-center gap-3 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500 text-white">
                        <Droplet className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Mực nước</p>
                        <p className="text-xl font-bold">{currentAlert.water_level}m</p>
                      </div>
                    </div>
                  )}
                  {currentAlert.rainfall && (
                    <div className="flex items-center gap-3 p-4 rounded-lg bg-cyan-50 dark:bg-cyan-900/20">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-cyan-500 text-white">
                        <CloudRain className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Lượng mưa</p>
                        <p className="text-xl font-bold">{currentAlert.rainfall}mm</p>
                      </div>
                    </div>
                  )}
                  {currentAlert.wind_speed && (
                    <div className="flex items-center gap-3 p-4 rounded-lg bg-muted">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                        <Wind className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Tốc độ gió</p>
                        <p className="text-xl font-bold">{currentAlert.wind_speed} km/h</p>
                      </div>
                    </div>
                  )}
                  {currentAlert.temperature && (
                    <div className="flex items-center gap-3 p-4 rounded-lg bg-orange-50 dark:bg-orange-900/20">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-500 text-white">
                        <Thermometer className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Nhiệt độ</p>
                        <p className="text-xl font-bold">{currentAlert.temperature}°C</p>
                      </div>
                    </div>
                  )}
                  {currentAlert.humidity && (
                    <div className="flex items-center gap-3 p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-500 text-white">
                        <Gauge className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Độ ẩm</p>
                        <p className="text-xl font-bold">{currentAlert.humidity}%</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Forecast */}
          {currentAlert.forecast && (
            <Card className="border-2">
              <CardHeader>
                <CardTitle>Dự báo</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap leading-relaxed">{currentAlert.forecast}</p>
              </CardContent>
            </Card>
          )}

          {/* Safety Instructions */}
          {currentAlert.safety_instructions && (
            <Alert className={`${levelConfig.bgColor} border-2 ${levelConfig.borderColor}`}>
              <AlertTriangle className="h-5 w-5" />
              <AlertDescription>
                <h3 className="mb-2 font-semibold text-lg">⚠️ Lưu ý an toàn</h3>
                <p className="whitespace-pre-wrap leading-relaxed">{currentAlert.safety_instructions}</p>
              </AlertDescription>
            </Alert>
          )}

          {/* Map */}
          {currentAlert.location && (
            <Card className="border-2">
              <CardHeader>
                <CardTitle>Vị trí trên bản đồ</CardTitle>
              </CardHeader>
              <CardContent>
                <FloodMap
                  locations={[currentAlert.location]}
                  alerts={[currentAlert]}
                  center={[currentAlert.location.latitude, currentAlert.location.longitude]}
                  zoom={13}
                  height="400px"
                />
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Shelters */}
          {currentAlert.shelters && currentAlert.shelters.length > 0 && (
            <Card className="border-2 sticky top-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Home className="h-5 w-5" />
                  Điểm trú ẩn
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {currentAlert.shelters.map((shelter, index) => (
                    <div key={index} className="rounded-lg border p-4 bg-muted/50">
                      <h4 className="mb-1 font-semibold">{shelter.name}</h4>
                      <p className="mb-2 text-sm text-muted-foreground">{shelter.address}</p>
                      <p className="text-sm">
                        <span className="font-medium">Sức chứa:</span> {shelter.capacity} người
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Emergency Contacts */}
          {currentAlert.emergency_contacts && currentAlert.emergency_contacts.length > 0 && (
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Liên hệ khẩn cấp
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {currentAlert.emergency_contacts.map((contact, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between rounded-lg border p-3 bg-red-50 dark:bg-red-900/20"
                    >
                      <div>
                        <p className="font-semibold">{contact.name}</p>
                        <a
                          href={`tel:${contact.phone}`}
                          className="text-sm text-primary hover:underline"
                        >
                          {contact.phone}
                        </a>
                      </div>
                      <a
                        href={`tel:${contact.phone}`}
                        className="rounded-md bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600 transition-colors"
                      >
                        Gọi
                      </a>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
