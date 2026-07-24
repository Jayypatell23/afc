"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { sdk } from "@/lib/medusa"
import { useCart } from "@/lib/cart-context"
import { formatPrice } from "@/lib/format-price"

interface OrderSummary {
  id: string
  display_id?: number
  status: string
  fulfillment_status?: string
  created_at: string
  total?: number
  items?: { id: string }[]
}

export default function ProfilePage() {
  const router = useRouter()
  const { clearCart } = useCart()
  const [customer, setCustomer] = useState<{ name: string; email: string } | null>(null)
  const [customerLoadFailed, setCustomerLoadFailed] = useState(false)
  const [orders, setOrders] = useState<OrderSummary[] | null>(null)
  const [isSigningOut, setIsSigningOut] = useState(false)

  useEffect(() => {
    sdk.store.customer
      .retrieve()
      .then(({ customer: c }) => {
        const name = [c.first_name, c.last_name].filter(Boolean).join(" ")
        setCustomer({ name: name || c.email, email: c.email })
      })
      .catch((e) => {
        console.error("Failed to load customer", e)
        setCustomerLoadFailed(true)
      })

    sdk.store.order
      .list({ limit: 10, fields: "id,display_id,status,fulfillment_status,created_at,total,*items" })
      .then(({ orders }) => setOrders(orders as unknown as OrderSummary[]))
      .catch((e) => {
        console.error("Failed to load orders", e)
        setOrders([])
      })
  }, [])

  const handleSignOut = async () => {
    setIsSigningOut(true)
    try {
      await sdk.auth.logout()
    } catch (e) {
      console.error("Failed to end Medusa session", e)
    }
    clearCart()
    try {
      localStorage.removeItem("ambica_cart")
    } catch (e) {
      console.error("Failed to clear cart from storage", e)
    }
    document.cookie = "auth=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
    router.push("/sign-in")
  }

  return (
    <div className="max-w-lg mx-auto px-4 sm:px-6 py-10">
      <Link
        href="/menu"
        className="inline-flex items-center gap-1 font-mono text-xs uppercase tracking-[0.07em] text-muted hover:text-dark transition-colors mb-8"
      >
        ← Menu
      </Link>

      <p
        className="font-mono text-xs uppercase tracking-[0.1em] mb-3"
        style={{ color: "var(--color-amber)" }}
      >
        Account
      </p>
      <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-dark leading-tight mb-8">
        Your account
      </h1>

      <div
        className="rounded-sm px-6 py-6 mb-8"
        style={{ background: "var(--color-card)", border: "1px solid var(--color-border)" }}
      >
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center mb-4"
          style={{ background: "var(--color-card)", border: "1px solid var(--color-border)" }}
        >
          <UserIcon />
        </div>
        {customer ? (
          <>
            <p className="font-sans text-base font-medium text-dark">{customer.name}</p>
            <p className="font-sans text-sm text-muted mt-0.5">{customer.email}</p>
          </>
        ) : customerLoadFailed ? (
          <p className="font-sans text-sm text-muted">
            We couldn&apos;t load your account details. Try signing in again.
          </p>
        ) : (
          <p className="font-sans text-sm text-muted animate-pulse">Loading…</p>
        )}
      </div>

      {/* Your Orders */}
      <div className="mb-8">
        <p
          className="font-mono text-xs uppercase tracking-[0.07em] mb-3"
          style={{ color: "var(--color-amber)" }}
        >
          Your orders
        </p>

        {orders === null ? (
          <p className="font-sans text-sm text-muted animate-pulse">Loading your orders…</p>
        ) : orders.length === 0 ? (
          <p className="font-sans text-sm text-muted">
            You haven&apos;t placed any orders yet.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {orders.map((order) => (
              <li key={order.id}>
                <Link
                  href={`/orders/${order.id}`}
                  className="flex items-center justify-between rounded-sm px-4 py-3 transition-colors hover:bg-card"
                  style={{ background: "var(--color-card)", border: "1px solid var(--color-border)" }}
                >
                  <div>
                    <p className="font-mono text-sm text-dark">
                      #{order.display_id ?? order.id.slice(0, 8).toUpperCase()}
                    </p>
                    <p className="font-sans text-xs text-muted mt-0.5">
                      {new Date(order.created_at).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                      {" · "}
                      {order.items?.length ?? 0} {(order.items?.length ?? 0) === 1 ? "item" : "items"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-sm text-dark">{formatPrice(order.total ?? 0)}</p>
                    <p className="font-sans text-xs text-muted mt-0.5 capitalize">
                      {order.fulfillment_status ?? order.status}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex flex-col gap-3">
        <Link
          href="/orders/preview"
          className="font-sans text-sm font-medium text-dark py-2.5 px-5 rounded-sm transition-colors hover:bg-card text-center"
          style={{ border: "1px solid var(--color-border-md)" }}
        >
          Track your last order
        </Link>
        <button
          type="button"
          onClick={handleSignOut}
          disabled={isSigningOut}
          className="font-sans font-semibold text-sm text-cream py-2.5 px-5 rounded-sm transition-opacity hover:opacity-90 disabled:opacity-60"
          style={{ background: "var(--color-brand)" }}
        >
          {isSigningOut ? "Signing out…" : "Sign out"}
        </button>
      </div>
    </div>
  )
}

function UserIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="var(--color-brand)"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}
