"use client"

interface QtySelectorProps {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
}

export default function QtySelector({
  value,
  onChange,
  min = 1,
  max = 99,
}: QtySelectorProps) {
  return (
    <div
      className="inline-flex items-center"
      style={{
        border: "1px solid #d3c7af",
        borderRadius: 3,
        overflow: "hidden",
      }}
    >
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        className="w-9 h-9 flex items-center justify-center font-sans text-lg text-dark hover:bg-card disabled:opacity-40 transition-colors"
        aria-label="Decrease quantity"
      >
        −
      </button>
      <span
        className="w-9 h-9 flex items-center justify-center font-mono text-sm text-dark select-none"
        aria-label={`Quantity: ${value}`}
      >
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        className="w-9 h-9 flex items-center justify-center font-sans text-lg text-dark hover:bg-card disabled:opacity-40 transition-colors"
        aria-label="Increase quantity"
      >
        +
      </button>
    </div>
  )
}
