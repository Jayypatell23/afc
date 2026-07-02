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
  const { items, addItem, updateQuantity, removeItem } = useCart()
  const [toastVisible, setToastVisible] = useState(false)

  const cartItem = items.find((i) => i.variantId === variantId)
  const quantity = cartItem?.quantity || 0

  const handleAdd = useCallback(() => {
    addItem({ variantId, productTitle, variantTitle, price, thumbnail })
    setToastVisible(true)
  }, [addItem, variantId, productTitle, variantTitle, price, thumbnail])

  const handleDismiss = useCallback(() => setToastVisible(false), [])

  return (
    <>
      {quantity === 0 ? (
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
      ) : (
        <div 
          className="flex items-center font-mono text-xs uppercase tracking-[0.07em]"
          style={{
            border: "1px solid #241f1b",
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
