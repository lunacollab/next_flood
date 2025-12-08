"use client"

import { useEffect, useState } from "react"
import { useAdminStore } from "@/store/admin-store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Plus, Trash2, Edit } from "lucide-react"
import { ALERT_LEVELS } from "@/lib/constants"
import { format } from "date-fns"
import Link from "next/link"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { toast } from "@/hooks/use-toast"

export default function AdminAlertsPage() {
  const { alerts, fetchAlerts, deleteAlert, isLoading, pagination } = useAdminStore()
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedAlertId, setSelectedAlertId] = useState<number | null>(null)
  const [page, setPage] = useState(1)
  const limit = 5

  useEffect(() => {
    const offset = (page - 1) * limit
    fetchAlerts(limit, offset)
  }, [page, fetchAlerts])

  const handleDeleteClick = (id: number) => {
    setSelectedAlertId(id)
    setDeleteDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!selectedAlertId) return
    setDeletingId(selectedAlertId)
    try {
      await deleteAlert(selectedAlertId)
      toast.success("Xóa cảnh báo thành công")
      // Refresh current page
      const offset = (page - 1) * limit
      await fetchAlerts(limit, offset)
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Xóa cảnh báo thất bại")
    } finally {
      setDeletingId(null)
      setDeleteDialogOpen(false)
      setSelectedAlertId(null)
    }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Quản lý cảnh báo</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Quản lý tất cả cảnh báo lũ lụt
          </p>
        </div>
        <Link href="/admin/alerts/new" className="w-full sm:w-auto">
          <Button className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Tạo cảnh báo mới
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Đang tải...</p>
        </div>
      ) : !alerts || (Array.isArray(alerts) && alerts.length === 0) ? (
        <Card>
          <CardContent className="py-12 text-center">
            <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Chưa có cảnh báo nào</p>
          </CardContent>
        </Card>
      ) : alerts && Array.isArray(alerts) ? (
        <div className="grid gap-4">
          {alerts.map((alert) => {
            const levelConfig = ALERT_LEVELS[alert.level]
            return (
              <Card key={alert.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge
                          className={levelConfig.bgColor + " " + levelConfig.textColor}
                        >
                          {levelConfig.label}
                        </Badge>
                        {alert.location && (
                          <span className="text-sm text-muted-foreground">
                            {alert.location.name}
                          </span>
                        )}
                      </div>
                      <CardTitle className="mb-2">{alert.title}</CardTitle>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {alert.description}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <span className="text-xs sm:text-sm text-muted-foreground">
                      {format(new Date(alert.created_at), "dd/MM/yyyy HH:mm")}
                    </span>
                    <div className="flex gap-2 w-full sm:w-auto">
                      <Link href={`/admin/alerts/${alert.id}/edit`} className="flex-1 sm:flex-initial">
                        <Button variant="outline" size="sm" className="w-full sm:w-auto">
                          <Edit className="h-4 w-4 mr-1" />
                          <span className="hidden sm:inline">Sửa</span>
                        </Button>
                      </Link>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteClick(alert.id)}
                        disabled={deletingId === alert.id}
                        className="bg-red-600 hover:bg-red-700 text-white flex-1 sm:flex-initial"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        <span className="hidden sm:inline">{deletingId === alert.id ? "Đang xóa..." : "Xóa"}</span>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : null}
      {pagination.alerts && (
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-t pt-4">
          <div className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
            Hiển thị {pagination.alerts.offset + 1} - {Math.min(pagination.alerts.offset + limit, pagination.alerts.total)} trong tổng số {pagination.alerts.total} cảnh báo
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page - 1)}
              disabled={page === 1 || isLoading}
            >
              Trước
            </Button>
            <span className="flex items-center px-4 text-sm">
              Trang {page} / {Math.ceil(pagination.alerts.total / limit)}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page + 1)}
              disabled={page >= Math.ceil(pagination.alerts.total / limit) || isLoading}
            >
              Sau
            </Button>
          </div>
        </div>
      )}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDelete}
        title="Xác nhận xóa cảnh báo"
        description="Bạn có chắc chắn muốn xóa cảnh báo này? Hành động này không thể hoàn tác."
        confirmText="Xóa"
        cancelText="Hủy"
      />
    </div>
  )
}

