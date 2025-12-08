"use client"

import { useState } from "react"

interface ConfirmDialogOptions {
  title: string
  description: string
  confirmText?: string
  cancelText?: string
}

export function useConfirmDialog() {
  const [isOpen, setIsOpen] = useState(false)
  const [options, setOptions] = useState<ConfirmDialogOptions>({
    title: "",
    description: "",
  })
  const [onConfirmCallback, setOnConfirmCallback] = useState<(() => void) | null>(null)

  const confirm = (
    options: ConfirmDialogOptions,
    onConfirm: () => void
  ) => {
    setOptions(options)
    setOnConfirmCallback(() => onConfirm)
    setIsOpen(true)
  }

  const handleConfirm = () => {
    if (onConfirmCallback) {
      onConfirmCallback()
    }
    setIsOpen(false)
  }

  return {
    isOpen,
    setIsOpen,
    options,
    confirm,
    handleConfirm,
  }
}

