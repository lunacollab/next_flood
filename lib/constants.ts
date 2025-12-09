export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL
export const UPLOADS_BASE_URL = process.env.NEXT_PUBLIC_UPLOADS_URL 

export const PUSHER_APP_KEY = process.env.NEXT_PUBLIC_PUSHER_KEY || ""
export const PUSHER_CLUSTER = process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "ap1"

export const ALERT_LEVELS = {
  info: {
    label: "Thông tin",
    color: "bg-blue-500",
    textColor: "text-blue-700",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
  },
  warning: {
    label: "Cảnh báo",
    color: "bg-yellow-500",
    textColor: "text-yellow-700",
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-200",
  },
  danger: {
    label: "Nguy hiểm",
    color: "bg-orange-500",
    textColor: "text-orange-700",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
  },
  critical: {
    label: "Rất nguy hiểm",
    color: "bg-red-500",
    textColor: "text-red-700",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
  },
} as const

export type AlertLevel = keyof typeof ALERT_LEVELS

