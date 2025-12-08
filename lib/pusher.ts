import Pusher from "pusher-js"
import { PUSHER_APP_KEY, PUSHER_CLUSTER } from "./constants"
import apiClient from "./api-client"

let pusher: Pusher | null = null

export const initializePusher = (userId: number) => {
  if (typeof window === "undefined") return null

  if (!pusher) {
    const token = localStorage.getItem("token")
    if (!PUSHER_APP_KEY) {
      console.warn("PUSHER_APP_KEY is not set")
      return null
    }
    
    console.log("Initializing Pusher with key:", PUSHER_APP_KEY, "cluster:", PUSHER_CLUSTER)
    
    pusher = new Pusher(PUSHER_APP_KEY, {
      cluster: PUSHER_CLUSTER,
      authEndpoint: `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1"}/pusher/auth`,
      auth: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
      enabledTransports: ["ws", "wss"],
    })
    
    // Log connection events
    pusher.connection.bind("connected", () => {
      console.log("Pusher connected")
    })
    
    pusher.connection.bind("disconnected", () => {
      console.log("Pusher disconnected")
    })
    
    pusher.connection.bind("error", (err: any) => {
      console.error("Pusher connection error:", err)
    })
  }

  return pusher
}

export const subscribeToNotifications = (userId: number, callback: (data: any) => void) => {
  const pusherInstance = initializePusher(userId)
  if (!pusherInstance) {
    console.warn("Pusher instance not initialized")
    return null
  }

  const channelName = `private-user-${userId}`
  console.log("Subscribing to channel:", channelName)
  
  const channel = pusherInstance.subscribe(channelName)
  
  // Lắng nghe khi subscribe thành công
  channel.bind("pusher:subscription_succeeded", () => {
    console.log("Successfully subscribed to channel:", channelName)
  })
  
  // Lắng nghe khi subscribe thất bại
  channel.bind("pusher:subscription_error", (error: any) => {
    console.error("Failed to subscribe to channel:", channelName, error)
  })
  
  // Lắng nghe event "new-notification" từ backend
  channel.bind("new-notification", (data: any) => {
    console.log("Received new-notification event:", data)
    callback(data)
  })
  
  // Lắng nghe thêm event "notification" để tương thích ngược
  channel.bind("notification", (data: any) => {
    console.log("Received notification event:", data)
    callback(data)
  })

  return () => {
    console.log("Unsubscribing from channel:", channelName)
    channel.unbind("new-notification")
    channel.unbind("notification")
    channel.unbind("pusher:subscription_succeeded")
    channel.unbind("pusher:subscription_error")
    pusherInstance.unsubscribe(channelName)
  }
}

export const disconnectPusher = () => {
  if (pusher) {
    pusher.disconnect()
    pusher = null
  }
}

export const getPusher = () => pusher

