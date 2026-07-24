"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useCart } from "@/lib/cart-context"
import { formatPrice } from "@/lib/format-price"
import { sdk } from "@/lib/medusa"
import CartItemRow from "@/components/CartItem"
import EmptyState from "@/components/EmptyState"
import AuthField from "@/components/auth/AuthField"
import {
  ArrowRightIcon,
  BuildingIcon,
  LockIcon,
  MapPinIcon,
  PhoneIcon,
  SpinnerIcon,
  UserIcon,
} from "@/components/auth/AuthIcons"

type DeliveryMode = "pickup" | "delivery"

const RAZORPAY_PROVIDER_ID = "pp_razorpay_razorpay"
const SHIPPING_OPTION_NAMES: Record<DeliveryMode, string> = {
  pickup: "Store Pickup",
  delivery: "Home Delivery",
}

type ShippingOption = {
  id: string
  name: string
  amount: number
}

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => {
      open: () => void
      on: (event: string, handler: (response: unknown) => void) => void
    }
  }
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true)
      return
    }
    const script = document.createElement("script")
    script.src = "https://checkout.razorpay.com/v1/checkout.js"
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

function ModeTab({
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
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className="font-mono text-xs uppercase tracking-[0.06em] px-4 py-2 rounded-sm transition-all duration-200"
      style={{
        background: active ? "var(--color-cream)" : "transparent",
        color: active ? "var(--color-dark)" : "var(--color-muted)",
        boxShadow: active ? "0 1px 3px rgba(46,42,38,0.15)" : "none",
      }}
    >
      {children}
    </button>
  )
}

export default function CheckoutPage() {
  const { items, total, subtotal, resetCartState, isLoaded, cart, updateCart } = useCart()
  const router = useRouter()

  const [isPlacingOrder, setIsPlacingOrder] = useState(false)
  const [orderError, setOrderError] = useState<string | null>(null)

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
  const [shippingOptions, setShippingOptions] = useState<Record<DeliveryMode, ShippingOption | undefined>>({
    pickup: undefined,
    delivery: undefined,
  })

  // Fetch the real Pickup / Delivery shipping options (with their live prices)
  // as soon as we have a cart, so the delivery charge shown here always matches
  // what will actually be applied to the cart at checkout.
  useEffect(() => {
    if (!cart?.id) return
    sdk.store.fulfillment
      .listCartOptions({ cart_id: cart.id })
      .then(({ shipping_options }) => {
        const pickup = shipping_options?.find((o: any) => o.name === SHIPPING_OPTION_NAMES.pickup)
        const delivery = shipping_options?.find((o: any) => o.name === SHIPPING_OPTION_NAMES.delivery)
        setShippingOptions({
          pickup: pickup && { id: pickup.id, name: pickup.name, amount: pickup.amount ?? 0 },
          delivery: delivery && { id: delivery.id, name: delivery.name, amount: delivery.amount ?? 0 },
        })
      })
      .catch((e) => console.error("Failed to load shipping options", e))
  }, [cart?.id])

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

    if (!cart || items.length === 0) return

    setOrderError(null)
    setIsPlacingOrder(true)

    try {
      // Persist all latest data to Medusa cart metadata before completing
      await persistMetadata({
        customerName,
        mobileNumber,
        mode,
        streetAddress: mode === "delivery" ? streetAddress : "",
        city: mode === "delivery" ? city : "",
        orderNotes,
      })

      await sdk.store.cart.update(cart.id, {
        email: `${cleanMobile}@guest.afcorner.local`,
        shipping_address: {
          first_name: customerName,
          address_1: mode === "delivery" ? streetAddress : "Ambica Food Corner, Shop No. 5",
          city: mode === "delivery" ? city : "Vaso",
          country_code: "in",
          phone: cleanMobile,
        },
      })

      // Save the delivery address to the customer's address book so it shows
      // up under Customers > Addresses in the admin. Best-effort: a failure
      // here shouldn't block placing the order. Pickup orders use the store's
      // own address, which isn't a customer address worth saving.
      if (mode === "delivery") {
        try {
          const { addresses } = await sdk.store.customer.listAddress()
          const alreadySaved = addresses.some(
            (a: any) => a.address_1 === streetAddress && a.city === city
          )
          if (!alreadySaved) {
            await sdk.store.customer.createAddress({
              first_name: customerName,
              address_1: streetAddress,
              city,
              country_code: "in",
              phone: cleanMobile,
            })
          }
        } catch (err) {
          console.error("Failed to save address to customer's address book:", err)
        }
      }

      const selectedOption = shippingOptions[mode]
      if (!selectedOption) {
        throw new Error(
          `The "${SHIPPING_OPTION_NAMES[mode]}" shipping option isn't configured on the store yet.`
        )
      }
      const { cart: cartWithShipping } = await sdk.store.cart.addShippingMethod(cart.id, {
        option_id: selectedOption.id,
      })

      const { payment_collection } = await sdk.store.payment.initiatePaymentSession(
        cartWithShipping,
        { provider_id: RAZORPAY_PROVIDER_ID }
      )
      const paymentSession = payment_collection.payment_sessions?.find(
        (s: any) => s.provider_id === RAZORPAY_PROVIDER_ID
      )
      const sessionData = paymentSession?.data as
        | { razorpay_order_id?: string; amount?: number; key_id?: string }
        | undefined
      if (!sessionData?.razorpay_order_id || !sessionData.key_id) {
        throw new Error("Failed to initialize the Razorpay payment session.")
      }

      const scriptLoaded = await loadRazorpayScript()
      if (!scriptLoaded) {
        throw new Error("Failed to load the Razorpay checkout script.")
      }

      const razorpay = new window.Razorpay({
        key: sessionData.key_id,
        order_id: sessionData.razorpay_order_id,
        amount: Math.round((sessionData.amount ?? 0) * 100),
        currency: "INR",
        name: "Ambica Food Corner",
        description: mode === "delivery" ? "Home Delivery order" : "Store Pickup order",
        prefill: {
          name: customerName,
          contact: cleanMobile,
        },
        theme: { color: "#A8674A" },
        handler: async () => {
          try {
            const result = await sdk.store.cart.complete(cart.id)
            if (result.type === "order") {
              resetCartState()
              router.push(`/orders/${result.order.id}`)
            } else {
              console.error("Cart complete error:", result.error)
              setOrderError("Payment succeeded but placing the order failed. Please contact us.")
            }
          } catch (err) {
            console.error("Failed to complete order after payment:", err)
            setOrderError("Payment succeeded but placing the order failed. Please contact us.")
          } finally {
            setIsPlacingOrder(false)
          }
        },
        modal: {
          ondismiss: () => {
            setIsPlacingOrder(false)
          },
        },
      })
      razorpay.on("payment.failed", () => {
        setOrderError("Payment failed. Please try again.")
        setIsPlacingOrder(false)
      })
      razorpay.open()
    } catch (err) {
      console.error("Failed to place order:", err)
      setOrderError("Something went wrong placing your order. Please try again.")
      setIsPlacingOrder(false)
    }
  }

  const deliveryCharge = mode === "delivery" ? shippingOptions.delivery?.amount ?? 40 : 0
  const orderTotal = (total || subtotal) + deliveryCharge

  if (!isLoaded) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 flex items-center justify-center min-h-[300px]">
        <p className="font-sans text-sm text-muted animate-pulse">Loading checkout...</p>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-dark mb-6">Checkout</h1>
        <EmptyState
          title="Your basket is empty"
          description="Add something delicious from the menu before checking out."
          action={
            <Link
              href="/"
              className="inline-block font-mono text-xs uppercase tracking-[0.07em] text-brand hover:underline"
            >
              Browse the menu →
            </Link>
          }
        />
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 lg:py-12">
      <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-dark mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 lg:gap-10 items-start">
        {/* Delivery details card */}
        <div
          className="rounded-md p-5 sm:p-7 flex flex-col gap-7 order-2 lg:order-1"
          style={{ background: "var(--color-cream)", border: "1px solid var(--color-border)" }}
        >
          {/* Mode toggle */}
          <div
            role="tablist"
            aria-label="Delivery method"
            className="inline-flex p-1 rounded-md gap-1 w-fit"
            style={{ background: "var(--color-card)" }}
          >
            <ModeTab active={mode === "pickup"} onClick={() => handleModeChange("pickup")}>
              Pickup
            </ModeTab>
            <ModeTab active={mode === "delivery"} onClick={() => handleModeChange("delivery")}>
              Delivery
            </ModeTab>
          </div>

          {/* Customer details */}
          <section aria-label="Customer details" className="flex flex-col gap-4">
            <p className="font-mono text-xs uppercase tracking-[0.07em]" style={{ color: "var(--color-amber)" }}>
              Customer details
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <AuthField
                label="Name"
                type="text"
                value={customerName}
                onChange={setCustomerName}
                onBlur={handleNameBlur}
                placeholder="Your name"
                icon={<UserIcon className="w-full h-full" />}
                error={errors.customerName}
                autoComplete="name"
              />
              <AuthField
                label="Mobile number"
                type="tel"
                value={mobileNumber}
                onChange={setMobileNumber}
                onBlur={handleMobileBlur}
                placeholder="Your mobile number"
                icon={<PhoneIcon className="w-full h-full" />}
                error={errors.mobileNumber}
                autoComplete="tel"
                inputMode="tel"
                maxLength={10}
              />
            </div>
          </section>

          {/* Collection / Delivery point */}
          <section aria-label="Collection point" className="flex flex-col gap-4">
            <p className="font-mono text-xs uppercase tracking-[0.07em]" style={{ color: "var(--color-amber)" }}>
              {mode === "pickup" ? "Collect from" : "Deliver to"}
            </p>
            {mode === "pickup" ? (
              <div
                className="flex items-start gap-3 rounded-md px-4 py-3.5"
                style={{ background: "var(--color-card)", border: "1px solid var(--color-border)" }}
              >
                <MapPinIcon className="w-5 h-5 shrink-0 mt-0.5 text-brand" />
                <div>
                  <p className="font-sans font-semibold text-sm text-dark">Ambica Food Corner</p>
                  <p className="font-sans text-sm text-muted">Shop No. 5, Main Market</p>
                  <p className="font-sans text-xs text-faint mt-0.5">~15 min ready time</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <AuthField
                    label="Street address"
                    type="text"
                    value={streetAddress}
                    onChange={setStreetAddress}
                    onBlur={handleStreetBlur}
                    placeholder="Street address"
                    icon={<MapPinIcon className="w-full h-full" />}
                    error={errors.streetAddress}
                    autoComplete="address-line1"
                  />
                </div>
                <AuthField
                  label="City"
                  type="text"
                  value={city}
                  onChange={setCity}
                  onBlur={handleCityBlur}
                  placeholder="City"
                  icon={<BuildingIcon className="w-full h-full" />}
                  error={errors.city}
                  autoComplete="address-level2"
                />
              </div>
            )}
          </section>

          {/* Order Notes */}
          <section aria-label="Order Notes" className="flex flex-col gap-2">
            <p className="font-mono text-xs uppercase tracking-[0.07em]" style={{ color: "var(--color-amber)" }}>
              Order notes (optional)
            </p>
            <textarea
              placeholder="Any special instructions for the kitchen..."
              value={orderNotes}
              onChange={(e) => setOrderNotes(e.target.value)}
              onBlur={handleNotesBlur}
              className="w-full font-sans text-sm bg-input text-dark placeholder:text-faint px-4 py-3 rounded-md outline-none transition-colors focus:ring-2 focus:ring-offset-1 resize-none"
              style={{
                border: "1px solid var(--color-border)",
                minHeight: "90px",
                ["--tw-ring-color" as string]: "var(--color-brand)",
                ["--tw-ring-offset-color" as string]: "var(--color-cream)",
              }}
              aria-label="Order Notes"
            />
          </section>

          <div>
            <Link
              href="/cart"
              className="font-mono text-xs uppercase tracking-[0.07em] text-muted hover:text-dark transition-colors"
            >
              ← Back to cart
            </Link>
          </div>
        </div>

        {/* Order summary card */}
        <div
          className="rounded-md p-5 sm:p-7 flex flex-col gap-5 order-1 lg:order-2 lg:sticky"
          style={{ background: "var(--color-cream)", border: "1px solid var(--color-border)", top: "1.5rem" }}
        >
          <p className="font-mono text-xs uppercase tracking-[0.07em]" style={{ color: "var(--color-amber)" }}>
            Order summary · {items.length} {items.length === 1 ? "item" : "items"}
          </p>

          <ul className="flex flex-col -my-2">
            {items.map((item) => (
              <CartItemRow key={item.variantId} item={item} />
            ))}
          </ul>

          <div className="flex flex-col gap-2 pt-1" style={{ borderTop: "1px solid var(--color-border)" }}>
            <div className="flex justify-between pt-3">
              <span className="font-sans text-sm text-muted">Subtotal</span>
              <span className="font-mono text-sm text-dark">{formatPrice(total || subtotal)}</span>
            </div>
            {mode === "delivery" && (
              <div className="flex justify-between">
                <span className="font-sans text-sm text-muted">Delivery charge</span>
                <span className="font-mono text-sm text-dark">{formatPrice(deliveryCharge)}</span>
              </div>
            )}
            <div
              className="flex justify-between pt-2 mt-1 font-semibold"
              style={{ borderTop: "1px solid var(--color-border)" }}
            >
              <span className="font-sans text-sm text-dark">Total</span>
              <span className="font-mono text-sm text-dark">{formatPrice(orderTotal)}</span>
            </div>
          </div>

          {orderError && (
            <p role="alert" className="font-sans text-xs text-center" style={{ color: "var(--color-brand)" }}>
              {orderError}
            </p>
          )}

          <button
            type="button"
            onClick={handlePlaceOrder}
            disabled={isPlacingOrder}
            className="group flex items-center justify-center gap-2 w-full font-sans font-semibold text-sm text-cream py-3.5 rounded-md transition-all duration-200 hover:opacity-90 hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            style={{ background: "var(--color-brand)" }}
          >
            {isPlacingOrder ? (
              <>
                <SpinnerIcon className="w-4 h-4" />
                Processing…
              </>
            ) : (
              <>
                Pay {formatPrice(orderTotal)}
                <ArrowRightIcon className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
              </>
            )}
          </button>

          <p className="flex items-center justify-center gap-1.5 font-sans text-xs text-faint">
            <LockIcon className="w-3.5 h-3.5" />
            Payments secured by Razorpay
          </p>
        </div>
      </div>
    </div>
  )
}
