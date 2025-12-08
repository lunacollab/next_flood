"use client"

import { usePusher } from "@/hooks/use-pusher"

export function PusherProvider({ children }: { children: React.ReactNode }) {
  usePusher()
  return <>{children}</>
}

