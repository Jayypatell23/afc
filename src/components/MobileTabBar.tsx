"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useCart } from "@/lib/cart-context"

interface Tab {
  href: string
  label: string
  icon: (props: { active: boolean }) => React.ReactElement
}

const LEFT_TABS: Tab[] = [
  { href: "/menu", label: "Menu", icon: HomeIcon },
  { href: "/find-us", label: "Find us", icon: PinIcon },
]

const ABOUT_TAB: Tab = { href: "/about", label: "About", icon: InfoIcon }

export default function MobileTabBar() {
  const pathname = usePathname()
  const { itemCount } = useCart()
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const hasAuth = document.cookie.includes("auth=1")
    setTimeout(() => {
      setIsAuthenticated(hasAuth)
    }, 0)
  }, [])

  const isActive = (href: string) =>
    pathname === href || pathname?.startsWith(`${href}/`)

  const accountTab: Tab = isAuthenticated
    ? { href: "/profile", label: "Account", icon: ProfileIcon }
    : { href: "/sign-in", label: "Sign in", icon: ProfileIcon }

  return (
    <nav
      className="md:hidden fixed inset-x-4 z-50 flex items-stretch gap-16"
      style={{ bottom: "calc(1rem + env(safe-area-inset-bottom))" }}
      aria-label="Mobile navigation"
    >
      <div className="relative flex-1 flex items-center justify-around bg-cream/95 backdrop-blur border border-[var(--color-border)] rounded-full h-16 shadow-[0_8px_24px_rgba(46,42,38,0.14)]">
        {LEFT_TABS.map((tab) => (
          <TabLink key={tab.href} tab={tab} active={isActive(tab.href)} />
        ))}
      </div>

      <div className="relative flex-1 flex items-center justify-around bg-cream/95 backdrop-blur border border-[var(--color-border)] rounded-full h-16 shadow-[0_8px_24px_rgba(46,42,38,0.14)]">
        <TabLink tab={ABOUT_TAB} active={isActive(ABOUT_TAB.href)} />
        <TabLink tab={accountTab} active={isActive(accountTab.href)} />
      </div>

      <Link
        href="/cart"
        aria-label={`Cart, ${itemCount} item${itemCount === 1 ? "" : "s"}`}
        className="absolute left-1/2 -translate-x-1/2 -top-5 w-16 h-16 rounded-full bg-[var(--color-brand)] text-cream flex items-center justify-center shadow-[0_10px_24px_rgba(168,103,74,0.45)] active:scale-95 transition-transform"
      >
        <CartIcon />
        {itemCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-dark text-cream text-[10px] font-mono leading-none flex items-center justify-center">
            {itemCount}
          </span>
        )}
      </Link>
    </nav>
  )
}

function TabLink({ tab, active }: { tab: Tab; active: boolean }) {
  const Icon = tab.icon
  return (
    <Link href={tab.href} aria-label={tab.label} className="flex items-center justify-center">
      <span
        className="flex items-center justify-center w-11 h-11 rounded-full transition-colors"
        style={{ backgroundColor: active ? "var(--color-card)" : "transparent" }}
      >
        <Icon active={active} />
      </span>
    </Link>
  )
}

function iconColor(active: boolean) {
  return active ? "var(--color-brand)" : "var(--color-faint)"
}

function HomeIcon({ active }: { active: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={iconColor(active)} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 11l9-8 9 8" />
      <path d="M5 10v10a1 1 0 001 1h4v-6h4v6h4a1 1 0 001-1V10" />
    </svg>
  )
}

function PinIcon({ active }: { active: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={iconColor(active)} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 22s7-7.58 7-13A7 7 0 0 0 5 9c0 5.42 7 13 7 13z" />
      <circle cx="12" cy="9" r="2.5" />
    </svg>
  )
}

function InfoIcon({ active }: { active: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={iconColor(active)} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <line x1="12" y1="11" x2="12" y2="16" />
      <line x1="12" y1="7.5" x2="12" y2="7.51" />
    </svg>
  )
}

function ProfileIcon({ active }: { active: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={iconColor(active)} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}

function CartIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 01-8 0" />
    </svg>
  )
}
