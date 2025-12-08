"use client"

import { useEffect } from "react"
import { useAuthStore } from "@/store/auth-store"
import { useNotificationStore } from "@/store/notification-store"
import { useAlertStore } from "@/store/alert-store"
import { subscribeToNotifications, disconnectPusher } from "@/lib/pusher"

export function usePusher() {
  const { user, isAuthenticated } = useAuthStore()
  const { fetchNotifications } = useNotificationStore()
  const { fetchAlerts } = useAlertStore()

  useEffect(() => {
    if (!isAuthenticated || !user) {
      disconnectPusher()
      return
    }

    const unsubscribe = subscribeToNotifications(user.id, (data: any) => {
      console.log("Pusher notification received:", data)
      
      // Refresh notifications when new one arrives
      fetchNotifications()
      
      // Nếu là notification về alert, refresh alerts list
      if (data.type === "alert" || data.alert_id) {
        fetchAlerts()
      }
    })

    return () => {
      if (unsubscribe) {
        unsubscribe()
      }
    }
  }, [isAuthenticated, user, fetchNotifications, fetchAlerts])
}

