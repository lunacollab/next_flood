"use client"

import { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import { MapPin } from "lucide-react"
import type { MapContainerProps } from "react-leaflet"

interface LocationPickerMapProps {
  center?: [number, number]
  zoom?: number
  height?: string
  onLocationSelect?: (lat: number, lng: number) => void
  selectedPosition?: [number, number] | null
}

// Dynamically import map components to avoid SSR issues
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
)
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
)
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
)
const Popup = dynamic(
  () => import("react-leaflet").then((mod) => mod.Popup),
  { ssr: false }
)
const MapClickHandler = dynamic(
  () => import("./map-click-handler").then((mod) => ({ default: mod.MapClickHandler })),
  { ssr: false }
)

export function LocationPickerMap({
  center = [16.0544, 108.2022], // Đà Nẵng
  zoom = 11,
  height = "400px",
  onLocationSelect,
  selectedPosition,
}: LocationPickerMapProps) {
  const [isClient, setIsClient] = useState(false)
  const [leafletLoaded, setLeafletLoaded] = useState(false)
  const [markerPosition, setMarkerPosition] = useState<[number, number] | null>(selectedPosition || null)

  useEffect(() => {
    setIsClient(true)
    const loadLeaflet = async () => {
      try {
        if (typeof window !== "undefined") {
          const L = await import("leaflet")
          const Leaflet = (L as any).default || L

          // Fix default marker icon
          if (Leaflet && Leaflet.Icon && Leaflet.Icon.Default) {
            delete (Leaflet.Icon.Default.prototype as any)._getIconUrl
            Leaflet.Icon.Default.mergeOptions({
              iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
              iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
              shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
            })
          }
          setLeafletLoaded(true)
        }
      } catch (error) {
        console.error("Failed to load Leaflet:", error)
      }
    }
    loadLeaflet()
  }, [])

  useEffect(() => {
    if (selectedPosition) {
      setMarkerPosition(selectedPosition)
    }
  }, [selectedPosition])

  const handleMapClick = (lat: number, lng: number) => {
    setMarkerPosition([lat, lng])
    if (onLocationSelect) {
      onLocationSelect(lat, lng)
    }
  }

  if (!isClient || !leafletLoaded) {
    return (
      <div
        className="flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg border"
        style={{ height }}
      >
        <div className="text-center">
          <MapPin className="h-8 w-8 mx-auto mb-2 text-muted-foreground animate-pulse" />
          <p className="text-sm text-muted-foreground">Đang tải bản đồ...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full rounded-lg overflow-hidden border" style={{ height }}>
      <MapContainer
        center={markerPosition || center}
        zoom={zoom}
        style={{ height: "100%", width: "100%" }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapClickHandler onLocationSelect={handleMapClick} />
        {markerPosition && (
          <Marker position={markerPosition}>
            <Popup>
              <div className="p-2">
                <p className="text-sm font-semibold">Vị trí đã chọn</p>
                <p className="text-xs text-muted-foreground">
                  {markerPosition[0].toFixed(6)}, {markerPosition[1].toFixed(6)}
                </p>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  )
}

