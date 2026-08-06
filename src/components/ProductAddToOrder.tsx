"use client"

import { useState } from "react"
import { useCart } from "@/lib/cart-context"
import { useOrderStatus } from "@/lib/order-status-context"
import QtySelector from "@/components/QtySelector"
import StockBadge from "@/components/StockBadge"
import Toast from "@/components/Toast"
import { formatPrice } from "@/lib/format-price"

interface ProductVariant {
  id: string
  title: string
  price: number
  inventoryQuantity?: number | null
}

interface ProductAddToOrderProps {
  variants: ProductVariant[]
  productTitle: string
  thumbnail?: string
}

export default function ProductAddToOrder({
  variants,
  productTitle,
  thumbnail,
}: ProductAddToOrderProps) {
  const [selectedVariantId, setSelectedVariantId] = useState<string>(
    variants[0]?.id ?? ""
  )
  const [quantity, setQuantity] = useState(1)
  const [toastVisible, setToastVisible] = useState(false)
  const { addItem } = useCart()
  const { acceptingOrders } = useOrderStatus()

  const selectedVariant =
    variants.find((v) => v.id === selectedVariantId) ?? variants[0]
  const price = selectedVariant?.price ?? 0

  // Only variants with tracked inventory report a quantity — untracked
  // variants (inventoryQuantity is null/undefined) are treated as available.
  const trackedQuantity = selectedVariant?.inventoryQuantity
  const outOfStock = trackedQuantity != null && trackedQuantity <= 0
  const isDisabled = outOfStock || !acceptingOrders

  const handleAdd = () => {
    if (!selectedVariant || isDisabled) return
    addItem({
      variantId: selectedVariant.id,
      productTitle,
      variantTitle: selectedVariant.title,
      price,
      thumbnail,
      quantity,
    })
    setToastVisible(true)
  }

  if (variants.length === 0) return null

  return (
    <div className="flex flex-col gap-5">
      {/* Size / Variant selector (only show if multiple variants) */}
      {variants.length > 1 && (
        <div>
          <p
            className="font-mono text-xs uppercase tracking-[0.07em] mb-3"
            style={{ color: "var(--color-amber)" }}
          >
            Size
          </p>
          <div className="flex flex-col gap-2" role="radiogroup" aria-label="Select size">
            {variants.map((variant) => {
              const isSelected = variant.id === selectedVariantId
              return (
                <button
                  key={variant.id}
                  role="radio"
                  aria-checked={isSelected}
                  type="button"
                  onClick={() => setSelectedVariantId(variant.id)}
                  className="flex items-center justify-between px-3 py-2.5 rounded-sm transition-colors text-left"
                  style={{
                    border: `1px solid ${isSelected ? "var(--color-brand)" : "var(--color-border)"}`,
                    background: isSelected ? "var(--color-border)" : "transparent",
                    cursor: "pointer",
                  }}
                >
                  <span className="flex items-center gap-2.5">
                    <span
                      className="inline-block rounded-full shrink-0"
                      style={{
                        width: 12,
                        height: 12,
                        border: `2px solid ${isSelected ? "var(--color-brand)" : "var(--color-faint)"}`,
                        background: isSelected ? "var(--color-brand)" : "transparent",
                      }}
                      aria-hidden="true"
                    />
                    <span className="font-sans text-sm font-medium text-dark">
                      {variant.title}
                    </span>
                  </span>
                  {variant.price > 0 && (
                    <span className="font-mono text-xs text-muted">
                      {formatPrice(variant.price)}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Price display (single variant) */}
      {variants.length === 1 && price > 0 && (
        <p className="font-mono text-sm text-dark">{formatPrice(price)}</p>
      )}

      <StockBadge inStock={!outOfStock} />

      {/* Qty + Add */}
      <div className="flex items-center gap-4">
        <QtySelector value={quantity} onChange={setQuantity} />
        <button
          type="button"
          onClick={handleAdd}
          disabled={isDisabled}
          className="flex-1 font-sans font-semibold text-sm text-cream py-3 px-6 rounded-sm transition-opacity disabled:opacity-40 disabled:cursor-not-allowed enabled:hover:opacity-90"
          style={{ background: "var(--color-brand)" }}
        >
          {outOfStock
            ? "Out of stock"
            : !acceptingOrders
              ? "Not accepting orders"
              : `Add to order — ${formatPrice(price * quantity)}`}
        </button>
      </div>

      <Toast
        message={`${quantity} × ${productTitle} added`}
        price={price * quantity}
        visible={toastVisible}
        onDismiss={() => setToastVisible(false)}
      />
    </div>
  )
}
