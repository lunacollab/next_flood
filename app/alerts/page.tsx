"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/store/auth-store"
import { useRequireAuth } from "@/hooks/use-require-auth"
import { useAlertStore } from "@/store/alert-store"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ALERT_LEVELS } from "@/lib/constants"
import { MapPin, Clock, AlertTriangle, Search, Filter } from "lucide-react"
import { format } from "date-fns"
import Link from "next/link"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function AlertsPage() {
  const router = useRouter()
  const { isAuthenticated, isHydrated } = useRequireAuth()
  const { alerts, fetchAlerts, isLoading } = useAlertStore()
  const [searchTerm, setSearchTerm] = useState("")
  const [filterLevel, setFilterLevel] = useState<string>("all")

  useEffect(() => {
    // Đợi hydration xong trước khi check auth
    if (!isHydrated) return

    if (isAuthenticated) {
      fetchAlerts()
    }
  }, [isHydrated, isAuthenticated, router, fetchAlerts])

  const filteredAlerts = alerts.filter((alert) => {
    const matchesSearch =
      alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.location?.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesLevel = filterLevel === "all" || alert.level === filterLevel
    return matchesSearch && matchesLevel
  })

  if (!isHydrated) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
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
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">Cảnh báo lũ lụt</h1>
        <p className="text-muted-foreground text-lg">
          Danh sách tất cả các cảnh báo lũ lụt hiện tại
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm cảnh báo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterLevel} onValueChange={setFilterLevel}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Lọc theo mức độ" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value="info">Thông tin</SelectItem>
            <SelectItem value="warning">Cảnh báo</SelectItem>
            <SelectItem value="danger">Nguy hiểm</SelectItem>
            <SelectItem value="critical">Rất nguy hiểm</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
            <p className="mt-4 text-muted-foreground">Đang tải...</p>
          </CardContent>
        </Card>
      ) : filteredAlerts.length === 0 ? (
        <Card className="border-2 border-dashed">
          <CardContent className="py-12 text-center">
            <AlertTriangle className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <p className="mb-2 text-lg font-semibold">Không tìm thấy cảnh báo</p>
            <p className="text-muted-foreground">
              {searchTerm || filterLevel !== "all"
                ? "Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm"
                : "Hiện tại không có cảnh báo nào"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredAlerts.map((alert) => {
            const levelConfig = ALERT_LEVELS[alert.level]
            return (
              <Link key={alert.id} href={`/alerts/${alert.id}`}>
                <Card className="card-hover border-2 transition-all duration-300">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="mb-3 flex items-center gap-2 flex-wrap">
                          <Badge
                            className={`${levelConfig.bgColor} ${levelConfig.textColor} border-0 font-semibold`}
                          >
                            {levelConfig.label}
                          </Badge>
                          {alert.location && (
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <MapPin className="h-4 w-4" />
                              <span className="truncate max-w-[150px]">{alert.location.name}</span>
                            </div>
                          )}
                        </div>
                        <CardTitle className="mb-2 line-clamp-2">{alert.title}</CardTitle>
                        <CardDescription className="line-clamp-3">
                          {alert.description}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {format(new Date(alert.created_at), "dd/MM/yyyy HH:mm")}
                      </div>
                      {alert.water_level && (
                        <span className="hidden sm:inline">💧 {alert.water_level}m</span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
