"use client"

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
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
  isLoaded: boolean
}

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    // Lazy initializer — runs once on mount, safely on the client
    if (typeof window === "undefined") return []
    try {
      const stored = localStorage.getItem("ambica_cart")
      if (stored) return JSON.parse(stored) as CartItem[]
    } catch (e) {
      console.error("Failed to load cart from localStorage", e)
    }
    return []
  })
  // isLoaded is always true after first client render since initializer ran synchronously
  const isLoaded = true

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("ambica_cart", JSON.stringify(items))
    }
  }, [items, isLoaded])

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
      value={{ items, itemCount, total, addItem, updateQuantity, removeItem, clearCart, isLoaded }}
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
