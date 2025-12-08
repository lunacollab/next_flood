"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/store/auth-store"
import { useAlertStore } from "@/store/alert-store"
import { useLocationStore } from "@/store/location-store"
import { useRequireAuth } from "@/hooks/use-require-auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ALERT_LEVELS } from "@/lib/constants"
import { AlertTriangle, MapPin, Clock, ArrowRight, TrendingUp, Siren, Loader2 } from "lucide-react"
import { format } from "date-fns"
import Link from "next/link"
import { FloodMap } from "@/components/map/flood-map"

// Địa chỉ API Backend (Sửa nếu cần)
const API_URL = "http://localhost:8080/api/v1/sos";

export default function DashboardPage() {
  const router = useRouter()
  const { user, isAuthenticated, isHydrated } = useRequireAuth()
  const { alerts, fetchUserAlerts, isLoading: alertsLoading } = useAlertStore()
  const { userLocations, fetchUserLocations, isLoading: locationsLoading } = useLocationStore()

  // State xử lý nút SOS
  const [isSOSLoading, setIsSOSLoading] = useState(false)

  useEffect(() => {
    if (!isHydrated) return
    if (user?.role === "admin") {
      router.push("/admin")
      return
    }
    if (isAuthenticated) {
      fetchUserAlerts()
      fetchUserLocations()
    }
  }, [isHydrated, isAuthenticated, user, router, fetchUserAlerts, fetchUserLocations])

  // --- HÀM XỬ LÝ KHI BẤM NÚT SOS ---
  const handleSOS = () => {
    setIsSOSLoading(true);

    if (!navigator.geolocation) {
      alert("Trình duyệt không hỗ trợ định vị!");
      setIsSOSLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          // GỌI API BACKEND
          const response = await fetch(API_URL + "/", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              // "Authorization": `Bearer ${token}` // Bỏ comment nếu backend cần token
            },
            body: JSON.stringify({
              latitude: latitude,
              longitude: longitude,
              message: `SOS khẩn cấp từ ${user?.full_name || "Người dùng"}!`
            }),
          });

          if (!response.ok) {
            throw new Error("Không thể kết nối đến máy chủ.");
          }

          // Giả lập delay một chút cho mượt UI
          await new Promise(resolve => setTimeout(resolve, 800));

          alert(`✅ ĐÃ GỬI SOS THÀNH CÔNG!\n\nTọa độ: ${latitude}, ${longitude}\nHệ thống đã ghi nhận và thông báo cho quản trị viên.`);

        } catch (error) {
          console.error("Lỗi:", error);
          alert("❌ Lỗi: Không thể gửi tín hiệu SOS. Vui lòng kiểm tra kết nối mạng!");
        } finally {
          setIsSOSLoading(false);
        }
      },
      (error) => {
        console.error("Lỗi GPS:", error);
        alert("⚠️ Vui lòng bật GPS (Vị trí) để sử dụng tính năng này!");
        setIsSOSLoading(false);
      },
      { enableHighAccuracy: true }
    );
  };

  if (!isHydrated) {
    return (
      <div className="container mx-auto px-4 py-6 sm:py-8 max-w-7xl text-center py-12">
        <p className="text-muted-foreground">Đang tải...</p>
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
      {/* Welcome Section & SOS Button */}
      <div className="rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 dark:from-blue-800 dark:to-blue-900 p-6 sm:p-8 text-white shadow-lg animate-fade-in-up">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="mb-2 text-2xl sm:text-3xl lg:text-4xl font-bold">
              Chào mừng, {user?.full_name}! 👋
            </h1>
            <p className="text-sm sm:text-base lg:text-lg text-blue-100">
              Hệ thống cảnh báo lũ lụt và cứu hộ khẩn cấp.
            </p>
          </div>
          
          {/* NÚT SOS LỚN */}
          <Button 
            variant="destructive" 
            size="lg" 
            onClick={handleSOS}
            disabled={isSOSLoading}
            className="w-full md:w-auto px-8 py-6 text-lg font-bold shadow-xl border-2 border-white/20 hover:scale-105 transition-transform animate-pulse"
          >
            {isSOSLoading ? (
              <>
                <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                ĐANG GỬI VỊ TRÍ...
              </>
            ) : (
              <>
                <Siren className="mr-2 h-6 w-6" />
                GỬI SOS KHẨN CẤP
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-3">
        <Card className="card-hover border-2 shadow-lg">
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

        <Card className="card-hover border-2 shadow-lg">
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

        <Card className="card-hover border-2 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cảnh báo mới</CardTitle>
            <TrendingUp className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold">{recentAlerts.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Trong 24 giờ qua</p>
          </CardContent>
        </Card>
      </div>

      {/* Map Section */}
      {userLocations.length > 0 && (
        <Card className="border-2 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl sm:text-2xl">Bản đồ cảnh báo</CardTitle>
            <CardDescription>Xem các địa điểm bạn đang theo dõi</CardDescription>
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
        <div className="mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h2 className="text-xl sm:text-2xl font-bold">Cảnh báo mới nhất</h2>
          <Link href="/alerts">
            <Button variant="outline">Xem tất cả <ArrowRight className="ml-2 h-4 w-4" /></Button>
          </Link>
        </div>

        {alertsLoading ? (
          <div className="text-center py-12"><Loader2 className="mx-auto animate-spin" /></div>
        ) : recentAlerts.length === 0 ? (
          <Card className="border-2 border-dashed py-12 text-center">
            <p>Không có cảnh báo nào.</p>
          </Card>
        ) : (
          <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2">
            {recentAlerts.map((alert) => (
              <Link key={alert.id} href={`/alerts/${alert.id}`}>
                <Card className="card-hover border-2 shadow-lg">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-base">{alert.title}</CardTitle>
                      <Badge className={ALERT_LEVELS[alert.level].bgColor}>{ALERT_LEVELS[alert.level].label}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                      <Clock className="h-4 w-4" /> {format(new Date(alert.created_at), "dd/MM/yyyy HH:mm")}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}