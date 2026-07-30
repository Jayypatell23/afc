"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { sdk } from "@/lib/medusa"
import { formatPrice } from "@/lib/format-price"

interface OrderSummary {
  id: string
  display_id?: number
  status: string
  fulfillment_status?: string
  created_at: string
  total?: number
  items?: {
    id: string
    title: string
    quantity: number
    unit_price: number
  }[]
}

export default function PastOrdersPage() {
  const [orders, setOrders] = useState<OrderSummary[] | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    const getCookie = (name: string) => {
      const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]*)'))
      return match ? decodeURIComponent(match[2]) : null
    }
    const cookieEmail = getCookie("email")

    if (cookieEmail) {
      sdk.client.fetch<{ orders: OrderSummary[] }>("/store/customers/email-orders", {
        query: { email: cookieEmail }
      })
      .then(({ orders }) => {
        // Only show delivered orders in past orders
        const past = orders.filter((o) => o.fulfillment_status === "delivered")
        setOrders(past)
      })
      .catch((e) => {
        console.error("Failed to load email orders", e)
        setError(true)
        setOrders([])
      })
    } else {
      queueMicrotask(() => {
        setOrders([])
      })
    }
  }, [])

  return (
    <div className="max-w-lg mx-auto px-4 sm:px-6 py-10">
      <Link
        href="/profile"
        className="inline-flex items-center gap-1 font-mono text-xs uppercase tracking-[0.07em] text-muted hover:text-dark transition-colors mb-8"
      >
        ← Profile
      </Link>

      <p
        className="font-mono text-xs uppercase tracking-[0.1em] mb-3"
        style={{ color: "var(--color-amber)" }}
      >
        History
      </p>
      <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-dark leading-tight mb-8">
        Past Orders
      </h1>

      {orders === null ? (
        <p className="font-sans text-sm text-muted animate-pulse">Loading past orders…</p>
      ) : error ? (
        <p className="font-sans text-sm text-muted">Failed to load past orders.</p>
      ) : orders.length === 0 ? (
        <p className="font-sans text-sm text-muted">You haven&apos;t placed any orders yet, or they haven&apos;t been completed.</p>
      ) : (
        <ul className="flex flex-col gap-4">
          {orders.map((order) => (
            <li key={order.id} className="rounded-sm p-4" style={{ background: "var(--color-card)", border: "1px solid var(--color-border)" }}>
              <div className="flex items-center justify-between border-b pb-2 mb-2" style={{ borderColor: "var(--color-border)" }}>
                <div>
                  <p className="font-mono text-sm text-dark font-semibold">
                    #{order.display_id ?? order.id.slice(0, 8).toUpperCase()}
                  </p>
                  <p className="font-sans text-xs text-muted mt-0.5">
                    {new Date(order.created_at).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-sm text-dark font-semibold">
                    {formatPrice(order.total ?? 0)}
                  </p>
                  <p className="font-sans text-xs text-brand font-medium mt-0.5 capitalize">
                    {order.fulfillment_status ?? order.status}
                  </p>
                </div>
              </div>

              {/* Items List */}
              <div className="flex flex-col gap-1">
                {order.items?.map((item, idx) => (
                  <div key={idx} className="flex justify-between font-sans text-xs text-muted">
                    <span>{item.quantity} × {item.title}</span>
                    <span>{formatPrice(item.unit_price * item.quantity)}</span>
                  </div>
                ))}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
