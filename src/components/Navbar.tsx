"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useCart } from "@/lib/cart-context"
import { sdk } from "@/lib/medusa"
import ThemeToggle from "@/components/ThemeToggle"

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Menu", href: "/menu" },
  { label: "Find us", href: "/find-us" },
  { label: "About", href: "/about" },
]

export default function Navbar() {
  const pathname = usePathname()
  // Auth state initialised to false so server and client first render agree.
  // The cookie is read only in useEffect (client-only, after hydration).
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const { itemCount } = useCart()

  useEffect(() => {
    const hasAuth = document.cookie.includes("auth=1")
    setTimeout(() => {
      setIsAuthenticated(hasAuth)
    }, 0)
  }, [])

  return (
    <nav
      className="sticky top-0 z-40 bg-cream border-b border-border"
      aria-label="Main navigation"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Desktop left links */}
        <div className="hidden md:flex items-center gap-7 flex-1">
          {NAV_LINKS.map(({ label, href }) => {
            const isActive = pathname === href
            return (
              <Link
                key={href}
                href={href}
                className="font-mono text-xs font-semibold uppercase tracking-[0.06em] transition-colors"
                style={{ color: isActive ? "var(--color-brand)" : "var(--color-dark)" }}
              >
                {label}
              </Link>
            )
          })}
        </div>

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <span
            className="font-heading uppercase text-dark leading-none text-center"
            style={{ fontSize: 20, letterSpacing: "0.01em" }}
          >
            Ambica
            <br />
            <span style={{ color: "var(--color-brand)" }}>Food Corner</span>
          </span>
        </Link>

        {/* Right side */}
        <div className="hidden md:flex items-center gap-4 flex-1 justify-end">
          <ThemeToggle />
          {isAuthenticated ? (
            <ProfileDropdown />
          ) : (
            <Link
              href="/sign-in"
              className="font-sans text-sm font-medium text-muted hover:text-dark transition-colors"
            >
              Sign in
            </Link>
          )}
          <Link
            href="/cart"
            className="flex items-center gap-1.5 font-mono text-sm text-dark hover:text-brand transition-colors"
          >
            <CartIcon />
            <span aria-live="polite" aria-label={`${itemCount} items in cart`}>
              ({itemCount})
            </span>
          </Link>
          <Link
            href="/menu"
            className="font-sans font-semibold text-xs uppercase tracking-[0.04em] text-cream px-5 py-2.5 rounded-full transition-transform active:scale-95 hover:opacity-90"
            style={{ background: "var(--color-brand)" }}
          >
            Order now
          </Link>
        </div>

        {/* Mobile — logo handled above; menu access lives in MobileTabBar. Theme
            toggle has no free slot in the (already full) tab bar, so it lives here. */}
        <div className="flex md:hidden items-center">
          <ThemeToggle />
        </div>
      </div>
    </nav>
  )
}

function CartIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 01-8 0" />
    </svg>
  )
}

function ProfileDropdown() {
  const [isOpen, setIsOpen] = useState(false)
  const [customer, setCustomer] = useState<{ name: string; email: string } | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const { clearCart } = useCart()

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

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
        .catch((e) => console.error("Failed to load customer", e))
    }
  }, [])

  const handleSignOut = async () => {
    try {
      await sdk.auth.logout()
    } catch (e) {
      console.error("Failed to end Medusa session", e)
    }
    // Clear cart state and local storage
    clearCart()
    try {
      localStorage.removeItem("ambica_cart")
    } catch (e) {
      console.error("Failed to clear cart from storage", e)
    }
    // Remove auth cookie
    document.cookie = "auth=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
    document.cookie = "email=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
    document.cookie = "name=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
    setIsOpen(false)
    router.push("/sign-in")
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-8 h-8 rounded-full bg-[var(--color-card)] border border-[var(--color-border)] text-dark hover:bg-[var(--color-card)] transition-colors"
        aria-label="Profile"
      >
        <UserIcon />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-cream border border-[var(--color-border)] rounded-md shadow-[0_8px_30px_rgb(0,0,0,0.08)] py-2 z-50">
          <div className="px-4 py-3 border-b border-[var(--color-border)]">
            <Link
              href="/profile"
              onClick={() => setIsOpen(false)}
              className="block group"
            >
              <p className="font-sans text-sm font-medium text-dark group-hover:text-[var(--color-brand)] transition-colors">{customer?.name ?? "…"}</p>
              <p className="font-sans text-xs text-muted truncate mt-0.5 group-hover:text-dark transition-colors">{customer?.email ?? ""}</p>
            </Link>
          </div>
          <div className="px-2 py-2 flex flex-col gap-0.5">
            <button
              onClick={handleSignOut}
              className="w-full text-left px-2 py-1.5 font-sans text-sm font-medium text-[var(--color-brand)] hover:bg-[var(--color-card)] rounded-sm transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function UserIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
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
