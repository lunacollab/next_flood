"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { useAdminStore } from "@/store/admin-store"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { updateArticleSchema, type UpdateArticleInput } from "@/lib/validations/article"
import apiClient from "@/lib/api-client"
import { Article } from "@/lib/types"
import { toast } from "@/hooks/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function EditArticlePage() {
  const router = useRouter()
  const params = useParams()
  const { updateArticle, error, clearError } = useAdminStore()
  const [isLoading, setIsLoading] = useState(false)
  const [article, setArticle] = useState<Article | null>(null)
  const articleId = parseInt(params.id as string)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<UpdateArticleInput>({
    resolver: zodResolver(updateArticleSchema),
  })

  useEffect(() => {
    fetchArticle()
  }, [])

  const fetchArticle = async () => {
    try {
      const response = await apiClient.get(`/admin/articles/${articleId}`)
      if (response.data.success && response.data.data) {
        const articleData = response.data.data
        setArticle(articleData)
        setValue("title", articleData.title)
        setValue("category", articleData.category)
        if (articleData.summary) setValue("summary", articleData.summary)
        setValue("content", articleData.content)
        setValue("is_published", articleData.is_published)
      }
    } catch (error: any) {
      console.error("Failed to fetch article:", error)
      toast.error(error?.response?.data?.message || "Không thể tải thông tin bài viết")
    }
  }

  const onSubmit = async (data: UpdateArticleInput) => {
    setIsLoading(true)
    clearError()
    try {
      await updateArticle(articleId, data)
      toast.success("Cập nhật bài viết thành công")
      router.push("/admin/articles")
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Cập nhật bài viết thất bại")
    } finally {
      setIsLoading(false)
    }
  }

  const contentValue = watch("content") || ""

  if (!article) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 flex justify-center">
        <div className="w-full max-w-6xl">
          <p className="text-sm sm:text-base text-muted-foreground">Đang tải...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 flex justify-center">
      <div className="w-full max-w-6xl">
        <div className="mb-4 sm:mb-6">
          <button
            onClick={() => router.back()}
            className="text-xs sm:text-sm text-muted-foreground hover:text-primary mb-3 sm:mb-4"
          >
            ← Quay lại
          </button>
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Chỉnh sửa bài viết</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Cập nhật thông tin bài viết
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Thông tin bài viết</CardTitle>
            <CardDescription>
              Cập nhật thông tin chi tiết về bài viết
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="title">Tiêu đề *</Label>
                <Input
                  id="title"
                  {...register("title")}
                />
                {errors.title && (
                  <p className="text-sm text-destructive">{errors.title.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Danh mục *</Label>
                <Input
                  id="category"
                  {...register("category")}
                />
                {errors.category && (
                  <p className="text-sm text-destructive">{errors.category.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="summary">Tóm tắt</Label>
                <textarea
                  id="summary"
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  {...register("summary")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Nội dung *</Label>
                <Tabs defaultValue="edit" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="edit">Chỉnh sửa</TabsTrigger>
                    <TabsTrigger value="preview">Xem trước</TabsTrigger>
                  </TabsList>
                  <TabsContent value="edit" className="mt-2">
                    <textarea
                      id="content"
                      className="flex min-h-[400px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 font-mono"
                      placeholder="Nhập nội dung HTML của bài viết..."
                      {...register("content")}
                    />
                    {errors.content && (
                      <p className="text-sm text-destructive mt-2">{errors.content.message}</p>
                    )}
                  </TabsContent>
                  <TabsContent value="preview" className="mt-2">
                    <div className="min-h-[400px] w-full rounded-md border border-input bg-background p-4 overflow-auto">
                      {contentValue ? (
                        <div 
                          className="article-content"
                          dangerouslySetInnerHTML={{ __html: contentValue }}
                        />
                      ) : (
                        <p className="text-muted-foreground text-center py-20">
                          Nhập nội dung để xem trước
                        </p>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_published"
                  checked={watch("is_published") ?? article.is_published}
                  onChange={(e) => setValue("is_published", e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="is_published" className="cursor-pointer">
                  Xuất bản
                </Label>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
                  {isLoading ? "Đang lưu..." : "Lưu thay đổi"}
                </Button>
                <Button type="button" variant="outline" onClick={() => router.back()} className="w-full sm:w-auto">
                  Hủy
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

