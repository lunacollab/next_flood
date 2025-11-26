"use client"

import { useEffect } from "react"
import { useAdminStore } from "@/store/admin-store"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, AlertTriangle, MapPin, BookOpen } from "lucide-react"
import Link from "next/link"

export default function AdminDashboardPage() {
  const { statistics, fetchStatistics, isLoading } = useAdminStore()

  useEffect(() => {
    fetchStatistics()
  }, [fetchStatistics])

  const stats = [
    {
      title: "Tổng người dùng",
      value: statistics?.total_users || 0,
      icon: Users,
      href: "/admin/users",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Tổng cảnh báo",
      value: statistics?.total_alerts || 0,
      icon: AlertTriangle,
      href: "/admin/alerts",
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
    {
      title: "Tổng địa điểm",
      value: statistics?.total_locations || 0,
      icon: MapPin,
      href: "/admin/locations",
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Tổng bài viết",
      value: statistics?.total_articles || 0,
      icon: BookOpen,
      href: "/admin/articles",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
  ]

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Tổng quan hệ thống và quản lý
        </p>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Đang tải...</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <Link key={stat.title} href={stat.href}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      {stat.title}
                    </CardTitle>
                    <div className={`${stat.bgColor} p-2 rounded-lg`}>
                      <Icon className={`h-5 w-5 ${stat.color}`} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stat.value}</div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

