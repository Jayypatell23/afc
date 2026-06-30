"use client"

import Link from "next/link"
import { useCart } from "@/lib/cart-context"
import CartItem from "@/components/CartItem"
import EmptyState from "@/components/EmptyState"

const SERVICE_FEE = 0.5

export default function CartPage() {
  const { items, total } = useCart()

  const serviceTotal = items.length > 0 ? SERVICE_FEE : 0
  const orderTotal = total + serviceTotal

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-dark mb-1">
        Your order
      </h1>
      <p className="font-sans text-sm text-muted mb-8">
        Pickup · Ambica Food Corner · ~15 min
      </p>

      {items.length === 0 ? (
        <EmptyState
          title="Your basket is empty"
          description="Add something delicious from the menu."
          action={
            <Link
              href="/"
              className="inline-block font-mono text-xs uppercase tracking-[0.07em] text-brand hover:underline"
            >
              Browse the menu →
            </Link>
          }
        />
      ) : (
        <>
          <ul className="mb-6">
            {items.map((item) => (
              <CartItem key={item.variantId} item={item} />
            ))}
          </ul>

          {/* Totals */}
          <div
            className="flex flex-col gap-2 py-4 mb-6"
            style={{ borderTop: "1px solid #e6dcc8" }}
          >
            <div className="flex justify-between">
              <span className="font-sans text-sm text-muted">Subtotal</span>
              <span className="font-mono text-sm text-dark">£{total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-sans text-sm text-muted">Service</span>
              <span className="font-mono text-sm text-dark">£{serviceTotal.toFixed(2)}</span>
            </div>
            <div
              className="flex justify-between pt-3 mt-1"
              style={{ borderTop: "1px solid #e6dcc8" }}
            >
              <span className="font-sans font-semibold text-sm text-dark">Total</span>
              <span className="font-mono font-medium text-sm text-dark">
                £{orderTotal.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Checkout button */}
          <Link
            href="/checkout"
            className="block w-full text-center font-sans font-semibold text-sm text-cream py-3.5 rounded-sm transition-opacity hover:opacity-90"
            style={{ background: "#a8492f" }}
          >
            Checkout — £{orderTotal.toFixed(2)}
          </Link>

          <div className="text-center mt-4">
            <Link
              href="/"
              className="font-mono text-xs uppercase tracking-[0.07em] text-muted hover:text-dark transition-colors"
            >
              + Add more from the menu
            </Link>
          </div>
        </>
      )}
    </div>
  )
}
