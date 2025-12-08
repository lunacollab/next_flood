"use client"

import { useEffect, useState } from "react"
import { useAdminStore } from "@/store/admin-store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin, Plus, Trash2, Edit } from "lucide-react"
import { format } from "date-fns"
import Link from "next/link"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { toast } from "@/hooks/use-toast"

export default function AdminLocationsPage() {
  const { locations, fetchLocations, deleteLocation, isLoading, pagination } = useAdminStore()
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedLocationId, setSelectedLocationId] = useState<number | null>(null)
  const [page, setPage] = useState(1)
  const limit = 6

  useEffect(() => {
    const offset = (page - 1) * limit
    fetchLocations(limit, offset)
  }, [page, fetchLocations])

  const handleDeleteClick = (id: number) => {
    setSelectedLocationId(id)
    setDeleteDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!selectedLocationId) return
    setDeletingId(selectedLocationId)
    try {
      await deleteLocation(selectedLocationId)
      toast.success("Xóa địa điểm thành công")
      // Refresh current page
      const offset = (page - 1) * limit
      await fetchLocations(limit, offset)
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Xóa địa điểm thất bại")
    } finally {
      setDeletingId(null)
      setDeleteDialogOpen(false)
      setSelectedLocationId(null)
    }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Quản lý địa điểm</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Quản lý tất cả địa điểm trong hệ thống
          </p>
        </div>
        <Link href="/admin/locations/new" className="w-full sm:w-auto">
          <Button className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Thêm địa điểm
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Đang tải...</p>
        </div>
      ) : !locations || locations.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Chưa có địa điểm nào</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {locations.map((location) => (
            <Card key={location.id}>
              <CardHeader>
                <CardTitle>{location.name}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {location.province}
                  {location.district && `, ${location.district}`}
                  {location.ward && `, ${location.ward}`}
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 mb-4">
                  <p className="text-sm text-muted-foreground">
                    Tọa độ: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                  </p>
                  {location.description && (
                    <p className="text-sm line-clamp-2">{location.description}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Link href={`/admin/locations/${location.id}/edit`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      <Edit className="h-4 w-4 mr-1" />
                      Sửa
                    </Button>
                  </Link>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteClick(location.id)}
                    disabled={deletingId === location.id}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      {pagination.locations && (
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-t pt-4">
          <div className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
            Hiển thị {pagination.locations.offset + 1} - {Math.min(pagination.locations.offset + limit, pagination.locations.total)} trong tổng số {pagination.locations.total} địa điểm
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
              Trang {page} / {Math.ceil(pagination.locations.total / limit)}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page + 1)}
              disabled={page >= Math.ceil(pagination.locations.total / limit) || isLoading}
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
        title="Xác nhận xóa địa điểm"
        description="Bạn có chắc chắn muốn xóa địa điểm này? Hành động này không thể hoàn tác."
        confirmText="Xóa"
        cancelText="Hủy"
      />
    </div>
  )
}

