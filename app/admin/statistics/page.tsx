"use client"

import { useEffect } from "react"
import { useAdminStore } from "@/store/admin-store"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, AlertTriangle, MapPin, BookOpen } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"

export default function AdminStatisticsPage() {
  const { statistics, fetchStatistics, isLoading } = useAdminStore()

  useEffect(() => {
    fetchStatistics()
  }, [fetchStatistics])

  const stats = [
    {
      title: "Tổng người dùng",
      value: statistics?.total_users || 0,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Tổng cảnh báo",
      value: statistics?.total_alerts || 0,
      icon: AlertTriangle,
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
    {
      title: "Tổng địa điểm",
      value: statistics?.total_locations || 0,
      icon: MapPin,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Tổng bài viết",
      value: statistics?.total_articles || 0,
      icon: BookOpen,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
  ]

  // Dữ liệu cho biểu đồ cột
  const barChartData = [
    {
      name: "Người dùng",
      value: statistics?.total_users || 0,
      color: "#2563eb",
    },
    {
      name: "Cảnh báo",
      value: statistics?.total_alerts || 0,
      color: "#dc2626",
    },
    {
      name: "Địa điểm",
      value: statistics?.total_locations || 0,
      color: "#16a34a",
    },
    {
      name: "Bài viết",
      value: statistics?.total_articles || 0,
      color: "#9333ea",
    },
  ]

  // Dữ liệu cho biểu đồ tròn
  const pieChartData = [
    { name: "Người dùng", value: statistics?.total_users || 0 },
    { name: "Cảnh báo", value: statistics?.total_alerts || 0 },
    { name: "Địa điểm", value: statistics?.total_locations || 0 },
    { name: "Bài viết", value: statistics?.total_articles || 0 },
  ].filter((item) => item.value > 0)

  const COLORS = ["#2563eb", "#dc2626", "#16a34a", "#9333ea"]

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Thống kê hệ thống</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Tổng quan về hệ thống và dữ liệu
        </p>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Đang tải...</p>
        </div>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
            {stats.map((stat) => {
              const Icon = stat.icon
              return (
                <Card key={stat.title}>
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
              )
            })}
          </div>

          <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
            {/* Biểu đồ cột */}
            <Card>
              <CardHeader>
                <CardTitle>So sánh tổng số</CardTitle>
                <CardDescription>
                  Biểu đồ cột so sánh các loại dữ liệu trong hệ thống
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={barChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" fill="#2563eb" radius={[8, 8, 0, 0]}>
                      {barChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Biểu đồ tròn */}
            <Card>
              <CardHeader>
                <CardTitle>Phân bổ dữ liệu</CardTitle>
                <CardDescription>
                  Biểu đồ tròn thể hiện tỷ lệ phân bổ các loại dữ liệu
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${percent ? (percent * 100).toFixed(0) : 0}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}

