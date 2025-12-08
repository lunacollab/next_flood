import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, Users, BookOpen, Zap, Bell } from "lucide-react"
import { FloodMap } from "@/components/map/flood-map"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section - Dark Theme */}
      <section className="relative overflow-hidden gradient-hero-dark text-white">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djJoLTJ2LTJoMnptMC0yMHYyaC0ydi0yaDJ6TTIwIDM0djJoLTJ2LTJoMnptMC0yMHYyaC0ydi0yaDJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-20 dark:opacity-10"></div>
        <div className="container relative mx-auto px-4 py-20 sm:py-32 lg:py-40">
          <div className="mx-auto max-w-5xl text-center animate-fade-in-up">
            <div className="mb-6 sm:mb-8 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 backdrop-blur-md px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm shadow-lg animate-fade-in">
              <Zap className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-300 animate-pulse" />
              <span className="font-medium">Cảnh báo thời gian thực</span>
            </div>
            <h1 className="mb-4 sm:mb-6 text-3xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold tracking-tight leading-tight">
              Hệ thống cảnh báo lũ lụt
              <br />
              <span className="bg-gradient-to-r from-blue-300 via-blue-200 to-cyan-300 bg-clip-text text-transparent animate-pulse">
                thời gian thực
              </span>
            </h1>
            <p className="mb-8 sm:mb-12 text-base sm:text-xl lg:text-2xl text-blue-100 max-w-3xl mx-auto leading-relaxed px-4">
              Nhận cảnh báo sớm về nguy cơ lũ lụt tại địa điểm của bạn. Bảo vệ bản thân và gia đình với thông tin cập nhật liên tục.
            </p>
            <div className="flex flex-col gap-3 sm:gap-4 sm:flex-row sm:justify-center px-4 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
              <Link href="/register" className="w-full sm:w-auto">
                <Button 
                  size="lg" 
                  className="w-full sm:w-auto bg-white text-blue-600 hover:bg-blue-50 text-base sm:text-lg px-8 sm:px-10 py-6 sm:py-7 shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 font-semibold rounded-xl"
                >
                  Bắt đầu ngay
                </Button>
              </Link>
              <Link href="/login" className="w-full sm:w-auto">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="w-full sm:w-auto text-base sm:text-lg px-8 sm:px-10 py-6 sm:py-7 border-2 border-white/30 bg-white/5 backdrop-blur-md hover:bg-white/10 hover:border-white/50 transition-all duration-300 font-semibold rounded-xl"
                >
                  Đăng nhập
                </Button>
              </Link>
            </div>
          </div>
        </div>
        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg className="w-full h-12 sm:h-16 fill-white dark:fill-gray-900" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M0,0 C150,80 350,40 600,60 C850,80 1050,40 1200,60 L1200,120 L0,120 Z"></path>
          </svg>
        </div>
      </section>

      {/* Map Preview Section */}
      <section className="container mx-auto px-4 py-12 sm:py-16 lg:py-20 -mt-6 sm:-mt-8 relative z-10 bg-gradient-to-b from-white to-gray-50/50 dark:from-transparent dark:to-transparent">
        <div className="mb-8 sm:mb-12 text-center animate-fade-in-up">
          <h2 className="mb-3 sm:mb-4 text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground">Bản đồ cảnh báo lũ lụt</h2>
          <p className="text-sm sm:text-base lg:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
            Xem các khu vực có nguy cơ lũ lụt trên bản đồ tương tác
          </p>
        </div>
        <div className="rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl border-2 sm:border-4 border-border animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
          <FloodMap height="400px" />
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-12 sm:py-16 lg:py-20 bg-background">
        <div className="mb-10 sm:mb-16 text-center animate-fade-in-up">
          <h2 className="mb-3 sm:mb-4 text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground">Tính năng chính</h2>
          <p className="text-sm sm:text-base lg:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
            Các tính năng giúp bạn luôn an toàn
          </p>
        </div>
        <div className="grid gap-6 sm:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="card-hover border-2 border-border shadow-xl bg-card backdrop-blur-sm animate-fade-in-up hover:shadow-2xl hover:border-primary transition-all duration-300" style={{ animationDelay: "0.1s" }}>
            <CardHeader className="pb-4">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg">
                <Bell className="h-8 w-8" />
              </div>
              <CardTitle className="text-xl mb-2 text-foreground">Cảnh báo thời gian thực</CardTitle>
              <CardDescription className="text-base leading-relaxed text-muted-foreground">
                Nhận thông báo ngay lập tức khi có nguy cơ lũ lụt tại địa điểm bạn quan tâm
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="card-hover border-2 border-border shadow-xl bg-card backdrop-blur-sm animate-fade-in-up hover:shadow-2xl hover:border-primary transition-all duration-300" style={{ animationDelay: "0.2s" }}>
            <CardHeader className="pb-4">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg">
                <MapPin className="h-8 w-8" />
              </div>
              <CardTitle className="text-xl mb-2 text-foreground">Theo dõi địa điểm</CardTitle>
              <CardDescription className="text-base leading-relaxed text-muted-foreground">
                Chọn và theo dõi nhiều địa điểm để nhận cảnh báo cho từng khu vực
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="card-hover border-2 border-border shadow-xl bg-card backdrop-blur-sm animate-fade-in-up hover:shadow-2xl hover:border-primary transition-all duration-300" style={{ animationDelay: "0.3s" }}>
            <CardHeader className="pb-4">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg">
                <Users className="h-8 w-8" />
              </div>
              <CardTitle className="text-xl mb-2 text-foreground">Thông báo người thân</CardTitle>
              <CardDescription className="text-base leading-relaxed text-muted-foreground">
                Tự động thông báo cho người thân khi bạn gặp nguy hiểm
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="card-hover border-2 border-border shadow-xl bg-card backdrop-blur-sm animate-fade-in-up hover:shadow-2xl hover:border-primary transition-all duration-300" style={{ animationDelay: "0.4s" }}>
            <CardHeader className="pb-4">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg">
                <BookOpen className="h-8 w-8" />
              </div>
              <CardTitle className="text-xl mb-2 text-foreground">Kiến thức an toàn</CardTitle>
              <CardDescription className="text-base leading-relaxed text-muted-foreground">
                Hướng dẫn chi tiết về cách ứng phó và phòng chống lũ lụt
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 dark:from-blue-900 dark:via-blue-800 dark:to-blue-900 text-white py-12 sm:py-16 lg:py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzR2MmgtMnYtMmgyem0wLTIwdjJoLTJ2LTJoMnptLTE2IDM0djJoLTJ2LTJoMnptMC0yMHYyaC0ydi0yaDJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-20"></div>
        <div className="container relative mx-auto px-4">
          <div className="grid gap-8 sm:gap-12 grid-cols-1 sm:grid-cols-3">
            <div className="text-center animate-fade-in-up">
              <div className="mb-3 sm:mb-4 text-4xl sm:text-5xl lg:text-6xl font-extrabold text-blue-200">24/7</div>
              <div className="text-base sm:text-lg lg:text-xl text-blue-100 font-medium">Giám sát liên tục</div>
            </div>
            <div className="text-center animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
              <div className="mb-3 sm:mb-4 text-4xl sm:text-5xl lg:text-6xl font-extrabold text-blue-200">100%</div>
              <div className="text-base sm:text-lg lg:text-xl text-blue-100 font-medium">Miễn phí</div>
            </div>
            <div className="text-center animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
              <div className="mb-3 sm:mb-4 text-4xl sm:text-5xl lg:text-6xl font-extrabold text-blue-200">Real-time</div>
              <div className="text-base sm:text-lg lg:text-xl text-blue-100 font-medium">Cập nhật tức thì</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-12 sm:py-16 lg:py-20 bg-background">
        <Card className="border-2 border-border shadow-2xl bg-card overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-transparent to-blue-500/5"></div>
          <CardContent className="p-8 sm:p-12 lg:p-16 text-center relative">
            <h2 className="mb-4 sm:mb-6 text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground">Sẵn sàng bảo vệ gia đình bạn?</h2>
            <p className="mb-8 sm:mb-10 text-base sm:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto">
              Đăng ký ngay để nhận cảnh báo sớm và thông tin hữu ích về phòng chống lũ lụt
            </p>
            <Link href="/register">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-600 hover:from-blue-700 hover:to-blue-800 dark:hover:from-blue-600 dark:hover:to-blue-700 text-base sm:text-lg px-8 sm:px-12 py-6 sm:py-7 shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 font-semibold rounded-xl text-white"
              >
                Đăng ký miễn phí
              </Button>
            </Link>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
