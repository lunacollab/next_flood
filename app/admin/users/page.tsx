"use client"

import { useEffect, useState } from "react"
import { useAdminStore } from "@/store/admin-store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, Trash2, Power, Eye, X } from "lucide-react"
import { format } from "date-fns"
import apiClient from "@/lib/api-client"
import { User } from "@/lib/types"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { toast } from "@/hooks/use-toast"

export default function AdminUsersPage() {
  const { users, fetchUsers, toggleUserStatus, deleteUser, isLoading, pagination } = useAdminStore()
  const [actioningId, setActioningId] = useState<number | null>(null)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isLoadingDetail, setIsLoadingDetail] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null)
  const [page, setPage] = useState(1)
  const limit = 10

  useEffect(() => {
    const offset = (page - 1) * limit
    fetchUsers(limit, offset)
  }, [page, fetchUsers])

  const handleToggleStatus = async (id: number) => {
    setActioningId(id)
    try {
      await toggleUserStatus(id)
      toast.success("Cập nhật trạng thái thành công")
      // Refresh current page
      const offset = (page - 1) * limit
      await fetchUsers(limit, offset)
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Cập nhật trạng thái thất bại")
    } finally {
      setActioningId(null)
    }
  }

  const handleDeleteClick = (id: number) => {
    setSelectedUserId(id)
    setDeleteDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!selectedUserId) return
    setActioningId(selectedUserId)
    try {
      await deleteUser(selectedUserId)
      toast.success("Xóa người dùng thành công")
      // Refresh current page
      const offset = (page - 1) * limit
      await fetchUsers(limit, offset)
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Xóa người dùng thất bại")
    } finally {
      setActioningId(null)
      setDeleteDialogOpen(false)
      setSelectedUserId(null)
    }
  }

  const handleViewDetail = async (id: number) => {
    setIsLoadingDetail(true)
    try {
      const response = await apiClient.get(`/admin/users/${id}`)
      if (response.data.success && response.data.data) {
        setSelectedUser(response.data.data)
      }
    } catch (error: any) {
      console.error("Failed to fetch user detail:", error)
      toast.error(error?.response?.data?.message || "Không thể tải thông tin người dùng")
    } finally {
      setIsLoadingDetail(false)
    }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Quản lý người dùng</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Quản lý tất cả người dùng trong hệ thống
        </p>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Đang tải...</p>
        </div>
      ) : users.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Chưa có người dùng nào</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Danh sách người dùng</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2 sm:p-4 text-xs sm:text-sm">ID</th>
                    <th className="text-left p-2 sm:p-4 text-xs sm:text-sm">Họ tên</th>
                    <th className="text-left p-2 sm:p-4 text-xs sm:text-sm hidden md:table-cell">Email</th>
                    <th className="text-left p-2 sm:p-4 text-xs sm:text-sm hidden lg:table-cell">Số điện thoại</th>
                    <th className="text-left p-2 sm:p-4 text-xs sm:text-sm">Vai trò</th>
                    <th className="text-left p-2 sm:p-4 text-xs sm:text-sm">Trạng thái</th>
                    <th className="text-left p-2 sm:p-4 text-xs sm:text-sm hidden md:table-cell">Ngày tạo</th>
                    <th className="text-left p-2 sm:p-4 text-xs sm:text-sm">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b">
                      <td className="p-2 sm:p-4 text-xs sm:text-sm">{user.id}</td>
                      <td className="p-2 sm:p-4 text-xs sm:text-sm font-medium">{user.full_name}</td>
                      <td className="p-2 sm:p-4 text-xs sm:text-sm hidden md:table-cell">{user.email}</td>
                      <td className="p-2 sm:p-4 text-xs sm:text-sm hidden lg:table-cell">{user.phone || "-"}</td>
                      <td className="p-2 sm:p-4">
                        <Badge variant={user.role === "admin" ? "default" : "secondary"} className="text-xs">
                          {user.role === "admin" ? "Admin" : "User"}
                        </Badge>
                      </td>
                      <td className="p-2 sm:p-4">
                        <Badge variant={user.is_active ? "default" : "destructive"} className="text-xs">
                          {user.is_active ? "Hoạt động" : "Khóa"}
                        </Badge>
                      </td>
                      <td className="p-2 sm:p-4 text-xs sm:text-sm text-muted-foreground hidden md:table-cell">
                        {format(new Date(user.created_at), "dd/MM/yyyy")}
                      </td>
                      <td className="p-2 sm:p-4">
                        <div className="flex gap-1 sm:gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewDetail(user.id)}
                            disabled={isLoadingDetail}
                            title="Xem chi tiết"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleStatus(user.id)}
                            disabled={actioningId === user.id}
                            title="Đổi trạng thái"
                          >
                            <Power className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteClick(user.id)}
                            disabled={actioningId === user.id}
                            title="Xóa"
                            className="bg-red-600 hover:bg-red-700 text-white"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {pagination.users && (
              <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t pt-4">
                <div className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
                  Hiển thị {pagination.users.offset + 1} - {Math.min(pagination.users.offset + limit, pagination.users.total)} trong tổng số {pagination.users.total} người dùng
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
                    Trang {page} / {Math.ceil(pagination.users.total / limit)}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page + 1)}
                    disabled={page >= Math.ceil(pagination.users.total / limit) || isLoading}
                  >
                    Sau
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Modal chi tiết user */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-card rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border">
            <div className="sticky top-0 bg-card border-b p-4 sm:p-6 flex items-center justify-between z-10">
              <h2 className="text-xl sm:text-2xl font-bold">Chi tiết người dùng</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedUser(null)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
                {selectedUser.avatar_url ? (
                  <img
                    src={selectedUser.avatar_url}
                    alt={selectedUser.full_name}
                    className="h-20 w-20 sm:h-24 sm:w-24 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-2xl sm:text-3xl font-bold">
                    {selectedUser.full_name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="text-center sm:text-left">
                  <h3 className="text-xl sm:text-2xl font-bold">{selectedUser.full_name}</h3>
                  <p className="text-sm sm:text-base text-muted-foreground">{selectedUser.email}</p>
                  <div className="flex gap-2 mt-2 justify-center sm:justify-start">
                    <Badge variant={selectedUser.role === "admin" ? "default" : "secondary"}>
                      {selectedUser.role === "admin" ? "Admin" : "User"}
                    </Badge>
                    <Badge variant={selectedUser.is_active ? "default" : "destructive"}>
                      {selectedUser.is_active ? "Hoạt động" : "Khóa"}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">ID</label>
                  <p className="text-lg">{selectedUser.id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Email</label>
                  <p className="text-lg">{selectedUser.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Số điện thoại</label>
                  <p className="text-lg">{selectedUser.phone || "-"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Địa chỉ</label>
                  <p className="text-lg">{selectedUser.address || "-"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Ngày tạo</label>
                  <p className="text-lg">{format(new Date(selectedUser.created_at), "dd/MM/yyyy HH:mm")}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Cập nhật lần cuối</label>
                  <p className="text-lg">{format(new Date(selectedUser.updated_at), "dd/MM/yyyy HH:mm")}</p>
                </div>
              </div>
            </div>
            <div className="sticky bottom-0 bg-card border-t p-4 sm:p-6 flex justify-end gap-2 z-10">
              <Button variant="outline" onClick={() => setSelectedUser(null)}>
                Đóng
              </Button>
            </div>
          </div>
        </div>
      )}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDelete}
        title="Xác nhận xóa người dùng"
        description="Bạn có chắc chắn muốn xóa người dùng này? Hành động này không thể hoàn tác."
        confirmText="Xóa"
        cancelText="Hủy"
      />
    </div>
  )
}

