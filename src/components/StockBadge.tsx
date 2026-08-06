interface StockBadgeProps {
  inStock: boolean
  className?: string
}

export default function StockBadge({ inStock, className = "" }: StockBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.06em] ${className}`}
      style={{ color: inStock ? "var(--color-muted)" : "var(--color-brand)" }}
    >
      <span
        className="inline-block rounded-full shrink-0"
        style={{ width: 6, height: 6, background: inStock ? "#3BA55D" : "var(--color-brand)" }}
        aria-hidden="true"
      />
      {inStock ? "In Stock" : "Out of Stock"}
    </span>
  )
}
