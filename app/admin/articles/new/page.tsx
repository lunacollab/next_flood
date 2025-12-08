"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAdminStore } from "@/store/admin-store"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { createArticleSchema, type CreateArticleInput } from "@/lib/validations/article"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "@/hooks/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function NewArticlePage() {
  const router = useRouter()
  const { createArticle, error, clearError } = useAdminStore()
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<CreateArticleInput>({
    resolver: zodResolver(createArticleSchema),
    defaultValues: {
      is_published: false,
      title: "",
      content: "",
      category: "",
      summary: "",
    },
  })

  const isPublished = watch("is_published")

  const onSubmit = async (data: CreateArticleInput) => {
    setIsLoading(true)
    clearError()
    try {
      await createArticle(data)
      toast.success("Tạo bài viết thành công")
      router.push("/admin/articles")
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Tạo bài viết thất bại")
    } finally {
      setIsLoading(false)
    }
  }

  const contentValue = watch("content") || ""

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
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Tạo bài viết mới</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Tạo bài viết kiến thức mới
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Thông tin bài viết</CardTitle>
            <CardDescription>
              Điền thông tin chi tiết về bài viết
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
                  placeholder="Cách ứng phó khi có cảnh báo lũ lụt"
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
                  placeholder="Phòng chống lũ"
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
                  placeholder="Tóm tắt ngắn gọn về bài viết..."
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
                  checked={isPublished}
                  onChange={(e) => setValue("is_published", e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="is_published" className="cursor-pointer">
                  Xuất bản ngay
                </Label>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
                  {isLoading ? "Đang tạo..." : "Tạo bài viết"}
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

