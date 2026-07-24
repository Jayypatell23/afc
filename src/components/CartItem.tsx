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
      className="relative flex items-start gap-3.5 rounded-md p-3"
      style={{ background: "var(--color-input)", border: "1px solid var(--color-border)" }}
    >
      {item.thumbnail && (
        // Plain img avoids next/image blocking private-IP hosts like localhost:9000
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={item.thumbnail}
          alt={item.productTitle}
          width={64}
          height={64}
          className="rounded-md object-cover shrink-0"
          style={{ background: "var(--color-card)" }}
          loading="lazy"
        />
      )}

      <div className="flex-1 min-w-0">
        <p className="font-sans font-semibold text-sm text-dark leading-snug pr-5">
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
        className="absolute -top-2 -right-2 flex items-center justify-center w-6 h-6 rounded-full text-cream shadow-[0_2px_6px_rgba(46,42,38,0.3)] hover:opacity-90 transition-opacity"
        style={{ background: "var(--color-dark)", fontSize: 11, lineHeight: 1 }}
        aria-label={`Remove ${item.productTitle}`}
      >
        ✕
      </button>
    </li>
  )
}
