import Link from "next/link"
import { sdk } from "@/lib/medusa"
import OrderTracker from "@/components/OrderTracker"

interface OrderLineItem {
  id: string
  title: string
  quantity: number
  unit_price: number
  thumbnail?: string
}

interface Order {
  id: string
  display_id?: number
  status: string
  fulfillment_status?: string
  items: OrderLineItem[]
  total?: number
}

async function getOrder(id: string): Promise<Order | null> {
  try {
    const { order } = await (sdk.store.order.retrieve(id) as Promise<{ order: unknown }>)
    return order as Order
  } catch {
    return null
  }
}

function getOrderSteps(order: Order) {
  const status = order.fulfillment_status ?? order.status ?? ""
  const steps = [
    { label: "Order placed", completed: true },
    {
      label: "Preparing",
      completed: ["preparing", "fulfilled", "shipped", "delivered", "ready"].some((s) =>
        status.includes(s)
      ),
    },
    {
      label: "Ready for pickup",
      completed: ["fulfilled", "shipped", "delivered", "ready"].some((s) =>
        status.includes(s)
      ),
    },
    {
      label: "Collected",
      completed: ["delivered", "collected"].some((s) => status.includes(s)),
    },
  ]
  return steps
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

  const steps = getOrderSteps(order)
  const orderTotal = order.total ?? 0

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
            stroke="#a8492f"
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
      <p className="font-sans text-sm text-muted text-center mb-1">
        Thanks for your order! It&apos;ll be ready at
      </p>
      <p className="font-sans text-sm font-medium text-dark text-center mb-8">
        Ambica Food Corner, Shop No. 5
      </p>

      {/* Order meta */}
      <div
        className="flex justify-between items-center rounded-sm px-4 py-3 mb-8"
        style={{ background: "#f0e9d8", border: "1px solid #e6dcc8" }}
      >
        <div>
          <p className="font-mono text-xs text-faint uppercase tracking-[0.07em]">
            Order
          </p>
          <p className="font-mono text-sm text-dark mt-0.5">
            #{order.display_id ?? order.id.slice(0, 8).toUpperCase()}
          </p>
        </div>
        <div className="text-right">
          <p className="font-mono text-xs text-faint uppercase tracking-[0.07em]">
            Est. ready
          </p>
          <p className="font-mono text-sm text-dark mt-0.5">~15 min</p>
        </div>
      </div>

      {/* Step tracker */}
      <div className="mb-10">
        <OrderTracker steps={steps} />
      </div>

      {/* Order items */}
      {order.items.length > 0 && (
        <div className="mb-8">
          <p
            className="font-mono text-xs uppercase tracking-[0.07em] mb-3"
            style={{ color: "#9a5b34" }}
          >
            Items
          </p>
          <ul className="flex flex-col">
            {order.items.map((item) => (
              <li
                key={item.id}
                className="flex justify-between py-3"
                style={{ borderBottom: "1px solid #e6dcc8" }}
              >
                <span className="font-sans text-sm text-dark">
                  {item.quantity} × {item.title}
                </span>
                <span className="font-mono text-sm text-dark">
                  £{(item.unit_price * item.quantity).toFixed(2)}
                </span>
              </li>
            ))}
            {orderTotal > 0 && (
              <li className="flex justify-between py-3">
                <span className="font-sans font-semibold text-sm text-dark">Total</span>
                <span className="font-mono text-sm text-dark">£{orderTotal.toFixed(2)}</span>
              </li>
            )}
          </ul>
        </div>
      )}

      {/* View receipt */}
      <button
        type="button"
        className="w-full font-sans text-sm font-medium text-dark py-3 rounded-sm transition-colors hover:bg-card"
        style={{ border: "1px solid #d3c7af", background: "transparent" }}
      >
        View receipt
      </button>

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
