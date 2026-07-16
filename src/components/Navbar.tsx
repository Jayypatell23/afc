"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useCart } from "@/lib/cart-context"

const NAV_LINKS = [
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
    setIsAuthenticated(document.cookie.includes("auth=1"))
  }, [])

  return (
    <nav
      className="sticky top-0 z-40 bg-cream border-b border-border"
      aria-label="Main navigation"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <span
            className="inline-block rounded-sm bg-brand"
            style={{ width: 10, height: 10 }}
            aria-hidden="true"
          />
          <span
            className="font-serif font-semibold text-dark leading-none"
            style={{ fontSize: 26 }}
          >
            Ambica
          </span>
        </Link>

        {/* Desktop center links */}
        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map(({ label, href }) => {
            const isActive = pathname === href
            return (
              <Link
                key={href}
                href={href}
                className="font-sans text-sm font-medium transition-colors"
                style={{
                  color: isActive ? "var(--color-dark)" : "var(--color-faint)",
                  borderBottom: isActive ? "2px solid var(--color-dark)" : "2px solid transparent",
                  paddingBottom: 2,
                }}
              >
                {label}
              </Link>
            )
          })}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <ProfileDropdown />
          ) : (
            <Link
              href="/sign-in"
              className="hidden md:inline-flex font-sans text-sm font-medium text-muted hover:text-dark transition-colors"
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

  const handleSignOut = () => {
    // Clear cart state and local storage
    clearCart()
    try {
      localStorage.removeItem("ambica_cart")
    } catch (e) {
      console.error("Failed to clear cart from storage", e)
    }
    // Remove auth cookie
    document.cookie = "auth=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
    setIsOpen(false)
    router.push("/sign-in")
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-8 h-8 rounded-full bg-[#f7f4ed] border border-[var(--color-border)] text-dark hover:bg-[var(--color-card)] transition-colors"
        aria-label="Profile"
      >
        <UserIcon />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-cream border border-[var(--color-border)] rounded-md shadow-[0_8px_30px_rgb(0,0,0,0.08)] py-2 z-50">
          <div className="px-4 py-3 border-b border-[var(--color-border)]">
            <p className="font-sans text-sm font-medium text-dark">Demo User</p>
            <p className="font-sans text-xs text-muted truncate mt-0.5">demo@example.com</p>
          </div>
          <div className="px-2 py-2">
            <button
              onClick={handleSignOut}
              className="w-full text-left px-2 py-1.5 font-sans text-sm font-medium text-[var(--color-brand)] hover:bg-[#f7f4ed] rounded-sm transition-colors"
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
