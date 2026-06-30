"use client"

import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react"

export interface CartItem {
  id: string
  variantId: string
  productTitle: string
  variantTitle?: string
  price: number
  quantity: number
  thumbnail?: string
}

interface CartContextValue {
  items: CartItem[]
  itemCount: number
  total: number
  addItem: (item: Omit<CartItem, "id" | "quantity"> & { quantity?: number }) => void
  updateQuantity: (variantId: string, quantity: number) => void
  removeItem: (variantId: string) => void
  clearCart: () => void
}

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  // TODO: Replace local state with Medusa cart API calls (sdk.store.cart.create, addLineItem, etc.)
  const [items, setItems] = useState<CartItem[]>([])

  const addItem = useCallback(
    (incoming: Omit<CartItem, "id" | "quantity"> & { quantity?: number }) => {
      setItems((prev) => {
        const existing = prev.find((i) => i.variantId === incoming.variantId)
        if (existing) {
          return prev.map((i) =>
            i.variantId === incoming.variantId
              ? { ...i, quantity: i.quantity + (incoming.quantity ?? 1) }
              : i
          )
        }
        return [
          ...prev,
          {
            ...incoming,
            id: `${incoming.variantId}-${Date.now()}`,
            quantity: incoming.quantity ?? 1,
          },
        ]
      })
      // TODO: Sync with Medusa – sdk.store.cart.createLineItem(cartId, { variant_id, quantity })
    },
    []
  )

  const updateQuantity = useCallback((variantId: string, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((i) => i.variantId !== variantId))
    } else {
      setItems((prev) =>
        prev.map((i) => (i.variantId === variantId ? { ...i, quantity } : i))
      )
    }
    // TODO: Sync with Medusa – sdk.store.cart.updateLineItem(cartId, lineItemId, { quantity })
  }, [])

  const removeItem = useCallback((variantId: string) => {
    setItems((prev) => prev.filter((i) => i.variantId !== variantId))
    // TODO: Sync with Medusa – sdk.store.cart.deleteLineItem(cartId, lineItemId)
  }, [])

  const clearCart = useCallback(() => {
    setItems([])
    // TODO: Sync with Medusa – clear cart or create new one
  }, [])

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0)
  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0)

  return (
    <CartContext.Provider
      value={{ items, itemCount, total, addItem, updateQuantity, removeItem, clearCart }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error("useCart must be used within CartProvider")
  return ctx
}
