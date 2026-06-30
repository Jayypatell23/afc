"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useCart } from "@/lib/cart-context"

const NAV_LINKS = [
  { label: "Menu", href: "/" },
  { label: "Find us", href: "/find-us" },
  { label: "About", href: "/about" },
]

export default function Navbar() {
  const pathname = usePathname()
  const { itemCount } = useCart()

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
                  color: isActive ? "#241f1b" : "#9a8d79",
                  borderBottom: isActive ? "2px solid #241f1b" : "2px solid transparent",
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
          <Link
            href="/sign-in"
            className="hidden md:inline-flex font-sans text-sm font-medium text-muted hover:text-dark transition-colors"
          >
            Sign in
          </Link>
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
