"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { useCart } from "@/lib/cart-context"
import CartItem from "@/components/CartItem"
import { formatPrice } from "@/lib/format-price"
import EmptyState from "@/components/EmptyState"
import { sdk } from "@/lib/medusa"

interface OrderItem {
  title: string
  quantity: number
  unit_price: number
}

interface OrderSummary {
  id: string
  customer_order_number?: number
  status: string
  fulfillment_status?: string
  created_at: string
  total: number
  items?: OrderItem[]
}

const ACTIVE_STATUSES = new Set(["not_fulfilled", "in_progress", "shipped"])

function getCookie(name: string) {
  if (typeof document === "undefined") return null
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]*)'))
  return match ? decodeURIComponent(match[2]) : null
}

async function fetchActiveOrders(email: string): Promise<OrderSummary[]> {
  const { orders } = await sdk.client.fetch<{ orders: OrderSummary[] }>(
    "/store/customers/email-orders",
    { query: { email } }
  )
  return orders.filter((o) => ACTIVE_STATUSES.has(o.fulfillment_status ?? ""))
}

export default function CartPage() {
  const { items, subtotal, isLoaded } = useCart()
  const [activeOrders, setActiveOrders] = useState<OrderSummary[]>([])
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const orderTotal = subtotal

  useEffect(() => {
    const email = getCookie("email")
    if (!email) return

    // Initial fetch
    fetchActiveOrders(email).then(setActiveOrders).catch(console.error)

    // Poll every 20 seconds so fulfilled orders disappear automatically
    pollRef.current = setInterval(() => {
      fetchActiveOrders(email).then(setActiveOrders).catch(console.error)
    }, 20_000)

    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
    }
  }, [])

  if (!isLoaded) {
    return (
      <div className="max-w-xl mx-auto px-4 sm:px-6 py-8 flex items-center justify-center min-h-[300px]">
        <p className="font-sans text-sm text-muted animate-pulse">Loading your order...</p>
      </div>
    )
  }

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 py-8">

      {items.length === 0 ? (
        <EmptyState
          title="Your basket is empty"
          description="Add something delicious from the menu."
          action={
            <Link
              href="/menu"
              className="inline-block font-mono text-xs uppercase tracking-[0.07em] text-brand hover:underline"
            >
              Browse the menu →
            </Link>
          }
        />
      ) : (
        <>
          <ul className="flex flex-col gap-3 mb-6 pt-2">
            {items.map((item) => (
              <CartItem key={item.variantId} item={item} />
            ))}
          </ul>

          {/* Totals */}
          <div
            className="flex flex-col gap-2 py-4 mb-6"
            style={{ borderTop: "1px solid var(--color-border)" }}
          >
            <div className="flex justify-between">
              <span className="font-sans text-sm text-muted">Subtotal</span>
              <span className="font-mono text-sm text-dark">{formatPrice(subtotal)}</span>
            </div>
            <div
              className="flex justify-between pt-3 mt-1"
              style={{ borderTop: "1px solid var(--color-border)" }}
            >
              <span className="font-sans font-semibold text-sm text-dark">Total</span>
              <span className="font-mono font-medium text-sm text-dark">
                {formatPrice(orderTotal)}
              </span>
            </div>
          </div>

          {/* Checkout button */}
          <Link
            href="/checkout"
            className="block w-full text-center font-sans font-semibold text-sm text-cream py-3.5 rounded-sm transition-opacity hover:opacity-90"
            style={{ background: "var(--color-brand)" }}
          >
            Checkout — {formatPrice(orderTotal)}
          </Link>

          <div className="text-center mt-4">
            <Link
              href="/"
              className="font-mono text-xs uppercase tracking-[0.07em] text-muted hover:text-dark transition-colors"
            >
              + Add more from the menu
            </Link>
          </div>
        </>
      )}

      {/* Your orders — live/active only, auto-updates via polling */}
      {activeOrders.length > 0 && (
        <div className="mt-12 pt-8" style={{ borderTop: "1px solid var(--color-border)" }}>
          <h2 className="font-serif text-xl sm:text-2xl font-semibold text-dark mb-4">
            Your orders
          </h2>
          <ul className="flex flex-col gap-4">
            {activeOrders.map((order) => (
              <li
                key={order.id}
                className="rounded-sm p-4"
                style={{ background: "var(--color-card)", border: "1px solid var(--color-border)" }}
              >
                <div
                  className="flex items-center justify-between pb-2 mb-2"
                  style={{ borderBottom: "1px solid var(--color-border)" }}
                >
                  <div>
                    <Link
                      href={`/orders/${order.id}`}
                      className="font-mono text-sm text-brand font-semibold hover:underline"
                    >
                      #{order.customer_order_number ?? order.id.slice(0, 8).toUpperCase()}
                    </Link>
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
                      {formatPrice(order.total)}
                    </p>
                    <p className="font-sans text-xs text-brand font-medium mt-0.5 capitalize">
                      {order.fulfillment_status?.replace("_", " ") ?? order.status}
                    </p>
                  </div>
                </div>

                {/* Items */}
                <div className="flex flex-col gap-1">
                  {order.items?.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between font-sans text-xs text-muted"
                    >
                      <span>{item.quantity} × {item.title}</span>
                      <span>{formatPrice(item.unit_price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
