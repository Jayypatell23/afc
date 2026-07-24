"use client"

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from "react"
import { sdk } from "@/lib/medusa"

export interface CartItem {
  id: string         // Medusa line item ID
  variantId: string  // Product variant ID
  productTitle: string
  variantTitle?: string
  price: number
  quantity: number
  thumbnail?: string
}

export interface MedusaCartItem {
  id: string
  variant_id: string
  product_title?: string
  title?: string
  variant_title?: string
  variant?: {
    title?: string
    product?: {
      thumbnail?: string
    }
  }
  unit_price?: number
  quantity: number
  thumbnail?: string
}

export interface MedusaCart {
  id: string
  items?: MedusaCartItem[]
  total?: number
  subtotal?: number
  metadata?: Record<string, unknown> | null
}

interface CartContextValue {
  items: CartItem[]
  itemCount: number
  total: number
  subtotal: number
  addItem: (item: Omit<CartItem, "id" | "quantity"> & { quantity?: number }) => Promise<void>
  updateQuantity: (variantId: string, quantity: number) => Promise<void>
  removeItem: (variantId: string) => Promise<void>
  clearCart: () => Promise<void>
  resetCartState: () => void
  isLoaded: boolean
  cart: MedusaCart | null
  updateCart: (data: Record<string, unknown>) => Promise<void>
}

const CartContext = createContext<CartContextValue | null>(null)

// Helper to create a new cart in Medusa
const createNewCart = async (): Promise<MedusaCart> => {
  const regionId = process.env.NEXT_PUBLIC_MEDUSA_REGION_ID
  const { cart: newCart } = await sdk.store.cart.create({
    ...(regionId ? { region_id: regionId } : {})
  })
  localStorage.setItem("medusa_cart_id", newCart.id)
  return newCart as MedusaCart
}

// Helper to map Medusa line items to frontend CartItem interface
const mapCartItems = (medusaItems: MedusaCartItem[]): CartItem[] => {
  return (medusaItems ?? []).map((item) => ({
    id: item.id,
    variantId: item.variant_id,
    productTitle: item.product_title || item.title || "Product",
    variantTitle: item.variant_title || item.variant?.title || "",
    price: item.unit_price ?? 0,
    quantity: item.quantity ?? 0,
    thumbnail: item.thumbnail || item.variant?.product?.thumbnail || undefined,
  }))
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<MedusaCart | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  // Initialize: retrieve cart from Medusa if ID is in localStorage
  useEffect(() => {
    async function initCart() {
      if (typeof window === "undefined") return
      const cartId = localStorage.getItem("medusa_cart_id")
      if (cartId) {
        try {
          const { cart: retrievedCart } = await sdk.store.cart.retrieve(cartId)
          setCart(retrievedCart as MedusaCart)
        } catch (e) {
          console.error("Failed to retrieve cart from Medusa", e)
          localStorage.removeItem("medusa_cart_id")
        }
      }
      setIsLoaded(true)
    }
    initCart()
  }, [])

  // Helper to retrieve the current cart if it is in localStorage but not in React state yet
  const getOrRetrieveCart = useCallback(async () => {
    if (cart) return cart
    const cartId = localStorage.getItem("medusa_cart_id")
    if (!cartId) return null
    try {
      const { cart: retrievedCart } = await sdk.store.cart.retrieve(cartId)
      const typedCart = retrievedCart as MedusaCart
      setCart(typedCart)
      return typedCart
    } catch (e) {
      console.error("Failed to retrieve cart", e)
      localStorage.removeItem("medusa_cart_id")
      return null
    }
  }, [cart])

  const addItem = useCallback(
    async (incoming: Omit<CartItem, "id" | "quantity"> & { quantity?: number }) => {
      let activeCart = await getOrRetrieveCart()
      let cartId = activeCart?.id

      // 1. Create a cart if it doesn't exist
      if (!activeCart || !cartId) {
        try {
          activeCart = await createNewCart()
          cartId = activeCart.id
        } catch (e) {
          console.error("Failed to create cart", e)
          return
        }
      }

      // 2. Add the item to the cart
      try {
        const existingItem = activeCart.items?.find((i) => i.variant_id === incoming.variantId)
        let updatedCart: MedusaCart

        if (existingItem) {
          const res = await sdk.store.cart.updateLineItem(
            cartId,
            existingItem.id,
            { quantity: existingItem.quantity + (incoming.quantity ?? 1) }
          )
          updatedCart = res.cart as MedusaCart
        } else {
          const res = await sdk.store.cart.createLineItem(
            cartId,
            {
              variant_id: incoming.variantId,
              quantity: incoming.quantity ?? 1
            }
          )
          updatedCart = res.cart as MedusaCart
        }
        setCart(updatedCart)
      } catch (e) {
        console.error("Failed to add line item, retrying with new cart", e)
        // If the cart has expired on the server, clear ID and try once more
        try {
          localStorage.removeItem("medusa_cart_id")
          const newCart = await createNewCart()
          const res = await sdk.store.cart.createLineItem(
            newCart.id,
            {
              variant_id: incoming.variantId,
              quantity: incoming.quantity ?? 1
            }
          )
          setCart(res.cart as MedusaCart)
        } catch (retryError) {
          console.error("Retry adding item failed", retryError)
        }
      }
    },
    [getOrRetrieveCart]
  )

  const updateQuantity = useCallback(
    async (variantId: string, quantity: number) => {
      const activeCart = await getOrRetrieveCart()
      if (!activeCart) return

      const existingItem = activeCart.items?.find((i) => i.variant_id === variantId)
      if (!existingItem) return

      try {
        if (quantity <= 0) {
          const { parent: updatedCart } = await sdk.store.cart.deleteLineItem(activeCart.id, existingItem.id)
          setCart(updatedCart as MedusaCart)
        } else {
          const { cart: updatedCart } = await sdk.store.cart.updateLineItem(
            activeCart.id,
            existingItem.id,
            { quantity }
          )
          setCart(updatedCart as MedusaCart)
        }
      } catch (e) {
        console.error("Failed to update quantity in Medusa", e)
      }
    },
    [getOrRetrieveCart]
  )

  const removeItem = useCallback(
    async (variantId: string) => {
      const activeCart = await getOrRetrieveCart()
      if (!activeCart) return

      const existingItem = activeCart.items?.find((i) => i.variant_id === variantId)
      if (!existingItem) return

      try {
        const { parent: updatedCart } = await sdk.store.cart.deleteLineItem(activeCart.id, existingItem.id)
        setCart(updatedCart as MedusaCart)
      } catch (e) {
        console.error("Failed to remove item in Medusa", e)
      }
    },
    [getOrRetrieveCart]
  )

  const clearCart = useCallback(async () => {
    const activeCart = await getOrRetrieveCart()
    const cartId = localStorage.getItem("medusa_cart_id")
    localStorage.removeItem("medusa_cart_id")
    setCart(null)

    if (cartId && activeCart?.items?.length) {
      try {
        // Delete items remotely in background
        await Promise.all(
          activeCart.items.map((item) =>
            sdk.store.cart.deleteLineItem(cartId, item.id)
          )
        )
      } catch (e) {
        console.error("Failed to clear remote cart items", e)
      }
    }
  }, [getOrRetrieveCart])

  // Drops the local reference to a cart that has already been completed into an
  // order (or otherwise should no longer be tracked), without deleting its line
  // items remotely — a completed cart can't have its items removed via the API.
  const resetCartState = useCallback(() => {
    localStorage.removeItem("medusa_cart_id")
    setCart(null)
  }, [])

  const updateCart = useCallback(
    async (data: Record<string, unknown>) => {
      const activeCart = await getOrRetrieveCart()
      if (!activeCart) return

      try {
        const { cart: updatedCart } = await sdk.store.cart.update(activeCart.id, data)
        setCart(updatedCart as MedusaCart)
      } catch (e) {
        console.error("Failed to update cart in Medusa", e)
      }
    },
    [getOrRetrieveCart]
  )

  // Map state values
  const items = cart ? mapCartItems(cart.items ?? []) : []
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0)
  const total = cart?.total ?? 0
  const subtotal = cart?.subtotal ?? 0

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        total,
        subtotal,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        resetCartState,
        isLoaded,
        cart,
        updateCart,
      }}
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
