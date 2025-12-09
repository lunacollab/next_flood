"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FloodMap } from "@/components/map/flood-map"
import { Phone, MapPin, Clock, Navigation, AlertCircle, RefreshCw, Trash2, CheckCircle, PlayCircle, Loader2 } from "lucide-react"
import { format } from "date-fns"
import { useRequireAuth } from "@/hooks/use-require-auth"
import { API_BASE_URL } from "@/lib/constants"

// Địa chỉ API Backend (Dùng 127.0.0.1 để tránh lỗi localhost trên Windows)
const API_URL = `https://giamsatluluttruongchinhhn.com/api/v1/sos`;

// Định nghĩa kiểu dữ liệu SOS khớp với Backend
type SOSRequest = {
  id: number
  user_name: string
  phone: string | null
  latitude: number
  longitude: number
  created_at: string
  status: "pending" | "processing" | "resolved"
  message?: string
}

export default function RescueContent() {
  const router = useRouter()
  const { user, isAuthenticated, isHydrated } = useRequireAuth()
   
  const [sosRequests, setSosRequests] = useState<SOSRequest[]>([])
  const [loading, setLoading] = useState(true)

  // Hàm tải dữ liệu từ Server
  const loadData = async () => {
    setLoading(true)
    try {
      const res = await fetch(API_URL + "/");
      if (res.ok) {
        const data = await res.json();
        setSosRequests(data);
      } else {
        console.error("Lỗi khi tải dữ liệu từ server:", res.status);
      }
    } catch (error) {
      console.error("Lỗi kết nối:", error);
    } finally {
      setLoading(false)
    }
  }

  // Effect: Kiểm tra quyền và tải dữ liệu
  useEffect(() => {
    if (!isHydrated) return;

    if (!isAuthenticated || user?.role !== "admin") {
      router.push("/");
      return;
    }

    loadData();

    // Tự động làm mới dữ liệu mỗi 15 giây
    const interval = setInterval(loadData, 15000);
    return () => clearInterval(interval);
  }, [isHydrated, isAuthenticated, user, router]);


  // Hàm cập nhật trạng thái (Tiếp nhận / Hoàn thành)
  const updateStatus = async (id: number, newStatus: string) => {
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      
      if(res.ok) {
        // Cập nhật giao diện ngay lập tức
        setSosRequests(prev => prev.map(item => item.id === id ? {...item, status: newStatus as any} : item));
      } else {
        alert("Lỗi server khi cập nhật trạng thái");
      }
    } catch (error) {
      alert("Lỗi kết nối mạng");
    }
  }

  // Hàm xóa yêu cầu SOS
  const deleteRequest = async (id: number) => {
    if (confirm("Bạn có chắc chắn muốn xóa yêu cầu cứu trợ này khỏi Database?")) {
      try {
        const res = await fetch(`${API_URL}/${id}`, {
          method: "DELETE",
        });
        
        if (res.ok) {
          setSosRequests(prev => prev.filter(item => item.id !== id));
        } else {
          alert("Không thể xóa yêu cầu này.");
        }
      } catch (error) {
        alert("Lỗi kết nối khi xóa.");
      }
    }
  }

  // Chuẩn bị dữ liệu cho Bản đồ
  const mapLocations = sosRequests.map(sos => ({
    id: sos.id.toString(),
    // Xử lý hiển thị tên trên bản đồ
    name: sos.user_name === "Người dùng (Demo)" ? "Người dân" : sos.user_name,
    latitude: sos.latitude,
    longitude: sos.longitude,
    description: `[${sos.status.toUpperCase()}] ${sos.message || ""}`,
    alert_level: sos.status === 'pending' ? 'critical' : (sos.status === 'processing' ? 'warning' : 'info')
  }))

  if (!isHydrated || !isAuthenticated || user?.role !== "admin") return null 

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl h-full flex flex-col">
      {/* Header trang nội dung */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-red-600 flex items-center gap-2">
            <AlertCircle className="h-8 w-8" />
            Trung tâm Điều phối Cứu hộ (Admin)
          </h1>
          <p className="text-muted-foreground mt-1">
            Quản lý các yêu cầu SOS trực tiếp từ Database hệ thống.
          </p>
        </div>
        <Button variant="outline" onClick={loadData} disabled={loading}>
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <RefreshCw className="mr-2 h-4 w-4" />}
          Làm mới dữ liệu
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0 overflow-hidden">
        
        {/* Cột trái: Danh sách SOS */}
        <Card className="lg:col-span-1 flex flex-col h-full overflow-hidden border-red-200 shadow-lg">
          <CardHeader className="bg-red-50 dark:bg-red-950/30 py-4 border-b shrink-0">
            <CardTitle className="text-lg text-red-700">Danh sách SOS ({sosRequests.length})</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
            {sosRequests.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground py-8">
                <CheckCircle className="h-12 w-12 mb-2 text-green-500 opacity-50" />
                <p>Hiện không có yêu cầu cứu trợ nào.</p>
              </div>
            ) : (
              sosRequests.map((sos) => (
                <div key={sos.id} className={`p-4 rounded-lg border bg-white dark:bg-gray-800 shadow-sm transition-all ${
                    sos.status === 'pending' ? 'border-l-4 border-l-red-500 bg-red-50/50' : 
                    sos.status === 'processing' ? 'border-l-4 border-l-yellow-500' : 'border-l-4 border-l-green-500 opacity-60'
                  }`}>
                  <div className="flex justify-between items-start mb-2">
                    
                    {/* Xử lý hiển thị tên trong danh sách */}
                    <h3 className="font-bold text-base">
                      {sos.user_name === "Người dùng (Demo)" ? "Người dân" : sos.user_name}
                    </h3>
                    
                    <Badge variant={sos.status === 'pending' ? 'destructive' : sos.status === 'processing' ? 'secondary' : 'default'}>
                      {sos.status === 'pending' ? 'KHẨN CẤP' : sos.status === 'processing' ? 'Đang xử lý' : 'Hoàn thành'}
                    </Badge>
                  </div>
                  <div className="text-sm space-y-1 mb-3 text-gray-700 dark:text-gray-300">
                    <div className="flex items-center gap-2"><Clock size={14}/> {format(new Date(sos.created_at), "HH:mm dd/MM/yyyy")}</div>
                    <div className="flex items-center gap-2"><Phone size={14}/> {sos.phone || "Không có SĐT"}</div>
                    {sos.message && <div className="text-xs italic bg-gray-100 dark:bg-gray-900 p-2 rounded border mt-2 text-red-600 dark:text-red-400">"{sos.message}"</div>}
                  </div>
                  
                  {/* Các nút thao tác */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t mt-2">
                    <Button size="sm" variant="outline" className="col-span-2 h-8 text-xs" onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${sos.latitude},${sos.longitude}`)}>
                      <Navigation size={12} className="mr-1"/> Chỉ đường Google
                    </Button>
                    
                    {sos.status === 'pending' && (
                      <Button size="sm" className="h-8 text-xs bg-blue-600 hover:bg-blue-700 text-white" onClick={() => updateStatus(sos.id, 'processing')}>
                        <PlayCircle size={12} className="mr-1"/> Tiếp nhận
                      </Button>
                    )}
                    
                    {sos.status === 'processing' && (
                      <Button size="sm" className="h-8 text-xs bg-green-600 hover:bg-green-700 text-white" onClick={() => updateStatus(sos.id, 'resolved')}>
                        <CheckCircle size={12} className="mr-1"/> Hoàn thành
                      </Button>
                    )}
                    
                    <Button size="sm" variant="destructive" className={`h-8 text-xs ${sos.status === 'resolved' ? 'col-span-2' : ''}`} onClick={() => deleteRequest(sos.id)}>
                      <Trash2 size={12} className="mr-1"/> Xóa
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Cột phải: Bản đồ */}
        <Card className="lg:col-span-2 h-full border-2 overflow-hidden shadow-lg relative min-h-[400px]">
           <FloodMap locations={mapLocations as any} alerts={[]} height="100%" />
           
           {/* Chú thích màu sắc */}
           <div className="absolute bottom-4 right-4 bg-white/95 dark:bg-black/90 p-3 rounded-lg shadow-xl text-xs z-[1000] border border-gray-200">
              <div className="font-bold mb-2">Chú thích trạng thái:</div>
              <div className="flex items-center gap-2 mb-1"><span className="w-3 h-3 rounded-full bg-red-500 block animate-pulse"></span> Khẩn cấp (Chờ)</div>
              <div className="flex items-center gap-2 mb-1"><span className="w-3 h-3 rounded-full bg-yellow-500 block"></span> Đang xử lý</div>
              <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-blue-500 block"></span> Đã hoàn thành</div>
           </div>
        </Card>
      </div>
    </div>
  )
}