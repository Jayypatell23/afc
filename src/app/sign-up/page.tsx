"use client"

import { Suspense, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { sdk } from "@/lib/medusa"
import AuthShell from "@/components/auth/AuthShell"
import AuthField from "@/components/auth/AuthField"
import {
  ArrowRightIcon,
  LockIcon,
  MailIcon,
  PhoneIcon,
  SpinnerIcon,
  UserIcon,
} from "@/components/auth/AuthIcons"

const EMAIL_PATTERN = /^\S+@\S+\.\S+$/
const MOBILE_PATTERN = /^\d{10}$/

export default function SignUpPage() {
  return (
    <Suspense>
      <SignUpForm />
    </Suspense>
  )
}

function SignUpForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTarget = searchParams.get("redirect")
  const destination = redirectTarget?.startsWith("/") ? redirectTarget : "/menu"
  const isCheckout = redirectTarget === "/checkout" || redirectTarget?.startsWith("/checkout")

  const initialEmail = searchParams.get("email") || ""
  const wasNotFound = searchParams.get("notFound") === "1"

  const [name, setName] = useState("")
  const [mobile, setMobile] = useState("")
  const [email, setEmail] = useState(initialEmail)
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const cleanMobile = mobile.replace(/\D/g, "")
  const nameValid = name.trim().length > 0
  const mobileValid = MOBILE_PATTERN.test(cleanMobile)
  const emailValid = EMAIL_PATTERN.test(email)
  const passwordValid = password.length >= 8

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!nameValid) {
      setError("Please enter your name.")
      return
    }

    if (!cleanMobile || !mobileValid) {
      setError("Please enter a valid 10-digit mobile number.")
      return
    }

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
      const registrationToken = await sdk.auth.register("customer", "emailpass", { email, password })

      const [first_name, ...rest] = name.trim().split(/\s+/)
      const last_name = rest.join(" ")

      await sdk.store.customer.create(
        {
          email,
          first_name,
          last_name: last_name || undefined,
          phone: cleanMobile,
        },
        {},
        { Authorization: `Bearer ${registrationToken}` }
      )

      await sdk.auth.login("customer", "emailpass", { email, password })

      document.cookie = "auth=1; path=/; max-age=2592000; SameSite=Lax"
      router.push(destination)
    } catch (err) {
      console.error("Sign up failed:", err)
      const message = err instanceof Error ? err.message : ""
      setError(
        message.toLowerCase().includes("already")
          ? "An account with this email already exists. Try signing in instead."
          : "Something went wrong creating your account. Please try again."
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthShell
      activeTab="sign-up"
      title={isCheckout ? "Create an account" : "Create your account"}
      subtitle={isCheckout ? "Create an account to complete your checkout and track your order." : "Order ahead, save your details, and pick up in minutes."}
      redirect={redirectTarget}
    >
      {wasNotFound ? (
        <div className="mb-6 p-4 rounded-md text-xs font-sans border flex items-center gap-3 bg-card border-brand/20 text-dark">

          <div>
            <p className="font-semibold">Account not found</p>
            <p className="text-muted mt-0.5">We couldn&apos;t find an account for <strong>{email}</strong>. Let&apos;s create one below to complete your order.</p>
          </div>
        </div>
      ) : isCheckout ? (
        <div className="mb-6 p-4 rounded-md text-xs font-sans border flex items-center gap-3 bg-card border-brand/20 text-dark">
          <span className="text-lg">🛒</span>
          <div>
            <p className="font-semibold">Checkout requires an account</p>
            <p className="text-muted mt-0.5">Please create an account or sign in below to complete your order.</p>
          </div>
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
        <AuthField
          label="Name"
          type="text"
          value={name}
          onChange={setName}
          placeholder="Your name"
          icon={<UserIcon className="w-full h-full" />}
          valid={nameValid}
          autoComplete="name"
        />

        <AuthField
          label="Mobile number"
          type="tel"
          value={mobile}
          onChange={setMobile}
          placeholder="Your mobile number"
          icon={<PhoneIcon className="w-full h-full" />}
          valid={mobileValid}
          autoComplete="tel"
          inputMode="tel"
          maxLength={10}
        />

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
          placeholder="8+ characters"
          icon={<LockIcon className="w-full h-full" />}
          valid={password.length > 0 && passwordValid}
          autoComplete="new-password"
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
              Creating account…
            </>
          ) : (
            <>
              Create account
              <ArrowRightIcon className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
            </>
          )}
        </button>
      </form>

      <p className="font-sans text-sm text-muted text-center mt-8">
        Already have an account?{" "}
        <Link
          href={redirectTarget ? `/sign-in?redirect=${encodeURIComponent(redirectTarget)}&email=${encodeURIComponent(email)}` : `/sign-in?email=${encodeURIComponent(email)}`}
          className="text-dark font-medium hover:text-brand transition-colors"
        >
          Sign in
        </Link>
      </p>
    </AuthShell>
  )
}
