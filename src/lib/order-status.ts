// Single source of truth for what counts as an "active" (still in-progress)
// order vs. a "past" one. Keeping this in one place avoids the two views
// (cart page's "Your orders" and profile's "Past Orders") drifting out of
// sync — e.g. an order sitting in neither list because one page checks for
// "not in active statuses" and the other checks for "== delivered" exactly.
export const ACTIVE_FULFILLMENT_STATUSES = new Set(["not_fulfilled", "in_progress", "shipped"])

export function isActiveOrder(fulfillmentStatus: string | undefined): boolean {
  return ACTIVE_FULFILLMENT_STATUSES.has(fulfillmentStatus ?? "")
}
