"use client"

import { useEffect, useState } from "react"
import { useAdminStore } from "@/store/admin-store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Plus, Trash2, Edit, Eye } from "lucide-react"
import { format } from "date-fns"
import Link from "next/link"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { toast } from "@/hooks/use-toast"

export default function AdminArticlesPage() {
  const { articles, fetchArticles, deleteArticle, isLoading, pagination } = useAdminStore()
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedArticleId, setSelectedArticleId] = useState<number | null>(null)
  const [page, setPage] = useState(1)
  const limit = 10

  useEffect(() => {
    const offset = (page - 1) * limit
    fetchArticles(limit, offset)
  }, [page, fetchArticles])

  const handleDeleteClick = (id: number) => {
    setSelectedArticleId(id)
    setDeleteDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!selectedArticleId) return
    setDeletingId(selectedArticleId)
    try {
      await deleteArticle(selectedArticleId)
      toast.success("Xóa bài viết thành công")
      // Refresh current page
      const offset = (page - 1) * limit
      await fetchArticles(limit, offset)
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Xóa bài viết thất bại")
    } finally {
      setDeletingId(null)
      setDeleteDialogOpen(false)
      setSelectedArticleId(null)
    }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Quản lý bài viết</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Quản lý tất cả bài viết kiến thức
          </p>
        </div>
        <Link href="/admin/articles/new" className="w-full sm:w-auto">
          <Button className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Tạo bài viết mới
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Đang tải...</p>
        </div>
      ) : !articles || articles.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Chưa có bài viết nào</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {articles.map((article) => (
            <Card key={article.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary">{article.category}</Badge>
                      {article.is_published ? (
                        <Badge>Đã xuất bản</Badge>
                      ) : (
                        <Badge variant="outline">Bản nháp</Badge>
                      )}
                    </div>
                    <CardTitle className="mb-2">{article.title}</CardTitle>
                    {article.summary && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {article.summary}
                      </p>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                    {article.published_at && (
                      <span>
                        {format(new Date(article.published_at), "dd/MM/yyyy")}
                      </span>
                    )}
                    <span>{article.view_count} lượt xem</span>
                  </div>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <Link href={`/admin/articles/${article.id}`} className="flex-1 sm:flex-initial">
                      <Button variant="outline" size="sm" className="w-full sm:w-auto">
                        <Eye className="h-4 w-4 mr-1" />
                        <span className="hidden sm:inline">Xem</span>
                      </Button>
                    </Link>
                    <Link href={`/admin/articles/${article.id}/edit`} className="flex-1 sm:flex-initial">
                      <Button variant="outline" size="sm" className="w-full sm:w-auto">
                        <Edit className="h-4 w-4 mr-1" />
                        <span className="hidden sm:inline">Sửa</span>
                      </Button>
                    </Link>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteClick(article.id)}
                      disabled={deletingId === article.id}
                      className="bg-red-600 hover:bg-red-700 text-white flex-1 sm:flex-initial"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      <span className="hidden sm:inline">{deletingId === article.id ? "Đang xóa..." : "Xóa"}</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      {pagination.articles && (
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-t pt-4">
          <div className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
            Hiển thị {pagination.articles.offset + 1} - {Math.min(pagination.articles.offset + limit, pagination.articles.total)} trong tổng số {pagination.articles.total} bài viết
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
              Trang {page} / {Math.ceil(pagination.articles.total / limit)}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page + 1)}
              disabled={page >= Math.ceil(pagination.articles.total / limit) || isLoading}
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
        title="Xác nhận xóa bài viết"
        description="Bạn có chắc chắn muốn xóa bài viết này? Hành động này không thể hoàn tác."
        confirmText="Xóa"
        cancelText="Hủy"
      />
    </div>
  )
}

