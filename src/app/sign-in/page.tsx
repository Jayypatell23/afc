"use client"

import { useState } from "react"
import Link from "next/link"

export default function SignInPage() {
  const [email, setEmail] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implement auth with sdk.auth.login("customer", "emailpass", { email, password })
  }

  return (
    <div className="min-h-[calc(100vh-56px)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
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
                borderBottom: "1px solid #d3c7af",
                borderTop: "none",
                borderLeft: "none",
                borderRight: "none",
              }}
            />
          </div>

          {/* Continue button */}
          <button
            type="submit"
            className="w-full font-sans font-semibold text-sm text-cream py-3.5 rounded-sm transition-opacity hover:opacity-90"
            style={{ background: "#a8492f" }}
          >
            Continue
          </button>
        </form>

        {/* OR divider */}
        <div className="flex items-center gap-3 my-6">
          <span className="flex-1 h-px" style={{ background: "#e6dcc8" }} />
          <span
            className="font-mono text-xs uppercase tracking-[0.07em]"
            style={{ color: "#9a8d79" }}
          >
            Or
          </span>
          <span className="flex-1 h-px" style={{ background: "#e6dcc8" }} />
        </div>

        {/* Google button */}
        <button
          type="button"
          className="w-full flex items-center justify-center gap-2 font-sans text-sm font-medium text-dark py-3 rounded-sm transition-colors hover:bg-card"
          style={{ border: "1px solid #d3c7af", background: "transparent" }}
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
            Create an account
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
