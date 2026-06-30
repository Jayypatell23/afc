"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useCart } from "@/lib/cart-context"

type DeliveryMode = "pickup" | "delivery"
type WhenMode = "asap" | "schedule"
type PaymentMode = "card" | "apple_pay" | "cash"

const SERVICE_FEE = 0.5

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="font-mono text-xs uppercase tracking-[0.07em] pb-3 transition-colors"
      style={{
        color: active ? "#241f1b" : "#9a8d79",
        borderBottom: `2px solid ${active ? "#241f1b" : "transparent"}`,
        background: "none",
        border: "none",
        borderBottomStyle: "solid",
        borderBottomWidth: 2,
        borderBottomColor: active ? "#241f1b" : "transparent",
        cursor: "pointer",
        paddingBottom: 12,
      }}
    >
      {children}
    </button>
  )
}

function RadioRow({
  checked,
  onChange,
  label,
  sub,
}: {
  checked: boolean
  onChange: () => void
  label: string
  sub?: string
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      className="flex items-center gap-3 w-full text-left"
      role="radio"
      aria-checked={checked}
    >
      <span
        className="inline-block rounded-full shrink-0"
        style={{
          width: 16,
          height: 16,
          border: `2px solid ${checked ? "#a8492f" : "#9a8d79"}`,
          background: checked ? "#a8492f" : "transparent",
        }}
        aria-hidden="true"
      />
      <span>
        <span className="font-sans text-sm font-medium text-dark">{label}</span>
        {sub && (
          <span className="block font-sans text-xs text-muted">{sub}</span>
        )}
      </span>
    </button>
  )
}

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart()
  const router = useRouter()
  const [mode, setMode] = useState<DeliveryMode>("pickup")
  const [when, setWhen] = useState<WhenMode>("asap")
  const [payment, setPayment] = useState<PaymentMode>("card")

  function handlePlaceOrder() {
    clearCart()
    router.push("/orders/preview")
  }

  const serviceTotal = items.length > 0 ? SERVICE_FEE : 0
  const orderTotal = total + serviceTotal

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="font-serif text-2xl font-semibold text-dark mb-6">Checkout</h1>

      {/* Mode tabs */}
      <div
        className="flex gap-6 border-b border-border mb-8"
        role="tablist"
        aria-label="Delivery method"
      >
        <TabButton active={mode === "pickup"} onClick={() => setMode("pickup")}>
          Pickup
        </TabButton>
        <TabButton active={mode === "delivery"} onClick={() => setMode("delivery")}>
          Delivery
        </TabButton>
      </div>

      <div className="flex flex-col gap-8">
        {/* Collect from */}
        <section aria-label="Collection point">
          <p
            className="font-mono text-xs uppercase tracking-[0.07em] mb-3"
            style={{ color: "#9a5b34" }}
          >
            {mode === "pickup" ? "Collect from" : "Deliver to"}
          </p>
          {mode === "pickup" ? (
            <div
              className="rounded-sm px-4 py-3"
              style={{ background: "#f0e9d8", border: "1px solid #e6dcc8" }}
            >
              <p className="font-sans font-semibold text-sm text-dark">Ambica Food Corner</p>
              <p className="font-sans text-sm text-muted">Shop No. 5, Main Market</p>
              <p className="font-sans text-xs text-faint mt-0.5">~15 min ready time</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {["Street address", "City", "Postcode"].map((field) => (
                <input
                  key={field}
                  type="text"
                  placeholder={field}
                  className="w-full font-sans text-sm bg-input text-dark placeholder:text-faint px-4 py-2.5 rounded-sm outline-none focus:ring-1 focus:ring-border-md"
                  style={{ border: "1px solid #e6dcc8" }}
                  aria-label={field}
                />
              ))}
            </div>
          )}
        </section>

        {/* When */}
        <section aria-label="Timing">
          <p
            className="font-mono text-xs uppercase tracking-[0.07em] mb-4"
            style={{ color: "#9a5b34" }}
          >
            When
          </p>
          <div className="flex flex-col gap-3" role="radiogroup" aria-label="Timing option">
            <RadioRow
              checked={when === "asap"}
              onChange={() => setWhen("asap")}
              label="ASAP"
              sub="Ready in ~15 minutes"
            />
            <RadioRow
              checked={when === "schedule"}
              onChange={() => setWhen("schedule")}
              label="Schedule later"
              sub="Choose a time slot"
            />
          </div>
          {when === "schedule" && (
            <input
              type="datetime-local"
              className="mt-3 font-sans text-sm bg-input text-dark px-4 py-2.5 rounded-sm outline-none focus:ring-1 focus:ring-border-md"
              style={{ border: "1px solid #e6dcc8" }}
              aria-label="Scheduled time"
            />
          )}
        </section>

        {/* Payment */}
        <section aria-label="Payment method">
          <p
            className="font-mono text-xs uppercase tracking-[0.07em] mb-4"
            style={{ color: "#9a5b34" }}
          >
            Payment
          </p>
          <div className="flex flex-col gap-3" role="radiogroup" aria-label="Payment option">
            <RadioRow
              checked={payment === "card"}
              onChange={() => setPayment("card")}
              label="Card"
              sub="Visa, Mastercard, Amex"
            />
            <RadioRow
              checked={payment === "apple_pay"}
              onChange={() => setPayment("apple_pay")}
              label="Apple Pay"
            />
            <RadioRow
              checked={payment === "cash"}
              onChange={() => setPayment("cash")}
              label="Cash on collection"
            />
          </div>
        </section>

        {/* Order summary */}
        {items.length > 0 && (
          <section aria-label="Order summary">
            <p
              className="font-mono text-xs uppercase tracking-[0.07em] mb-3"
              style={{ color: "#9a5b34" }}
            >
              Order summary
            </p>
            <div
              className="rounded-sm px-4 py-3 flex flex-col gap-2"
              style={{ background: "#f0e9d8", border: "1px solid #e6dcc8" }}
            >
              {items.map((item) => (
                <div key={item.variantId} className="flex justify-between">
                  <span className="font-sans text-sm text-dark">
                    {item.quantity} × {item.productTitle}
                  </span>
                  <span className="font-mono text-sm text-dark">
                    £{(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
              <div
                className="flex justify-between pt-2 mt-1"
                style={{ borderTop: "1px solid #e6dcc8" }}
              >
                <span className="font-sans text-sm text-muted">Service</span>
                <span className="font-mono text-sm text-muted">
                  £{serviceTotal.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between font-semibold">
                <span className="font-sans text-sm text-dark">Total</span>
                <span className="font-mono text-sm text-dark">
                  £{orderTotal.toFixed(2)}
                </span>
              </div>
            </div>
          </section>
        )}

        {/* Place order */}
        <div>
          <button
            type="button"
            onClick={handlePlaceOrder}
            className="block w-full text-center font-sans font-semibold text-sm text-cream py-3.5 rounded-sm transition-opacity hover:opacity-90"
            style={{ background: "#a8492f" }}
          >
            Place order · £{orderTotal.toFixed(2)}
          </button>
          <p className="font-sans text-xs text-faint text-center mt-2">
            You won&apos;t be charged until we start cooking.
          </p>
        </div>

        <div className="text-center">
          <Link
            href="/cart"
            className="font-mono text-xs uppercase tracking-[0.07em] text-muted hover:text-dark transition-colors"
          >
            ← Back to cart
          </Link>
        </div>
      </div>
    </div>
  )
}
