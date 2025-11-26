"use client"

import { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import { Location, Alert } from "@/lib/types"
import { ALERT_LEVELS } from "@/lib/constants"

interface FloodMapProps {
  locations?: Location[]
  alerts?: Alert[]
  center?: [number, number]
  zoom?: number
  height?: string
  showAlerts?: boolean
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
const Circle = dynamic(
  () => import("react-leaflet").then((mod) => mod.Circle),
  { ssr: false }
)

export function FloodMap({
  locations = [],
  alerts = [],
  center = [16.0544, 108.2022], // Đà Nẵng
  zoom = 11,
  height = "500px",
  showAlerts = true,
}: FloodMapProps) {
  const [isClient, setIsClient] = useState(false)
  const [leafletLoaded, setLeafletLoaded] = useState(false)

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

  const getAlertColor = (level: string) => {
    switch (level) {
      case "info":
        return "#3b82f6"
      case "warning":
        return "#eab308"
      case "danger":
        return "#f97316"
      case "critical":
        return "#ef4444"
      default:
        return "#3b82f6"
    }
  }

  const getAlertRadius = (level: string) => {
    switch (level) {
      case "info":
        return 2000
      case "warning":
        return 3000
      case "danger":
        return 4000
      case "critical":
        return 5000
      default:
        return 2000
    }
  }

  const createCustomIcon = async (color: string) => {
    if (typeof window === "undefined" || !leafletLoaded) return undefined
    try {
      const L = await import("leaflet")
      const Leaflet = (L as any).default || L
      if (Leaflet && Leaflet.divIcon) {
        return Leaflet.divIcon({
          className: "custom-marker",
          html: `<div style="
            background-color: ${color};
            width: 24px;
            height: 24px;
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          "></div>`,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        })
      }
    } catch (error) {
      console.error("Failed to create custom icon:", error)
    }
    return undefined
  }

  if (!isClient || !leafletLoaded) {
    return (
      <div
        style={{ height, width: "100%" }}
        className="rounded-lg bg-muted animate-pulse flex items-center justify-center border-2"
      >
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent mb-2"></div>
          <p className="text-sm text-muted-foreground">Đang tải bản đồ...</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ height, width: "100%" }} className="rounded-lg overflow-hidden border-2 border-border shadow-lg bg-background">
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: "100%", width: "100%", zIndex: 0 }}
        scrollWheelZoom={true}
        key={`map-${isClient}`}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Location markers */}
        {locations.map((location) => {
          const locationAlerts = alerts.filter((a) => a.location_id === location.id)
          const hasActiveAlert = locationAlerts.some((a) => a.is_active)
          const highestAlert = locationAlerts
            .filter((a) => a.is_active)
            .sort((a, b) => {
              const levels = { info: 1, warning: 2, danger: 3, critical: 4 }
              return levels[b.level as keyof typeof levels] - levels[a.level as keyof typeof levels]
            })[0]

          return (
            <div key={location.id}>
              {/* Alert circle */}
              {showAlerts && highestAlert && (
                <Circle
                  center={[location.latitude, location.longitude]}
                  radius={getAlertRadius(highestAlert.level)}
                  pathOptions={{
                    color: getAlertColor(highestAlert.level),
                    fillColor: getAlertColor(highestAlert.level),
                    fillOpacity: 0.2,
                    weight: 2,
                  }}
                />
              )}

              {/* Location marker */}
              <Marker
                position={[location.latitude, location.longitude]}
              >
                <Popup>
                  <div className="p-2">
                    <h3 className="font-semibold text-sm mb-1">{location.name}</h3>
                    <p className="text-xs text-muted-foreground">
                      {location.province}
                      {location.district && `, ${location.district}`}
                    </p>
                    {highestAlert && (
                      <div className="mt-2">
                        <span
                          className="text-xs px-2 py-1 rounded text-white"
                          style={{ backgroundColor: getAlertColor(highestAlert.level) }}
                        >
                          {ALERT_LEVELS[highestAlert.level as keyof typeof ALERT_LEVELS].label}
                        </span>
                      </div>
                    )}
                  </div>
                </Popup>
              </Marker>
            </div>
          )
        })}
      </MapContainer>
    </div>
  )
}
