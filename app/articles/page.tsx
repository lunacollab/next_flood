"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { BookOpen, Search, Eye, Calendar } from "lucide-react"
import apiClient from "@/lib/api-client"
import { Article } from "@/lib/types"
import Link from "next/link"
import { format } from "date-fns"

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    fetchArticles()
  }, [])

  const fetchArticles = async () => {
    setIsLoading(true)
    try {
      const response = await apiClient.get("/articles")
      if (response.data.success && response.data.data) {
        setArticles(response.data.data)
      }
    } catch (error) {
      console.error("Failed to fetch articles:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredArticles = articles.filter(
    (article) =>
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.summary?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">Kiến thức phòng chống lũ lụt</h1>
        <p className="text-muted-foreground text-lg">
          Tìm hiểu cách ứng phó và phòng chống lũ lụt hiệu quả
        </p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm bài viết..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {isLoading ? (
        <Card className="border-2">
          <CardContent className="py-12 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
            <p className="mt-4 text-muted-foreground">Đang tải...</p>
          </CardContent>
        </Card>
      ) : filteredArticles.length === 0 ? (
        <Card className="border-2 border-dashed">
          <CardContent className="py-12 text-center">
            <BookOpen className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <p className="mb-2 text-lg font-semibold">
              {searchTerm ? "Không tìm thấy bài viết" : "Chưa có bài viết nào"}
            </p>
            <p className="text-muted-foreground">
              {searchTerm ? "Thử tìm kiếm với từ khóa khác" : "Các bài viết sẽ được cập nhật sớm"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredArticles.map((article) => (
            <Link key={article.id} href={`/articles/${article.slug}`}>
              <Card className="card-hover border-2 h-full flex flex-col">
                {article.thumbnail_path && (
                  <div className="relative h-48 w-full overflow-hidden rounded-t-lg">
                    <img
                      src={`http://localhost:8080${article.thumbnail_path}`}
                      alt={article.title}
                      className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                    />
                  </div>
                )}
                <CardHeader>
                  <div className="mb-2">
                    <span className="inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                      {article.category}
                    </span>
                  </div>
                  <CardTitle className="line-clamp-2 mb-2">{article.title}</CardTitle>
                  {article.summary && (
                    <CardDescription className="line-clamp-3">{article.summary}</CardDescription>
                  )}
                </CardHeader>
                <CardContent className="mt-auto">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      <span>{article.view_count || 0}</span>
                    </div>
                    {article.published_at && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{format(new Date(article.published_at), "dd/MM/yyyy")}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
