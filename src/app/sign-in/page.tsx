"use client"

import { Suspense, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { sdk } from "@/lib/medusa"
import AuthShell from "@/components/auth/AuthShell"
import AuthField from "@/components/auth/AuthField"
import { LockIcon, MailIcon, SpinnerIcon, ArrowRightIcon } from "@/components/auth/AuthIcons"

const EMAIL_PATTERN = /^\S+@\S+\.\S+$/

export default function SignInPage() {
  return (
    <Suspense>
      <SignInForm />
    </Suspense>
  )
}

function SignInForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialEmail = searchParams.get("email") || ""

  const [email, setEmail] = useState(initialEmail)
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  // Only ever follow a same-site path (guards against an open-redirect via a
  // crafted ?redirect= value pointing at an external URL).
  const redirectTarget = searchParams.get("redirect")
  const destination = redirectTarget?.startsWith("/") ? redirectTarget : "/menu"
  const isCheckout = redirectTarget === "/checkout" || redirectTarget?.startsWith("/checkout")

  const emailValid = EMAIL_PATTERN.test(email)
  const passwordValid = password.length >= 8

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!email || !emailValid) {
      setError("Please enter a valid email address.")
      return
    }

    if (!password || !passwordValid) {
      setError("Password must be at least 8 characters long.")
      return
    }

    setIsSubmitting(true)

    try {
      // Check if the customer email exists in the database
      const checkResult = await sdk.client.fetch<{ exists: boolean }>(
        "/store/customers/check-email",
        { query: { email } }
      ).catch((err) => {
        console.error("Failed to check if email exists:", err)
        return { exists: true } // Fallback to regular login flow on check failure
      })

      if (!checkResult.exists) {
        // User does not exist, redirect to the sign-up page with email pre-filled
        const signUpUrl = `/sign-up?redirect=${encodeURIComponent(redirectTarget || "")}&email=${encodeURIComponent(email)}&notFound=1`
        router.push(signUpUrl)
        return
      }

      const result = await sdk.auth.login("customer", "emailpass", { email, password })

      if (typeof result !== "string") {
        setError("Additional authentication steps are required for this account.")
        return
      }

      document.cookie = "auth=1; path=/; max-age=2592000; SameSite=Lax"
      router.push(destination)
    } catch (err) {
      console.error("Sign in failed:", err)
      setError("Incorrect password. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthShell
      activeTab="sign-in"
      title={isCheckout ? "Sign in to check out" : "Welcome back"}
      subtitle={isCheckout ? "Sign in to retrieve your details and place your order." : "Sign in to pick up where you left off."}
      redirect={redirectTarget}
    >
      {isCheckout && (
        <div className="mb-6 p-4 rounded-md text-xs font-sans border flex items-center gap-3 bg-card border-brand/20 text-dark">
          <span className="text-lg">🛒</span>
          <div>
            <p className="font-semibold">Checkout requires an account</p>
            <p className="text-muted mt-0.5">Please sign in or create an account below to complete your order.</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
        <AuthField
          label="Email"
          type="email"
          value={email}
          onChange={setEmail}
          placeholder="you@example.com"
          icon={<MailIcon className="w-full h-full" />}
          valid={email.length > 0 && emailValid}
          autoComplete="email"
          inputMode="email"
        />

        <AuthField
          label="Password"
          type="password"
          value={password}
          onChange={setPassword}
          placeholder="Your password"
          icon={<LockIcon className="w-full h-full" />}
          valid={password.length > 0 && passwordValid}
          autoComplete="current-password"
        />

        {error && (
          <p role="alert" className="text-sm text-center -mt-1" style={{ color: "var(--color-brand)" }}>
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="group flex items-center justify-center gap-2 w-full font-sans font-semibold text-sm text-cream py-3.5 rounded-md transition-all duration-200 hover:opacity-90 hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
          style={{ background: "var(--color-brand)" }}
        >
          {isSubmitting ? (
            <>
              <SpinnerIcon className="w-4 h-4" />
              Signing in…
            </>
          ) : (
            <>
              Continue
              <ArrowRightIcon className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
            </>
          )}
        </button>
      </form>

      <p className="font-sans text-sm text-muted text-center mt-8">
        New here?{" "}
        <Link
          href={redirectTarget ? `/sign-up?redirect=${encodeURIComponent(redirectTarget)}&email=${encodeURIComponent(email)}` : `/sign-up?email=${encodeURIComponent(email)}`}
          className="text-dark font-medium hover:text-brand transition-colors"
        >
          Create an account
        </Link>
      </p>
    </AuthShell>
  )
}
