/**
 * Formats a numeric amount as Indian Rupees (INR) using the en-IN locale.
 * This is the single source of truth for all price display in the app.
 *
 * Examples:
 *   formatPrice(800)  → "₹800.00"
 *   formatPrice(1599) → "₹1,599.00"
 */
export function formatPrice(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}
