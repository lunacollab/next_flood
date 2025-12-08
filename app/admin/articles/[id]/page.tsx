"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { BookOpen, Calendar, Eye, ArrowLeft, Edit } from "lucide-react"
import { format } from "date-fns"
import apiClient from "@/lib/api-client"
import { Article } from "@/lib/types"
import Link from "next/link"

export default function AdminArticleViewPage() {
  const params = useParams()
  const router = useRouter()
  const [article, setArticle] = useState<Article | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const articleId = parseInt(params.id as string)

  useEffect(() => {
    if (articleId) {
      fetchArticle()
    }
  }, [articleId])

  const fetchArticle = async () => {
    setIsLoading(true)
    try {
      const response = await apiClient.get(`/admin/articles/${articleId}`)
      if (response.data.success && response.data.data) {
        setArticle(response.data.data)
      }
    } catch (error) {
      console.error("Failed to fetch article:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 flex justify-center">
        <div className="w-full max-w-6xl">
          <div className="flex items-center justify-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!article) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 flex justify-center">
        <div className="w-full max-w-6xl">
          <Card className="border-2">
            <CardContent className="py-8 sm:py-12 text-center">
              <BookOpen className="mx-auto mb-4 h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground" />
              <p className="mb-4 text-base sm:text-lg font-semibold">Không tìm thấy bài viết</p>
              <Button onClick={() => router.push("/admin/articles")} variant="outline">
                Quay lại danh sách
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 flex justify-center">
      <div className="w-full max-w-6xl">
        <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại
          </Button>
          <Link href={`/admin/articles/${articleId}/edit`} className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto">
              <Edit className="mr-2 h-4 w-4" />
              Chỉnh sửa
            </Button>
          </Link>
        </div>

        <article className="animate-fade-in-up">
          {/* Article Header */}
          <header className="mb-8 sm:mb-10 pb-6 sm:pb-8 border-b border-border">
            <div className="mb-4 flex items-center gap-2">
              <Badge variant="secondary" className="text-xs sm:text-sm px-3 py-1.5 font-medium">
                {article.category}
              </Badge>
              {article.is_published ? (
                <Badge>Đã xuất bản</Badge>
              ) : (
                <Badge variant="outline">Bản nháp</Badge>
              )}
            </div>
            <h1 className="mb-4 sm:mb-6 text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight tracking-tight text-foreground">
              {article.title}
            </h1>
            {article.summary && (
              <p className="mb-6 sm:mb-8 text-base sm:text-lg text-muted-foreground leading-relaxed max-w-3xl">
                {article.summary}
              </p>
            )}
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs sm:text-sm text-muted-foreground pt-2">
              {article.published_at && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span>{format(new Date(article.published_at), "dd/MM/yyyy")}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span>{article.view_count || 0} lượt xem</span>
              </div>
            </div>
          </header>

          {/* Article Content */}
          <div className="bg-card rounded-xl border shadow-sm">
            <div className="p-6 sm:p-8 lg:p-10 xl:p-12">
              <div 
                className="article-content"
                dangerouslySetInnerHTML={{ __html: article.content }}
              />
            </div>
          </div>
        </article>
      </div>
    </div>
  )
}

