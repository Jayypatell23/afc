"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function SignInPage() {
  const [email, setEmail] = useState("demo@example.com")
  const [password, setPassword] = useState("password123")
  const [error, setError] = useState("")
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      setError("Please enter a valid email address.")
      return
    }

    if (!password || password.length < 8) {
      setError("Password must be at least 8 characters long.")
      return
    }

    // TODO: Implement auth with sdk.auth.login("customer", "emailpass", { email, password })
    // Set a persistent cookie (30 days) for session management
    document.cookie = "auth=1; path=/; max-age=2592000; SameSite=Lax"
    router.push("/menu")
  }

  return (
    <div className="min-h-[calc(100vh-56px)] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Decorative Background Food Icons */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <CoffeeIcon className="absolute text-[var(--color-brand)] opacity-[0.04] w-48 h-48 -rotate-12 top-10 left-[-2rem] md:left-10" />
        <PizzaIcon className="absolute text-[var(--color-brand)] opacity-[0.04] w-56 h-56 rotate-12 bottom-20 left-[-4rem] md:left-20" />
        <UtensilsIcon className="absolute text-[var(--color-brand)] opacity-[0.04] w-32 h-32 rotate-45 top-32 right-[-2rem] md:right-32" />
        <IceCreamIcon className="absolute text-[var(--color-brand)] opacity-[0.04] w-44 h-44 -rotate-[20deg] bottom-10 right-[-2rem] md:right-10" />
        <ChefHatIcon className="absolute text-[var(--color-brand)] opacity-[0.04] w-36 h-36 rotate-[15deg] top-1/2 left-[10%] -translate-y-1/2" />
        <CoffeeIcon className="absolute text-[var(--color-brand)] opacity-[0.04] w-40 h-40 -rotate-[30deg] top-[60%] right-[15%] -translate-y-1/2" />
      </div>

      <div className="w-full max-w-sm relative z-10 bg-[#f7f4ed]/50 backdrop-blur-sm p-8 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[var(--color-border)]/50">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <span
            className="inline-block rounded-sm bg-brand"
            style={{ width: 10, height: 10 }}
            aria-hidden="true"
          />
          <span
            className="font-serif font-semibold text-dark"
            style={{ fontSize: 26 }}
          >
            Ambica
          </span>
        </div>

        <h1 className="font-serif text-2xl font-semibold text-dark text-center mb-8">
          Sign in to order
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* Email underline input */}
          <div>
            <label
              htmlFor="email"
              className="block font-mono text-xs uppercase tracking-[0.07em] text-faint mb-2"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full bg-transparent font-sans text-sm text-dark placeholder:text-faint pb-2 outline-none"
              style={{
                borderBottom: "1px solid var(--color-border-md)",
                borderTop: "none",
                borderLeft: "none",
                borderRight: "none",
              }}
            />
          </div>

          {/* Password underline input */}
          <div>
            <label
              htmlFor="password"
              className="block font-mono text-xs uppercase tracking-[0.07em] text-faint mb-2"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Your password"
              required
              className="w-full bg-transparent font-sans text-sm text-dark placeholder:text-faint pb-2 outline-none"
              style={{
                borderBottom: "1px solid var(--color-border-md)",
                borderTop: "none",
                borderLeft: "none",
                borderRight: "none",
              }}
            />
          </div>

          {/* Error message */}
          {error && (
            <div className="text-red-500 text-sm text-center -mt-2 mb-2 font-sans">
              {error}
            </div>
          )}

          {/* Continue button */}
          <button
            type="submit"
            className="w-full font-sans font-semibold text-sm text-cream py-3.5 rounded-sm transition-opacity hover:opacity-90"
            style={{ background: "var(--color-brand)" }}
          >
            Continue
          </button>
        </form>

        {/* OR divider */}
        <div className="flex items-center gap-3 my-6">
          <span className="flex-1 h-px" style={{ background: "var(--color-border)" }} />
          <span
            className="font-mono text-xs uppercase tracking-[0.07em]"
            style={{ color: "var(--color-faint)" }}
          >
            Or
          </span>
          <span className="flex-1 h-px" style={{ background: "var(--color-border)" }} />
        </div>

        {/* Google button */}
        <button
          type="button"
          className="w-full flex items-center justify-center gap-2 font-sans text-sm font-medium text-dark py-3 rounded-sm transition-colors hover:bg-card"
          style={{ border: "1px solid var(--color-border-md)", background: "transparent" }}
        >
          <GoogleIcon />
          Continue with Google
        </button>

        {/* Sign up link */}
        <p className="font-sans text-sm text-muted text-center mt-8">
          New here?{" "}
          <Link
            href="/sign-up"
            className="text-dark font-medium hover:text-brand transition-colors"
          >
            Create an Account
          </Link>
        </p>
      </div>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  )
}

function CoffeeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M17 8h1a4 4 0 1 1 0 8h-1" />
      <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" />
      <line x1="6" x2="6" y1="2" y2="4" />
      <line x1="10" x2="10" y1="2" y2="4" />
      <line x1="14" x2="14" y1="2" y2="4" />
    </svg>
  )
}

function PizzaIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M15 11h.01" />
      <path d="M11 15h.01" />
      <path d="M16 16h.01" />
      <path d="m2 16 20 6-6-20A20 20 0 0 0 2 16" />
      <path d="M5.71 17.11a17.04 17.04 0 0 1 11.4-11.4" />
    </svg>
  )
}

function UtensilsIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
      <path d="M7 2v20" />
      <path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
    </svg>
  )
}

function IceCreamIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m7 11 4.92 9.84a1 1 0 0 0 1.78 0L19 11" />
      <path d="M17 7a5 5 0 0 0-10 0" />
      <path d="M13 3.5a1.5 1.5 0 0 0-1.5 1.5" />
      <path d="M13.5 11A2.5 2.5 0 0 0 11 8.5" />
      <path d="M10 8.5A2.5 2.5 0 0 0 7.5 11" />
      <path d="M17.5 11A2.5 2.5 0 0 0 15 8.5" />
    </svg>
  )
}

function ChefHatIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6Z" />
      <line x1="6" x2="18" y1="17" y2="17" />
    </svg>
  )
}
