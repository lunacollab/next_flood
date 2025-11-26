"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/store/auth-store"
import { useAlertStore } from "@/store/alert-store"
import { useLocationStore } from "@/store/location-store"
import { useRequireAuth } from "@/hooks/use-require-auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ALERT_LEVELS } from "@/lib/constants"
import { AlertTriangle, MapPin, Clock, ArrowRight, TrendingUp } from "lucide-react"
import { format } from "date-fns"
import Link from "next/link"
import { FloodMap } from "@/components/map/flood-map"

export default function DashboardPage() {
  const router = useRouter()
  const { user, isAuthenticated, isHydrated } = useRequireAuth()
  const { alerts, fetchUserAlerts, isLoading: alertsLoading } = useAlertStore()
  const { userLocations, fetchUserLocations, isLoading: locationsLoading } = useLocationStore()

  useEffect(() => {
    // Đợi hydration xong trước khi check auth
    if (!isHydrated) return

    // Redirect admin đến trang admin
    if (user?.role === "admin") {
      router.push("/admin")
      return
    }

    if (isAuthenticated) {
      fetchUserAlerts()
      fetchUserLocations()
    }
  }, [isHydrated, isAuthenticated, user, router, fetchUserAlerts, fetchUserLocations])

  // Hiển thị loading khi chưa hydrate xong
  if (!isHydrated) {
    return (
      <div className="container mx-auto px-4 py-6 sm:py-8 max-w-7xl">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Đang tải...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated || user?.role === "admin") {
    return null
  }

  const recentAlerts = alerts.slice(0, 5)
  const activeAlerts = alerts.filter((a) => a.is_active)
  const criticalAlerts = activeAlerts.filter((a) => a.level === "critical" || a.level === "danger")

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8 max-w-7xl space-y-6 sm:space-y-8">
      {/* Welcome Section */}
      <div className="rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 dark:from-blue-800 dark:to-blue-900 p-6 sm:p-8 text-white shadow-lg animate-fade-in-up">
        <h1 className="mb-2 text-2xl sm:text-3xl lg:text-4xl font-bold">
          Chào mừng, {user?.full_name}! 👋
        </h1>
        <p className="text-sm sm:text-base lg:text-lg text-blue-100">
          Dưới đây là tổng quan về các cảnh báo và địa điểm bạn đang theo dõi
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-3">
        <Card className="card-hover border-2 shadow-lg animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cảnh báo đang hoạt động</CardTitle>
            <AlertTriangle className="h-5 w-5 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold">{activeAlerts.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {criticalAlerts.length} cảnh báo nguy hiểm
            </p>
          </CardContent>
        </Card>

        <Card className="card-hover border-2 shadow-lg animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Địa điểm theo dõi</CardTitle>
            <MapPin className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold">{userLocations.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Đang theo dõi {userLocations.length} địa điểm
            </p>
          </CardContent>
        </Card>

        <Card className="card-hover border-2 shadow-lg animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cảnh báo mới</CardTitle>
            <TrendingUp className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold">{recentAlerts.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Trong 24 giờ qua
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Map Section */}
      {userLocations.length > 0 && (
        <Card className="border-2 shadow-lg animate-fade-in-up">
          <CardHeader>
            <CardTitle className="text-xl sm:text-2xl">Bản đồ cảnh báo</CardTitle>
            <CardDescription className="text-sm sm:text-base">
              Xem các địa điểm bạn đang theo dõi và cảnh báo trên bản đồ
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FloodMap
              locations={userLocations.map((ul) => ul.location).filter(Boolean) as any}
              alerts={alerts}
              height="400px"
            />
          </CardContent>
        </Card>
      )}

      {/* Recent Alerts */}
      <div>
        <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold">Cảnh báo mới nhất</h2>
            <p className="text-sm sm:text-base text-muted-foreground">
              Các cảnh báo cho các địa điểm bạn đang theo dõi
            </p>
          </div>
          <Link href="/alerts" className="w-full sm:w-auto">
            <Button variant="outline" className="w-full sm:w-auto">
              Xem tất cả
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>

        {alertsLoading ? (
          <Card className="border-2">
            <CardContent className="py-12 text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
              <p className="mt-4 text-muted-foreground">Đang tải...</p>
            </CardContent>
          </Card>
        ) : recentAlerts.length === 0 ? (
          <Card className="border-2 border-dashed">
            <CardContent className="py-12 text-center">
              <AlertTriangle className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <p className="mb-2 text-lg font-semibold">Không có cảnh báo nào</p>
              <p className="mb-4 text-sm sm:text-base text-muted-foreground">
                Hiện tại không có cảnh báo nào cho các địa điểm bạn theo dõi
              </p>
              <Link href="/locations">
                <Button>
                  <MapPin className="mr-2 h-4 w-4" />
                  Thêm địa điểm theo dõi
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2">
            {recentAlerts.map((alert, index) => {
              const levelConfig = ALERT_LEVELS[alert.level]
              return (
                <Link key={alert.id} href={`/alerts/${alert.id}`}>
                  <Card className="card-hover border-2 shadow-lg transition-all duration-300 animate-fade-in-up" style={{ animationDelay: `${0.1 * index}s` }}>
                    <CardHeader>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="mb-3 flex items-center gap-2 flex-wrap">
                            <Badge
                              className={`${levelConfig.bgColor} ${levelConfig.textColor} border-0 font-semibold text-xs`}
                            >
                              {levelConfig.label}
                            </Badge>
                            {alert.location && (
                              <div className="flex items-center gap-1 text-xs sm:text-sm text-muted-foreground">
                                <MapPin className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                                <span className="truncate">{alert.location.name}</span>
                              </div>
                            )}
                          </div>
                          <CardTitle className="mb-2 line-clamp-2 text-base sm:text-lg">{alert.title}</CardTitle>
                          <CardDescription className="line-clamp-2 text-sm">
                            {alert.description}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between text-xs sm:text-sm text-muted-foreground">
                        <div className="flex items-center gap-1 sm:gap-4">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                            {format(new Date(alert.created_at), "dd/MM/yyyy HH:mm")}
                          </div>
                          {alert.water_level && (
                            <span className="hidden sm:inline">💧 {alert.water_level}m</span>
                          )}
                        </div>
                        <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground flex-shrink-0" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        )}

        {recentAlerts.length > 0 && (
          <div className="mt-6 text-center sm:hidden">
            <Link href="/alerts">
              <Button variant="outline" className="w-full">
                Xem tất cả cảnh báo
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
