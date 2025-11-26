"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/store/auth-store"
import { useRequireAuth } from "@/hooks/use-require-auth"
import { useContactStore } from "@/store/contact-store"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Plus, Phone, Mail, User, Trash2, Edit, Search, AlertCircle } from "lucide-react"
import { Contact } from "@/lib/types"
import Link from "next/link"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { toast } from "@/hooks/use-toast"

export default function ContactsPage() {
  const router = useRouter()
  const { isAuthenticated, isHydrated } = useRequireAuth()
  const { contacts, fetchContacts, deleteContact, isLoading } = useContactStore()
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedContactId, setSelectedContactId] = useState<number | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    // Đợi hydration xong trước khi check auth
    if (!isHydrated) return

    if (isAuthenticated) {
      fetchContacts()
    }
  }, [isHydrated, isAuthenticated, router, fetchContacts])

  const handleDeleteClick = (id: number) => {
    setSelectedContactId(id)
    setDeleteDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!selectedContactId) return
    setDeletingId(selectedContactId)
    try {
      await deleteContact(selectedContactId)
      toast.success("Xóa liên hệ thành công")
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Xóa liên hệ thất bại")
    } finally {
      setDeletingId(null)
      setDeleteDialogOpen(false)
      setSelectedContactId(null)
    }
  }

  const filteredContacts = contacts.filter((contact) =>
    contact.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="mb-2 text-3xl font-bold">Người thân / Liên hệ khẩn cấp</h1>
          <p className="text-muted-foreground text-lg">
            Quản lý danh sách người thân để nhận thông báo khi có cảnh báo
          </p>
        </div>
        <Link href="/contacts/new">
          <Button className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
            <Plus className="mr-2 h-4 w-4" />
            Thêm liên hệ
          </Button>
        </Link>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm liên hệ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
            <p className="mt-4 text-muted-foreground">Đang tải...</p>
          </CardContent>
        </Card>
      ) : filteredContacts.length === 0 ? (
        <Card className="border-2 border-dashed">
          <CardContent className="py-12 text-center">
            <User className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <p className="mb-2 text-lg font-semibold">
              {searchTerm ? "Không tìm thấy liên hệ" : "Chưa có liên hệ nào"}
            </p>
            {!searchTerm && (
              <>
                <p className="mb-4 text-muted-foreground">Thêm người thân để nhận thông báo khẩn cấp</p>
                <Link href="/contacts/new">
                  <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
                    <Plus className="mr-2 h-4 w-4" />
                    Thêm liên hệ đầu tiên
                  </Button>
                </Link>
              </>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredContacts.map((contact) => (
            <Card key={contact.id} className="card-hover border-2">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="mb-2 flex items-center gap-2">
                      {contact.avatar_url ? (
                        <img
                          src={contact.avatar_url}
                          alt={contact.full_name}
                          className="h-12 w-12 rounded-full object-cover border-2 border-border"
                        />
                      ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white font-semibold text-lg">
                          {contact.full_name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="flex-1">
                        <CardTitle className="line-clamp-1">{contact.full_name}</CardTitle>
                        {contact.relationship && (
                          <CardDescription>{contact.relationship}</CardDescription>
                        )}
                      </div>
                    </div>
                  </div>
                  {contact.is_emergency && (
                    <Badge variant="destructive" className="flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      Khẩn cấp
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <a
                      href={`tel:${contact.phone}`}
                      className="hover:text-primary transition-colors"
                    >
                      {contact.phone}
                    </a>
                  </div>
                  {contact.email && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <a
                        href={`mailto:${contact.email}`}
                        className="hover:text-primary transition-colors truncate"
                      >
                        {contact.email}
                      </a>
                    </div>
                  )}
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => router.push(`/contacts/${contact.id}/edit`)}
                    >
                      <Edit className="mr-1 h-4 w-4" />
                      Sửa
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleDeleteClick(contact.id)}
                      disabled={deletingId === contact.id}
                    >
                      <Trash2 className="mr-1 h-4 w-4" />
                      {deletingId === contact.id ? "..." : "Xóa"}
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
        title="Xác nhận xóa liên hệ"
        description="Bạn có chắc chắn muốn xóa liên hệ này? Hành động này không thể hoàn tác."
        confirmText="Xóa"
        cancelText="Hủy"
      />
    </div>
  )
}
