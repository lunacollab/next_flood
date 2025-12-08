"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/store/auth-store"
import { useRequireAuth } from "@/hooks/use-require-auth"
import { useNotificationStore } from "@/store/notification-store"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bell, Check, Trash2 } from "lucide-react"
import { format } from "date-fns"
import { toast } from "@/hooks/use-toast"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { useState } from "react"

export default function NotificationsPage() {
  const router = useRouter()
  const { isAuthenticated, user, isHydrated } = useRequireAuth()
  const {
    notifications,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    isLoading,
  } = useNotificationStore()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedNotificationId, setSelectedNotificationId] = useState<number | null>(null)

  useEffect(() => {
    // Đợi hydration xong trước khi check auth
    if (!isHydrated) return

    // Redirect admin đến trang admin
    if (user?.role === "admin") {
      router.push("/admin")
      return
    }

    if (isAuthenticated) {
      fetchNotifications()
    }
  }, [isHydrated, isAuthenticated, user, router, fetchNotifications])

  const handleMarkAsRead = async (id: number) => {
    try {
      await markAsRead(id)
      toast.success("Đánh dấu đã đọc thành công")
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Đánh dấu đã đọc thất bại")
    }
  }

  const handleDeleteClick = (id: number) => {
    setSelectedNotificationId(id)
    setDeleteDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!selectedNotificationId) return
    try {
      await deleteNotification(selectedNotificationId)
      toast.success("Xóa thông báo thành công")
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Xóa thông báo thất bại")
    } finally {
      setDeleteDialogOpen(false)
      setSelectedNotificationId(null)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead()
      toast.success("Đánh dấu tất cả đã đọc thành công")
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Đánh dấu tất cả đã đọc thất bại")
    }
  }

  if (!isHydrated) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Đang tải...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated || user?.role === "admin") {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Thông báo</h1>
          <p className="text-muted-foreground">
            Xem tất cả thông báo của bạn
          </p>
        </div>
        {notifications.length > 0 && (
          <Button variant="outline" onClick={handleMarkAllAsRead}>
            <Check className="h-4 w-4 mr-2" />
            Đánh dấu tất cả đã đọc
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Đang tải...</p>
        </div>
      ) : notifications.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Chưa có thông báo nào</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {notifications.map((notification) => (
            <Card key={notification.id} className={!notification.is_read ? "border-primary" : ""}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle>{notification.title}</CardTitle>
                      {!notification.is_read && (
                        <Badge variant="default">Mới</Badge>
                      )}
                    </div>
                    <CardDescription>{notification.message}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {format(new Date(notification.sent_at), "dd/MM/yyyy HH:mm")}
                  </span>
                  <div className="flex gap-2">
                    {!notification.is_read && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleMarkAsRead(notification.id)}
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Đã đọc
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteClick(notification.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDelete}
        title="Xác nhận xóa thông báo"
        description="Bạn có chắc chắn muốn xóa thông báo này? Hành động này không thể hoàn tác."
        confirmText="Xóa"
        cancelText="Hủy"
      />
    </div>
  )
}

