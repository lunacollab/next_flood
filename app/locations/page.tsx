"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/store/auth-store"
import { useRequireAuth } from "@/hooks/use-require-auth"
import { useLocationStore } from "@/store/location-store"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Plus, Check, Search, X } from "lucide-react"
import { Location } from "@/lib/types"
import { Input } from "@/components/ui/input"
import Link from "next/link"

export default function LocationsPage() {
  const router = useRouter()
  const { isAuthenticated, user, isHydrated } = useRequireAuth()
  const {
    locations,
    userLocations,
    fetchLocations,
    fetchUserLocations,
    subscribeLocation,
    unsubscribeLocation,
    isLoading,
  } = useLocationStore()
  const [subscribingId, setSubscribingId] = useState<number | null>(null)
  const [unsubscribingId, setUnsubscribingId] = useState<number | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    // Đợi hydration xong trước khi check auth
    if (!isHydrated) return

    // Redirect admin đến trang admin
    if (user?.role === "admin") {
      router.push("/admin")
      return
    }

    if (isAuthenticated) {
      fetchLocations()
      fetchUserLocations()
    }
  }, [isHydrated, isAuthenticated, user, router, fetchLocations, fetchUserLocations])

  const handleSubscribe = async (locationId: number) => {
    if (subscribingId === locationId) return // Prevent double click
    
    setSubscribingId(locationId)
    try {
      await subscribeLocation(locationId, 1)
      // Refresh để đảm bảo state đúng
      await fetchUserLocations()
    } catch (error: any) {
      console.error("Subscribe error:", error)
      // Error handled in store, nhưng vẫn refresh để đảm bảo state đúng
      await fetchUserLocations()
    } finally {
      setSubscribingId(null)
    }
  }

  const handleUnsubscribe = async (locationId: number) => {
    if (unsubscribingId === locationId) return // Prevent double click
    
    // Tìm userLocationId từ userLocations
    const userLocation = userLocations.find((ul) => ul.location_id === locationId)
    if (!userLocation) {
      console.warn("UserLocation not found for locationId:", locationId)
      return
    }

    setUnsubscribingId(locationId)
    try {
      await unsubscribeLocation(userLocation.id)
      // Refresh để đảm bảo state đúng
      await fetchUserLocations()
    } catch (error: any) {
      console.error("Unsubscribe error:", error)
      // Error handled in store, nhưng vẫn refresh để đảm bảo state đúng
      await fetchUserLocations()
    } finally {
      setUnsubscribingId(null)
    }
  }

  const isSubscribed = (locationId: number) => {
    return userLocations.some((ul) => ul.location_id === locationId)
  }

  const getUserLocationId = (locationId: number) => {
    const userLocation = userLocations.find((ul) => ul.location_id === locationId)
    return userLocation?.id
  }

  const filteredLocations = locations.filter((location) =>
    location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    location.province.toLowerCase().includes(searchTerm.toLowerCase()) ||
    location.district?.toLowerCase().includes(searchTerm.toLowerCase())
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

  if (!isAuthenticated || user?.role === "admin") {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">Địa điểm</h1>
        <p className="text-muted-foreground text-lg">
          Chọn các địa điểm bạn muốn theo dõi để nhận cảnh báo
        </p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm địa điểm..."
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
      ) : filteredLocations.length === 0 ? (
        <Card className="border-2 border-dashed">
          <CardContent className="py-12 text-center">
            <MapPin className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <p className="text-muted-foreground">
              {searchTerm ? "Không tìm thấy địa điểm nào" : "Chưa có địa điểm nào"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredLocations.map((location) => {
            const subscribed = isSubscribed(location.id)
            return (
              <Card key={location.id} className="card-hover border-2">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <Link href={`/locations/${location.id}`} className="block">
                        <div className="mb-2 flex items-center gap-2">
                          <MapPin className="h-5 w-5 text-blue-500" />
                          <CardTitle className="line-clamp-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                            {location.name}
                          </CardTitle>
                        </div>
                      </Link>
                      <CardDescription>
                        <div className="flex items-center gap-1">
                          {location.province}
                          {location.district && `, ${location.district}`}
                          {location.ward && `, ${location.ward}`}
                        </div>
                        {location.description && (
                          <p className="mt-2 line-clamp-2">{location.description}</p>
                        )}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-sm text-muted-foreground">
                      <span className="font-medium">Tọa độ:</span> {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                    </div>
                    <div className="flex items-center justify-between">
                      {subscribed ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleUnsubscribe(location.id)}
                          disabled={unsubscribingId === location.id}
                          className="border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20 dark:hover:text-red-300"
                        >
                          {unsubscribingId === location.id ? (
                            "Đang hủy..."
                          ) : (
                            <>
                              <X className="mr-1 h-4 w-4" />
                              Bỏ theo dõi
                            </>
                          )}
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => handleSubscribe(location.id)}
                          disabled={subscribingId === location.id}
                          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                        >
                          {subscribingId === location.id ? (
                            "Đang thêm..."
                          ) : (
                            <>
                              <Plus className="mr-1 h-4 w-4" />
                              Theo dõi
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
