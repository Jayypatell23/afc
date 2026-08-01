import Link from "next/link"
import { sdk } from "@/lib/medusa"
import { formatPrice } from "@/lib/format-price"

interface OrderLineItem {
  id: string
  title: string
  quantity: number
  unit_price: number
  thumbnail?: string
}

interface OrderAddress {
  address_1?: string
  city?: string
}

interface Order {
  id: string
  email?: string
  status: string
  fulfillment_status?: string
  items: OrderLineItem[]
  total?: number
  metadata?: Record<string, unknown>
  shipping_address?: OrderAddress
}

async function getOrder(id: string): Promise<Order | null> {
  try {
    const { order } = await (sdk.store.order.retrieve(id, {
      fields: "id,email,status,fulfillment_status,created_at,total,metadata,*items,*shipping_address",
    }) as Promise<{ order: unknown }>)
    return order as Order
  } catch (err) {
    console.error("Failed to retrieve order:", err)
    return null
  }
}

// display_id is a store-wide counter shared across every customer, so it isn't
// shown to customers (see /store/customers/email-orders). Look up this order's
// position within just this customer's own order history instead.
async function getCustomerOrderNumber(email: string | undefined, orderId: string): Promise<number | null> {
  if (!email) return null
  try {
    const { orders } = await sdk.client.fetch<{ orders: { id: string; customer_order_number: number }[] }>(
      "/store/customers/email-orders",
      { query: { email } }
    )
    return orders.find((o) => o.id === orderId)?.customer_order_number ?? null
  } catch (err) {
    console.error("Failed to look up customer order number:", err)
    return null
  }
}

export default async function OrderPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const order = await getOrder(id)

  if (!order) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <p className="font-serif text-xl font-medium text-dark mb-2">Order not found</p>
        <Link href="/" className="font-mono text-xs uppercase tracking-[0.07em] text-brand hover:underline">
          Return to menu
        </Link>
      </div>
    )
  }

  const customerOrderNumber = await getCustomerOrderNumber(order.email, order.id)
  const orderTotal = order.total ?? 0
  const isDelivery = order.metadata?.mode === "delivery"
  const streetAddress = order.shipping_address?.address_1 || (order.metadata?.streetAddress as string | undefined)
  const city = order.shipping_address?.city || (order.metadata?.city as string | undefined)
  const deliveryAddress = [streetAddress, city].filter(Boolean).join(", ")
  const orderNotes = (order.metadata?.orderNotes as string | undefined)?.trim()

  return (
    <div className="max-w-lg mx-auto px-4 sm:px-6 py-10">
      {/* Check icon */}
      <div className="flex justify-center mb-6">
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center"
          style={{ background: "#fdf0eb" }}
        >
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--color-brand)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        </div>
      </div>

      <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-dark text-center mb-2">
        Order confirmed
      </h1>

      {isDelivery ? (
        <>
          <p className="font-sans text-sm text-muted text-center mb-1">
            Thanks for your order! It will be delivered to
          </p>
          <p className="font-sans text-sm font-medium text-dark text-center mb-8">
            {deliveryAddress || "your delivery address"}
          </p>
        </>
      ) : (
        <>
          <p className="font-sans text-sm text-muted text-center mb-1">
            Thanks for your order! It&apos;ll be ready at
          </p>
          <p className="font-sans text-sm font-medium text-dark text-center mb-8">
            Ambica Food Corner, Shop No. 5
          </p>
        </>
      )}

      {/* Order meta */}
      <div
        className="flex justify-between items-center rounded-sm px-4 py-3 mb-8"
        style={{ background: "var(--color-card)", border: "1px solid var(--color-border)" }}
      >
        <div>
          <p className="font-mono text-xs text-faint uppercase tracking-[0.07em]">
            Order
          </p>
          <p className="font-mono text-sm text-dark mt-0.5">
            #{customerOrderNumber ?? order.id.slice(0, 8).toUpperCase()}
          </p>
        </div>
        <div className="text-right">
          <p className="font-mono text-xs text-faint uppercase tracking-[0.07em]">
            Est. ready
          </p>
          <p className="font-mono text-sm text-dark mt-0.5">~15 min</p>
        </div>
      </div>

      {/* Order items */}
      {order.items.length > 0 && (
        <div className="mb-8">
          <p
            className="font-mono text-xs uppercase tracking-[0.07em] mb-3"
            style={{ color: "var(--color-amber)" }}
          >
            Items
          </p>
          <ul className="flex flex-col">
            {order.items.map((item) => (
              <li
                key={item.id}
                className="flex justify-between py-3"
                style={{ borderBottom: "1px solid var(--color-border)" }}
              >
                <span className="font-sans text-sm text-dark">
                  {item.quantity} × {item.title}
                </span>
                <span className="font-mono text-sm text-dark">
                  {formatPrice(item.unit_price * item.quantity)}
                </span>
              </li>
            ))}
            {orderTotal > 0 && (
              <li className="flex justify-between py-3">
                <span className="font-sans font-semibold text-sm text-dark">Total</span>
                <span className="font-mono text-sm text-dark">{formatPrice(orderTotal)}</span>
              </li>
            )}
          </ul>
        </div>
      )}

      {/* Order notes */}
      {orderNotes && (
        <div className="mb-8">
          <p
            className="font-mono text-xs uppercase tracking-[0.07em] mb-3"
            style={{ color: "var(--color-amber)" }}
          >
            Order notes
          </p>
          <p
            className="font-sans text-sm text-dark rounded-sm px-4 py-3"
            style={{ background: "var(--color-card)", border: "1px solid var(--color-border)" }}
          >
            {orderNotes}
          </p>
        </div>
      )}

      <div className="text-center mt-6">
        <Link
          href="/"
          className="font-mono text-xs uppercase tracking-[0.07em] text-muted hover:text-dark transition-colors"
        >
          Back to menu
        </Link>
      </div>
    </div>
  )
}
