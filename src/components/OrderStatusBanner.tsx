"use client"

import { useOrderStatus } from "@/lib/order-status-context"

export default function OrderStatusBanner() {
  const { acceptingOrders, message, isLoaded } = useOrderStatus()

  if (!isLoaded || acceptingOrders) return null

  return (
    <div
      role="status"
      className="print:hidden font-mono text-xs sm:text-sm text-center px-4 py-2.5"
      style={{ background: "var(--color-brand)", color: "var(--color-cream)" }}
    >
      {message ?? "We're not accepting orders right now."}
    </div>
  )
}
