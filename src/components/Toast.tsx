"use client"

import { useEffect } from "react"

interface ToastProps {
  message: string
  price?: number
  visible: boolean
  onDismiss: () => void
}

export default function Toast({ message, price, visible, onDismiss }: ToastProps) {
  useEffect(() => {
    if (!visible) return
    const t = setTimeout(onDismiss, 2800)
    return () => clearTimeout(t)
  }, [visible, onDismiss])

  if (!visible) return null

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-6 left-1/2 z-50"
      style={{
        transform: "translateX(-50%)",
        animation: "afc-fade-up 0.2s ease-out",
      }}
    >
      <div
        className="flex items-center gap-3 rounded-sm px-5 py-3 shadow-lg"
        style={{ background: "#241f1b", color: "#f6f1e8", minWidth: 220 }}
      >
        <span className="font-sans text-sm">{message}</span>
        {price !== undefined && (
          <span className="font-mono text-sm ml-auto" style={{ color: "#e3a98f" }}>
            £{price.toFixed(2)}
          </span>
        )}
      </div>
    </div>
  )
}
