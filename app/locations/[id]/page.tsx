"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { useRequireAuth } from "@/hooks/use-require-auth"
import { useLocationStore } from "@/store/location-store"
import { useAlertStore } from "@/store/alert-store"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ALERT_LEVELS } from "@/lib/constants"
import { MapPin, ArrowLeft, Plus, X, Clock, AlertTriangle, Check } from "lucide-react"
import { format } from "date-fns"
import { FloodMap } from "@/components/map/flood-map"
import Link from "next/link"

export default function LocationDetailPage() {
  const router = useRouter()
  const params = useParams()
  const { isAuthenticated, isHydrated, user } = useRequireAuth()
  const { fetchLocationById, currentLocation, subscribeLocation, unsubscribeLocation, userLocations, fetchUserLocations, isLoading } = useLocationStore()
  const { fetchAlertsByLocation, alerts, isLoading: alertsLoading } = useAlertStore()
  const locationId = parseInt(params.id as string)
  const [subscribing, setSubscribing] = useState(false)
  const [unsubscribing, setUnsubscribing] = useState(false)

  useEffect(() => {
    // Đợi hydration xong trước khi check auth
    if (!isHydrated) return

    // Redirect admin đến trang admin
    if (user?.role === "admin") {
      router.push("/admin")
      return
    }

    if (isAuthenticated && locationId) {
      fetchLocationById(locationId)
      fetchAlertsByLocation(locationId)
      fetchUserLocations()
    }
  }, [isHydrated, isAuthenticated, user, router, locationId, fetchLocationById, fetchAlertsByLocation, fetchUserLocations])

  const isSubscribed = () => {
    return userLocations.some((ul) => ul.location_id === locationId)
  }

  const getUserLocationId = () => {
    const userLocation = userLocations.find((ul) => ul.location_id === locationId)
    return userLocation?.id
  }

  const handleSubscribe = async () => {
    if (subscribing) return // Prevent double click
    
    setSubscribing(true)
    try {
      await subscribeLocation(locationId, 1)
      // Refresh user locations để update state
      await fetchUserLocations()
    } catch (error: any) {
      console.error("Subscribe error:", error)
      // Error handled in store, nhưng vẫn refresh để đảm bảo state đúng
      await fetchUserLocations()
    } finally {
      setSubscribing(false)
    }
  }

  const handleUnsubscribe = async () => {
    if (unsubscribing) return // Prevent double click
    
    const userLocationId = getUserLocationId()
    if (!userLocationId) {
      console.warn("UserLocationId not found")
      return
    }

    setUnsubscribing(true)
    try {
      await unsubscribeLocation(userLocationId)
      // Refresh user locations để update state
      await fetchUserLocations()
    } catch (error: any) {
      console.error("Unsubscribe error:", error)
      // Error handled in store, nhưng vẫn refresh để đảm bảo state đúng
      await fetchUserLocations()
    } finally {
      setUnsubscribing(false)
    }
  }

  if (!isHydrated) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex items-center justify-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
        </div>
      </div>
    )
  }

  if (!isAuthenticated || user?.role === "admin") {
    return null
  }

  if (isLoading || !currentLocation) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex items-center justify-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
        </div>
      </div>
    )
  }

  const subscribed = isSubscribed()

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

      {/* Header */}
      <div className="mb-8">
        <div className="mb-4 flex items-start justify-between gap-4 flex-wrap">
          <div className="flex-1">
            <div className="mb-2 flex items-center gap-2">
              <MapPin className="h-6 w-6 text-blue-500" />
              <h1 className="text-3xl font-bold">{currentLocation.name}</h1>
            </div>
            <div className="mb-4 text-muted-foreground">
              <div className="flex items-center gap-1 flex-wrap">
                {currentLocation.province}
                {currentLocation.district && `, ${currentLocation.district}`}
                {currentLocation.ward && `, ${currentLocation.ward}`}
              </div>
            </div>
          </div>
          <div>
            {subscribed ? (
              <Button
                variant="outline"
                onClick={handleUnsubscribe}
                disabled={unsubscribing}
                className="border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20 dark:hover:text-red-300"
              >
                {unsubscribing ? (
                  "Đang hủy..."
                ) : (
                  <>
                    <X className="mr-2 h-4 w-4" />
                    Bỏ theo dõi
                  </>
                )}
              </Button>
            ) : (
              <Button
                onClick={handleSubscribe}
                disabled={subscribing}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
              >
                {subscribing ? (
                  "Đang thêm..."
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Theo dõi
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

        {currentLocation.is_monitoring && (
          <Badge variant="secondary" className="flex items-center gap-1 w-fit bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
            <Check className="h-3 w-3" />
            Đang theo dõi
          </Badge>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          {currentLocation.description && (
            <Card className="border-2">
              <CardHeader>
                <CardTitle>Mô tả</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap leading-relaxed">{currentLocation.description}</p>
              </CardContent>
            </Card>
          )}

          {/* Map */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle>Vị trí trên bản đồ</CardTitle>
              <CardDescription>
                Tọa độ: {currentLocation.latitude.toFixed(6)}, {currentLocation.longitude.toFixed(6)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] w-full rounded-lg overflow-hidden">
                <FloodMap
                  center={[currentLocation.latitude, currentLocation.longitude]}
                  zoom={13}
                  locations={[currentLocation]}
                  showAlerts={false}
                />
              </div>
            </CardContent>
          </Card>

          {/* Alerts */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Cảnh báo tại địa điểm này
              </CardTitle>
              <CardDescription>
                {alerts.length > 0 ? `${alerts.length} cảnh báo` : "Chưa có cảnh báo nào"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {alertsLoading ? (
                <div className="text-center py-8">
                  <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-current border-r-transparent"></div>
                </div>
              ) : alerts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <AlertTriangle className="mx-auto mb-2 h-8 w-8 opacity-50" />
                  <p>Chưa có cảnh báo nào tại địa điểm này</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {alerts.map((alert) => {
                    const levelConfig = ALERT_LEVELS[alert.level]
                    return (
                      <Link
                        key={alert.id}
                        href={`/alerts/${alert.id}`}
                        className="block"
                      >
                        <Card className="card-hover border-2 transition-all hover:shadow-md">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <div className="mb-2 flex items-center gap-2 flex-wrap">
                                  <Badge className={`${levelConfig.bgColor} ${levelConfig.textColor} border-0`}>
                                    {levelConfig.label}
                                  </Badge>
                                  {alert.is_active && (
                                    <Badge variant="default" className="bg-green-500">
                                      Đang hoạt động
                                    </Badge>
                                  )}
                                </div>
                                <h3 className="mb-1 font-semibold text-lg">{alert.title}</h3>
                                <p className="mb-2 line-clamp-2 text-sm text-muted-foreground">
                                  {alert.description}
                                </p>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <Clock className="h-3 w-3" />
                                  {format(new Date(alert.created_at), "dd/MM/yyyy HH:mm")}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Location Info */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle>Thông tin địa điểm</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="mb-1 text-sm font-medium text-muted-foreground">Tỉnh/Thành phố</div>
                <div className="text-base">{currentLocation.province}</div>
              </div>
              {currentLocation.district && (
                <div>
                  <div className="mb-1 text-sm font-medium text-muted-foreground">Quận/Huyện</div>
                  <div className="text-base">{currentLocation.district}</div>
                </div>
              )}
              {currentLocation.ward && (
                <div>
                  <div className="mb-1 text-sm font-medium text-muted-foreground">Phường/Xã</div>
                  <div className="text-base">{currentLocation.ward}</div>
                </div>
              )}
              <div>
                <div className="mb-1 text-sm font-medium text-muted-foreground">Vĩ độ</div>
                <div className="text-base font-mono">{currentLocation.latitude.toFixed(6)}</div>
              </div>
              <div>
                <div className="mb-1 text-sm font-medium text-muted-foreground">Kinh độ</div>
                <div className="text-base font-mono">{currentLocation.longitude.toFixed(6)}</div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle>Thao tác nhanh</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => router.push("/locations")}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Xem tất cả địa điểm
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => router.push("/alerts")}
              >
                <AlertTriangle className="mr-2 h-4 w-4" />
                Xem tất cả cảnh báo
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

