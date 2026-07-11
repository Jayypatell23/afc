"use client"

import { useCart } from "@/lib/cart-context"
import QtySelector from "@/components/QtySelector"
import type { CartItem as CartItemType } from "@/lib/cart-context"
import { formatPrice } from "@/lib/format-price"

interface CartItemProps {
  item: CartItemType
}

export default function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeItem } = useCart()

  return (
    <li
      className="flex items-start gap-4 py-4"
      style={{ borderBottom: "1px solid #e6dcc8" }}
    >
      {item.thumbnail && (
        // Plain img avoids next/image blocking private-IP hosts like localhost:9000
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={item.thumbnail}
          alt={item.productTitle}
          width={52}
          height={52}
          className="rounded-sm object-cover shrink-0"
          style={{ background: "#e7ddc8" }}
          loading="lazy"
        />
      )}

      <div className="flex-1 min-w-0">
        <p className="font-sans font-semibold text-sm text-dark leading-snug">
          {item.productTitle}
        </p>
        {item.variantTitle && item.variantTitle !== "Default Variant" && (
          <p className="font-sans text-xs text-muted mt-0.5">{item.variantTitle}</p>
        )}

        <div className="flex items-center justify-between mt-3">
          <QtySelector
            value={item.quantity}
            onChange={(qty) => {
              if (qty === 0) removeItem(item.variantId)
              else updateQuantity(item.variantId, qty)
            }}
            min={0}
          />
          <span className="font-mono text-sm text-dark">
            {formatPrice(item.price * item.quantity)}
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={() => removeItem(item.variantId)}
        className="font-sans text-xs text-muted hover:text-brand transition-colors shrink-0 mt-0.5"
        aria-label={`Remove ${item.productTitle}`}
      >
        ✕
      </button>
    </li>
  )
}
