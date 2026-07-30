"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { sdk } from "@/lib/medusa"
import { useCart } from "@/lib/cart-context"

export default function ProfilePage() {
  const router = useRouter()
  const { clearCart } = useCart()
  const [customer, setCustomer] = useState<{ name: string; email: string } | null>(null)
  const [customerLoadFailed, setCustomerLoadFailed] = useState(false)
  const [isSigningOut, setIsSigningOut] = useState(false)

  useEffect(() => {
    const getCookie = (name: string) => {
      const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]*)'))
      return match ? decodeURIComponent(match[2]) : null
    }
    const cookieEmail = getCookie("email")
    const cookieName = getCookie("name")

    if (cookieEmail) {
      queueMicrotask(() => {
        setCustomer({ name: cookieName || cookieEmail, email: cookieEmail })
      })
    } else {
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
    }
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
    document.cookie = "email=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
    document.cookie = "name=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
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

      <div className="flex flex-col gap-3 mb-8">
        <Link
          href="/profile/past-orders"
          className="font-sans text-sm font-semibold text-center text-dark py-3 px-5 rounded-sm transition-colors hover:bg-card"
          style={{ border: "1px solid var(--color-border-md)" }}
        >
          View past orders
        </Link>
      </div>

      <div className="flex flex-col gap-3">
        <button
          type="button"
          onClick={handleSignOut}
          disabled={isSigningOut}
          className="font-sans font-semibold text-cream py-2.5 px-5 rounded-sm transition-opacity hover:opacity-90 disabled:opacity-60"
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
