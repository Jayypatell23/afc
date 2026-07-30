"use client"

import { Suspense, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { sdk } from "@/lib/medusa"
import AuthShell from "@/components/auth/AuthShell"
import AuthField from "@/components/auth/AuthField"
import { MailIcon, SpinnerIcon, ArrowRightIcon } from "@/components/auth/AuthIcons"

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
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const redirectTarget = searchParams.get("redirect")
  const destination = redirectTarget?.startsWith("/") ? redirectTarget : "/menu"
  const isCheckout = redirectTarget === "/checkout" || redirectTarget?.startsWith("/checkout")

  const cleanEmail = email.trim().toLowerCase()
  const emailValid = EMAIL_PATTERN.test(cleanEmail)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!email || !emailValid) {
      setError("Please enter a valid email address.")
      return
    }

    setIsSubmitting(true)

    try {
      const result = await sdk.client.fetch<{ success: boolean; customer: { email: string; name: string } }>(
        "/store/customers/passwordless-login",
        {
          method: "POST",
          body: { email: cleanEmail },
        }
      )

      if (!result.success || !result.customer) {
        setError("Account not found. Please try again or create an account.")
        return
      }

      document.cookie = "auth=1; path=/; max-age=2592000; SameSite=Lax"
      document.cookie = `email=${encodeURIComponent(result.customer.email)}; path=/; max-age=2592000; SameSite=Lax`
      document.cookie = `name=${encodeURIComponent(result.customer.name)}; path=/; max-age=2592000; SameSite=Lax`

      router.push(destination)
    } catch (err) {
      console.error("Sign in failed:", err)
      setError("Account not found. Please try again or create an account.")
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
          href={redirectTarget ? `/sign-up?redirect=${encodeURIComponent(redirectTarget)}&email=${encodeURIComponent(cleanEmail)}` : `/sign-up?email=${encodeURIComponent(cleanEmail)}`}
          className="text-dark font-medium hover:text-brand transition-colors"
        >
          Create an account
        </Link>
      </p>
    </AuthShell>
  )
}
