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
}

export default function AddToCartBtn({
  variantId,
  productTitle,
  variantTitle,
  price,
  thumbnail,
}: AddToCartBtnProps) {
  const { addItem } = useCart()
  const [toastVisible, setToastVisible] = useState(false)

  const handleAdd = useCallback(() => {
    addItem({ variantId, productTitle, variantTitle, price, thumbnail })
    setToastVisible(true)
  }, [addItem, variantId, productTitle, variantTitle, price, thumbnail])

  const handleDismiss = useCallback(() => setToastVisible(false), [])

  return (
    <>
      <button
        type="button"
        onClick={handleAdd}
        className="font-mono text-xs uppercase tracking-[0.07em] hover:bg-dark hover:text-cream transition-colors"
        style={{
          border: "1px solid #241f1b",
          background: "transparent",
          padding: "6px 13px",
          borderRadius: 2,
          cursor: "pointer",
        }}
      >
        Add
      </button>
      <Toast
        message={`Added ${productTitle}`}
        price={price}
        visible={toastVisible}
        onDismiss={handleDismiss}
      />
    </>
  )
}
