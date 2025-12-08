"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { BookOpen, Calendar, Eye, ArrowLeft } from "lucide-react"
import { format } from "date-fns"
import apiClient from "@/lib/api-client"
import { Article } from "@/lib/types"

export default function ArticleDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [article, setArticle] = useState<Article | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (params.slug) {
      fetchArticle(params.slug as string)
    }
  }, [params.slug])

  const fetchArticle = async (slug: string) => {
    setIsLoading(true)
    try {
      const response = await apiClient.get(`/articles/${slug}`)
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
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center justify-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
        </div>
      </div>
    )
  }

  if (!article) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="border-2">
          <CardContent className="py-12 text-center">
            <BookOpen className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <p className="mb-4 text-lg font-semibold">Không tìm thấy bài viết</p>
            <Button onClick={() => router.push("/articles")} variant="outline">
              Quay lại danh sách
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8 max-w-4xl">
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Quay lại
      </Button>

      <article className="animate-fade-in-up">
        {/* Article Header */}
        <header className="mb-8 sm:mb-10 pb-6 sm:pb-8 border-b border-border">
          <div className="mb-4">
            <Badge variant="secondary" className="text-xs sm:text-sm px-3 py-1.5 font-medium">
              {article.category}
            </Badge>
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
  )
}
