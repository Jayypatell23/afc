"use client"

import { useState, useCallback } from "react"
import { useCart } from "@/lib/cart-context"
import Toast from "@/components/Toast"

interface AddToCartBtnProps {
  variantId: string
  productTitle: string
  variantTitle?: string
  price: number
  thumbnail?: string
  /** "pill" is the original rectangular Add/stepper. "circle" is a compact
   * floating +/stepper button meant to overlap a card's image corner. */
  variant?: "pill" | "circle"
}

export default function AddToCartBtn({
  variantId,
  productTitle,
  variantTitle,
  price,
  thumbnail,
  variant = "pill",
}: AddToCartBtnProps) {
  const { items, addItem, updateQuantity, removeItem } = useCart()
  const [toastVisible, setToastVisible] = useState(false)

  const cartItem = items.find((i) => i.variantId === variantId)
  const quantity = cartItem?.quantity || 0

  const handleAdd = useCallback(() => {
    addItem({ variantId, productTitle, variantTitle, price, thumbnail })
    setToastVisible(true)
  }, [addItem, variantId, productTitle, variantTitle, price, thumbnail])

  const handleDismiss = useCallback(() => setToastVisible(false), [])

  if (variant === "circle") {
    return (
      <>
        {quantity === 0 ? (
          <button
            type="button"
            onClick={handleAdd}
            aria-label={`Add ${productTitle}`}
            className="flex items-center justify-center w-9 h-9 rounded-full text-cream shadow-[0_4px_12px_rgba(46,42,38,0.3)] hover:opacity-90 active:scale-95 transition-all"
            style={{ background: "var(--color-brand)" }}
          >
            <PlusIcon />
          </button>
        ) : (
          <div
            className="flex items-center font-mono text-xs rounded-full text-cream shadow-[0_4px_12px_rgba(46,42,38,0.3)] overflow-hidden"
            style={{ background: "var(--color-brand)" }}
          >
            <button
              type="button"
              onClick={() => {
                if (quantity === 1) removeItem(variantId)
                else updateQuantity(variantId, quantity - 1)
              }}
              className="w-8 h-9 flex items-center justify-center hover:bg-black/10 transition-colors"
              aria-label="Decrease quantity"
            >
              −
            </button>
            <span className="min-w-[1.5ch] text-center select-none" aria-label={`Quantity: ${quantity}`}>
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => updateQuantity(variantId, quantity + 1)}
              className="w-8 h-9 flex items-center justify-center hover:bg-black/10 transition-colors"
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>
        )}
        <Toast
          message={`Added ${productTitle}`}
          price={price}
          visible={toastVisible}
          onDismiss={handleDismiss}
        />
      </>
    )
  }

  return (
    <>
      {quantity === 0 ? (
        <button
          type="button"
          onClick={handleAdd}
          className="font-mono text-xs uppercase tracking-[0.07em] hover:bg-dark hover:text-cream transition-colors"
          style={{
            border: "1px solid var(--color-dark)",
            background: "transparent",
            padding: "6px 13px",
            borderRadius: 2,
            cursor: "pointer",
          }}
        >
          Add
        </button>
      ) : (
        <div
          className="flex items-center font-mono text-xs uppercase tracking-[0.07em]"
          style={{
            border: "1px solid var(--color-dark)",
            borderRadius: 2,
            overflow: "hidden"
          }}
        >
          <button
            type="button"
            onClick={() => {
              if (quantity === 1) removeItem(variantId)
              else updateQuantity(variantId, quantity - 1)
            }}
            className="hover:bg-dark hover:text-cream transition-colors"
            style={{ padding: "6px 10px", cursor: "pointer", background: "transparent", border: "none" }}
          >
            -
          </button>
          <span style={{ padding: "6px 4px", minWidth: "2ch", textAlign: "center" }}>
            {quantity}
          </span>
          <button
            type="button"
            onClick={() => updateQuantity(variantId, quantity + 1)}
            className="hover:bg-dark hover:text-cream transition-colors"
            style={{ padding: "6px 10px", cursor: "pointer", background: "transparent", border: "none" }}
          >
            +
          </button>
        </div>
      )}
      <Toast
        message={`Added ${productTitle}`}
        price={price}
        visible={toastVisible}
        onDismiss={handleDismiss}
      />
    </>
  )
}

function PlusIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  )
}
