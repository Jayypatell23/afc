"use client"

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react"
import { sdk } from "@/lib/medusa"

interface OrderStatusValue {
  acceptingOrders: boolean
  message: string | null
  isLoaded: boolean
}

const OrderStatusContext = createContext<OrderStatusValue | null>(null)

// Admin can flip the "accepting orders" toggle at any time — poll so an
// already-open tab picks up the change without a manual refresh.
const POLL_INTERVAL_MS = 60_000

export function OrderStatusProvider({ children }: { children: ReactNode }) {
  // Default to open: while the first fetch is in flight (or if it fails)
  // customers shouldn't be blocked from browsing/ordering.
  const [acceptingOrders, setAcceptingOrders] = useState(true)
  const [message, setMessage] = useState<string | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  const fetchStatus = useCallback(() => {
    sdk.client
      .fetch<{ accepting_orders: boolean; message: string | null }>("/store/order-status")
      .then(({ accepting_orders, message }) => {
        setAcceptingOrders(accepting_orders)
        setMessage(message)
      })
      .catch((e) => console.error("Failed to load order status", e))
      .finally(() => setIsLoaded(true))
  }, [])

  useEffect(() => {
    fetchStatus()
    const interval = setInterval(fetchStatus, POLL_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [fetchStatus])

  return (
    <OrderStatusContext.Provider value={{ acceptingOrders, message, isLoaded }}>
      {children}
    </OrderStatusContext.Provider>
  )
}

export function useOrderStatus(): OrderStatusValue {
  const ctx = useContext(OrderStatusContext)
  if (!ctx) throw new Error("useOrderStatus must be used within OrderStatusProvider")
  return ctx
}
