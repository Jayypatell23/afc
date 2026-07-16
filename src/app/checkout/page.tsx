"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useCart } from "@/lib/cart-context"
import { formatPrice } from "@/lib/format-price"

type DeliveryMode = "pickup" | "delivery"

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
        color: active ? "var(--color-dark)" : "var(--color-faint)",
        borderBottom: `2px solid ${active ? "var(--color-dark)" : "transparent"}`,
        background: "none",
        border: "none",
        borderBottomStyle: "solid",
        borderBottomWidth: 2,
        borderBottomColor: active ? "var(--color-dark)" : "transparent",
        cursor: "pointer",
        paddingBottom: 12,
      }}
    >
      {children}
    </button>
  )
}

export default function CheckoutPage() {
  const { items, total, subtotal, clearCart, isLoaded, cart, updateCart } = useCart()
  const router = useRouter()

  const [mode, setMode] = useState<DeliveryMode>("pickup")
  const [customerName, setCustomerName] = useState("")
  const [mobileNumber, setMobileNumber] = useState("")
  const [streetAddress, setStreetAddress] = useState("")
  const [city, setCity] = useState("")
  const [orderNotes, setOrderNotes] = useState("")

  const [errors, setErrors] = useState<{
    customerName?: string
    mobileNumber?: string
    streetAddress?: string
    city?: string
  }>({})

  const [hasInitialized, setHasInitialized] = useState(false)

  // Restore state from Medusa cart metadata on load
  useEffect(() => {
    if (isLoaded && !hasInitialized) {
      if (cart) {
        const metadata = (cart.metadata as Record<string, string | undefined>) || {}
        setTimeout(() => {
          if (metadata.customerName) setCustomerName(metadata.customerName)
          if (metadata.mobileNumber) setMobileNumber(metadata.mobileNumber)
          if (metadata.mode) setMode(metadata.mode as DeliveryMode)
          if (metadata.streetAddress) setStreetAddress(metadata.streetAddress)
          if (metadata.city) setCity(metadata.city)
          if (metadata.orderNotes) setOrderNotes(metadata.orderNotes)
          setHasInitialized(true)
        }, 0)
      } else {
        setTimeout(() => {
          setHasInitialized(true)
        }, 0)
      }
    }
  }, [isLoaded, cart, hasInitialized])

  const persistMetadata = async (updates: Record<string, unknown>) => {
    if (!cart) return
    const currentMetadata = (cart.metadata as Record<string, unknown>) || {}
    const newMetadata = { ...currentMetadata, ...updates }
    await updateCart({ metadata: newMetadata })
  }

  const handleModeChange = async (newMode: DeliveryMode) => {
    setMode(newMode)
    // Clear address validation errors when switching to pickup since it is not required
    if (newMode === "pickup") {
      setErrors((prev) => ({
        ...prev,
        streetAddress: undefined,
        city: undefined,
      }))
    }
    await persistMetadata({ mode: newMode })
  }

  const handleNameBlur = () => {
    persistMetadata({ customerName })
  }

  const handleMobileBlur = () => {
    persistMetadata({ mobileNumber })
  }

  const handleStreetBlur = () => {
    persistMetadata({ streetAddress })
  }

  const handleCityBlur = () => {
    persistMetadata({ city })
  }

  const handleNotesBlur = () => {
    persistMetadata({ orderNotes })
  }

  async function handlePlaceOrder() {
    // Run validation
    const newErrors: typeof errors = {}
    if (!customerName.trim()) {
      newErrors.customerName = "Name is required"
    }

    const cleanMobile = mobileNumber.trim()
    if (!cleanMobile) {
      newErrors.mobileNumber = "Mobile number is required"
    } else if (!/^[6-9]\d{9}$/.test(cleanMobile)) {
      newErrors.mobileNumber = "Please enter a valid 10-digit Indian mobile number"
    }

    if (mode === "delivery") {
      if (!streetAddress.trim()) {
        newErrors.streetAddress = "Street address is required"
      }
      if (!city.trim()) {
        newErrors.city = "City is required"
      }
    }

    setErrors(newErrors)

    if (Object.keys(newErrors).length > 0) {
      return
    }

    // Persist all latest data to Medusa cart metadata before routing/clearing
    await persistMetadata({
      customerName,
      mobileNumber,
      mode,
      streetAddress: mode === "delivery" ? streetAddress : "",
      city: mode === "delivery" ? city : "",
      orderNotes,
    })

    await clearCart()
    router.push("/orders/preview")
  }

  const serviceTotal = items.length > 0 ? SERVICE_FEE : 0
  const orderTotal = (total || subtotal) + serviceTotal

  if (!isLoaded) {
    return (
      <div className="max-w-xl mx-auto px-4 sm:px-6 py-8 flex items-center justify-center min-h-[300px]">
        <p className="font-sans text-sm text-muted animate-pulse">Loading checkout...</p>
      </div>
    )
  }

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="font-serif text-2xl font-semibold text-dark mb-6">Checkout</h1>

      {/* Mode tabs */}
      <div
        className="flex gap-6 border-b border-border mb-8"
        role="tablist"
        aria-label="Delivery method"
      >
        <TabButton active={mode === "pickup"} onClick={() => handleModeChange("pickup")}>
          Pickup
        </TabButton>
        <TabButton active={mode === "delivery"} onClick={() => handleModeChange("delivery")}>
          Delivery
        </TabButton>
      </div>

      <div className="flex flex-col gap-8">
        {/* Customer details */}
        <section aria-label="Customer details">
          <p
            className="font-mono text-xs uppercase tracking-[0.07em] mb-3"
            style={{ color: "var(--color-amber)" }}
          >
            Customer details
          </p>
          <div className="flex flex-col gap-3">
            <div>
              <input
                type="text"
                placeholder="Customer Name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                onBlur={handleNameBlur}
                className="w-full font-sans text-sm bg-input text-dark placeholder:text-faint px-4 py-2.5 rounded-sm outline-none focus:ring-1 focus:ring-border-md"
                style={{ border: `1px solid ${errors.customerName ? "var(--color-brand)" : "var(--color-border)"}` }}
                aria-label="Customer Name"
              />
              {errors.customerName && (
                <p className="font-sans text-xs mt-1" style={{ color: "var(--color-brand)" }}>
                  {errors.customerName}
                </p>
              )}
            </div>

            <div>
              <input
                type="tel"
                placeholder="Mobile Number"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                onBlur={handleMobileBlur}
                className="w-full font-sans text-sm bg-input text-dark placeholder:text-faint px-4 py-2.5 rounded-sm outline-none focus:ring-1 focus:ring-border-md"
                style={{ border: `1px solid ${errors.mobileNumber ? "var(--color-brand)" : "var(--color-border)"}` }}
                aria-label="Mobile Number"
              />
              {errors.mobileNumber && (
                <p className="font-sans text-xs mt-1" style={{ color: "var(--color-brand)" }}>
                  {errors.mobileNumber}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Collection / Delivery point */}
        <section aria-label="Collection point">
          <p
            className="font-mono text-xs uppercase tracking-[0.07em] mb-3"
            style={{ color: "var(--color-amber)" }}
          >
            {mode === "pickup" ? "Collect from" : "Deliver to"}
          </p>
          {mode === "pickup" ? (
            <div
              className="rounded-sm px-4 py-3"
              style={{ background: "var(--color-card)", border: "1px solid var(--color-border)" }}
            >
              <p className="font-sans font-semibold text-sm text-dark">Ambica Food Corner</p>
              <p className="font-sans text-sm text-muted">Shop No. 5, Main Market</p>
              <p className="font-sans text-xs text-faint mt-0.5">~15 min ready time</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <div>
                <input
                  type="text"
                  placeholder="Street address"
                  value={streetAddress}
                  onChange={(e) => setStreetAddress(e.target.value)}
                  onBlur={handleStreetBlur}
                  className="w-full font-sans text-sm bg-input text-dark placeholder:text-faint px-4 py-2.5 rounded-sm outline-none focus:ring-1 focus:ring-border-md"
                  style={{ border: `1px solid ${errors.streetAddress ? "var(--color-brand)" : "var(--color-border)"}` }}
                  aria-label="Street address"
                />
                {errors.streetAddress && (
                  <p className="font-sans text-xs mt-1" style={{ color: "var(--color-brand)" }}>
                    {errors.streetAddress}
                  </p>
                )}
              </div>

              <div>
                <input
                  type="text"
                  placeholder="City"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  onBlur={handleCityBlur}
                  className="w-full font-sans text-sm bg-input text-dark placeholder:text-faint px-4 py-2.5 rounded-sm outline-none focus:ring-1 focus:ring-border-md"
                  style={{ border: `1px solid ${errors.city ? "var(--color-brand)" : "var(--color-border)"}` }}
                  aria-label="City"
                />
                {errors.city && (
                  <p className="font-sans text-xs mt-1" style={{ color: "var(--color-brand)" }}>
                    {errors.city}
                  </p>
                )}
              </div>

            </div>
          )}
        </section>

        {/* Order Notes */}
        <section aria-label="Order Notes">
          <p
            className="font-mono text-xs uppercase tracking-[0.07em] mb-3"
            style={{ color: "var(--color-amber)" }}
          >
            Order Notes (optional)
          </p>
          <textarea
            placeholder="Any special instructions for the kitchen..."
            value={orderNotes}
            onChange={(e) => setOrderNotes(e.target.value)}
            onBlur={handleNotesBlur}
            className="w-full font-sans text-sm bg-input text-dark placeholder:text-faint px-4 py-2.5 rounded-sm outline-none focus:ring-1 focus:ring-border-md resize-none"
            style={{ border: "1px solid var(--color-border)", minHeight: "80px" }}
            aria-label="Order Notes"
          />
        </section>

        {/* Order summary */}
        {items.length > 0 && (
          <section aria-label="Order summary">
            <p
              className="font-mono text-xs uppercase tracking-[0.07em] mb-3"
              style={{ color: "var(--color-amber)" }}
            >
              Order summary
            </p>
            <div
              className="rounded-sm px-4 py-3 flex flex-col gap-2"
              style={{ background: "var(--color-card)", border: "1px solid var(--color-border)" }}
            >
              {items.map((item) => (
                <div key={item.variantId} className="flex justify-between">
                  <span className="font-sans text-sm text-dark">
                    {item.quantity} × {item.productTitle}
                  </span>
                  <span className="font-mono text-sm text-dark">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              ))}
              <div
                className="flex justify-between pt-2 mt-1"
                style={{ borderTop: "1px solid var(--color-border)" }}
              >
                <span className="font-sans text-sm text-muted">Service</span>
                <span className="font-mono text-sm text-muted">
                  {formatPrice(serviceTotal)}
                </span>
              </div>
              <div className="flex justify-between font-semibold">
                <span className="font-sans text-sm text-dark">Total</span>
                <span className="font-mono text-sm text-dark">
                  {formatPrice(orderTotal)}
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
            className="block w-full text-center font-sans font-semibold text-sm text-cream py-3.5 rounded-sm transition-opacity hover:opacity-90 cursor-pointer"
            style={{ background: "var(--color-brand)" }}
          >
            Place order · {formatPrice(orderTotal)}
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
