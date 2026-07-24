import Link from "next/link"
import {
  ChefHatIcon,
  CoffeeIcon,
  IceCreamIcon,
  PizzaIcon,
  UtensilsIcon,
} from "./AuthIcons"

type AuthTab = "sign-in" | "sign-up"

const TABS: { id: AuthTab; label: string; href: string }[] = [
  { id: "sign-in", label: "Sign in", href: "/sign-in" },
  { id: "sign-up", label: "Create account", href: "/sign-up" },
]

export default function AuthShell({
  activeTab,
  title,
  subtitle,
  children,
}: {
  activeTab: AuthTab
  title: string
  subtitle: string
  children: React.ReactNode
}) {
  return (
    <div className="min-h-[calc(100vh-56px)] lg:grid lg:grid-cols-2">
      {/* Form column */}
      <div className="flex items-center justify-center px-4 sm:px-6 py-10 lg:py-16 relative overflow-hidden">
        {/* Ambient decorative icons, mirrors the illustration panel's motif for
            screens below `lg` where that panel is hidden entirely. */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden lg:hidden" aria-hidden="true">
          <CoffeeIcon className="absolute text-[var(--color-brand)] opacity-[0.04] w-48 h-48 -rotate-12 top-10 left-[-2rem]" />
          <PizzaIcon className="absolute text-[var(--color-brand)] opacity-[0.04] w-56 h-56 rotate-12 bottom-20 left-[-4rem]" />
          <UtensilsIcon className="absolute text-[var(--color-brand)] opacity-[0.04] w-32 h-32 rotate-45 top-32 right-[-2rem]" />
          <IceCreamIcon className="absolute text-[var(--color-brand)] opacity-[0.04] w-44 h-44 -rotate-[20deg] bottom-10 right-[-2rem]" />
        </div>

        <div className="w-full max-w-sm relative z-10">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 mb-8 w-fit">
            <span
              className="inline-block rounded-sm bg-brand"
              style={{ width: 10, height: 10 }}
              aria-hidden="true"
            />
            <span className="font-serif font-semibold text-dark leading-none" style={{ fontSize: 26 }}>
              Ambica
            </span>
          </Link>

          {/* Tab switcher */}
          <div
            role="tablist"
            aria-label="Account access"
            className="inline-flex p-1 rounded-md mb-8 gap-1"
            style={{ background: "var(--color-card)" }}
          >
            {TABS.map((tab) => {
              const isActive = tab.id === activeTab
              return (
                <Link
                  key={tab.id}
                  href={tab.href}
                  role="tab"
                  aria-selected={isActive}
                  className="font-mono text-xs uppercase tracking-[0.06em] px-4 py-2 rounded-sm transition-all duration-200"
                  style={{
                    background: isActive ? "var(--color-cream)" : "transparent",
                    color: isActive ? "var(--color-dark)" : "var(--color-muted)",
                    boxShadow: isActive ? "0 1px 3px rgba(46,42,38,0.15)" : "none",
                  }}
                >
                  {tab.label}
                </Link>
              )
            })}
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-dark mb-2 leading-tight">
            {title}
          </h1>
          <p className="font-sans text-sm text-muted mb-8">{subtitle}</p>

          {children}
        </div>
      </div>

      {/* Illustration column — the signature moment, hidden below `lg` */}
      <div
        className="hidden lg:flex relative overflow-hidden items-end justify-center p-12"
        style={{
          background:
            "linear-gradient(160deg, var(--color-panel) 0%, var(--color-panel-deep) 55%, var(--color-card) 100%)",
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center" aria-hidden="true">
          <div className="relative" style={{ width: 320, height: 320 }}>
            {/* Warmth glow */}
            <div
              className="afc-motion-safe absolute inset-0 rounded-full"
              style={{
                background:
                  "radial-gradient(circle, rgba(168,103,74,0.35) 0%, rgba(168,103,74,0) 70%)",
                animation: "afc-glow 4s ease-in-out infinite",
              }}
            />
            {/* Signature icon */}
            <div
              className="absolute rounded-full flex items-center justify-center shadow-[0_20px_60px_rgba(46,42,38,0.25)]"
              style={{
                width: 140,
                height: 140,
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                background: "var(--color-cream)",
              }}
            >
              <ChefHatIcon className="text-[var(--color-brand)]" style={{ width: 64, height: 64 }} />
            </div>
            {/* Orbiting food icons */}
            {[
              { Icon: CoffeeIcon, delay: "0s", radius: 150 },
              { Icon: PizzaIcon, delay: "-15s", radius: 150 },
              { Icon: UtensilsIcon, delay: "-30s", radius: 150 },
              { Icon: IceCreamIcon, delay: "-45s", radius: 150 },
            ].map(({ Icon, delay, radius }, i) => (
              <div
                key={i}
                className="afc-motion-safe absolute rounded-full flex items-center justify-center bg-cream"
                style={{
                  width: 48,
                  height: 48,
                  top: "50%",
                  left: "50%",
                  marginTop: -24,
                  marginLeft: -24,
                  boxShadow: "0 8px 24px rgba(46,42,38,0.15)",
                  animation: `afc-orbit 60s linear infinite`,
                  animationDelay: delay,
                  ["--orbit-radius" as string]: `${radius}px`,
                }}
              >
                <Icon className="text-[var(--color-brand)]" style={{ width: 20, height: 20 }} />
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 max-w-xs text-center pb-4">
          <p className="font-serif text-2xl font-semibold text-dark leading-snug">
            Order ahead, skip the line.
          </p>
          <p className="font-sans text-sm text-muted mt-3">
            Your favourites from Ambica Food Corner, ready when you walk in.
          </p>
        </div>
      </div>
    </div>
  )
}
