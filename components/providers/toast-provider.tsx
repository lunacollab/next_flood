"use client"

import { Toaster } from "sonner"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

export function ToastProvider() {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <Toaster position="top-right" richColors />
  }

  return (
    <Toaster
      position="top-right"
      richColors
      theme={theme === "dark" ? "dark" : "light"}
    />
  )
}

