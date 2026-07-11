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

interface CartContextValue {
  items: CartItem[]
  itemCount: number
  total: number
  subtotal: number
  addItem: (item: Omit<CartItem, "id" | "quantity"> & { quantity?: number }) => Promise<void>
  updateQuantity: (variantId: string, quantity: number) => Promise<void>
  removeItem: (variantId: string) => Promise<void>
  clearCart: () => Promise<void>
  isLoaded: boolean
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  cart: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  updateCart: (data: any) => Promise<void>
}

const CartContext = createContext<CartContextValue | null>(null)

// Helper to map Medusa line items to frontend CartItem interface
const mapCartItems = (medusaItems: any[]): CartItem[] => {
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
  const [cart, setCart] = useState<any>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  // Initialize: retrieve cart from Medusa if ID is in localStorage
  useEffect(() => {
    async function initCart() {
      if (typeof window === "undefined") return
      const cartId = localStorage.getItem("medusa_cart_id")
      if (cartId) {
        try {
          const { cart: retrievedCart } = await sdk.store.cart.retrieve(cartId)
          setCart(retrievedCart)
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
  const getOrRetrieveCart = async () => {
    if (cart) return cart
    const cartId = localStorage.getItem("medusa_cart_id")
    if (!cartId) return null
    try {
      const { cart: retrievedCart } = await sdk.store.cart.retrieve(cartId)
      setCart(retrievedCart)
      return retrievedCart
    } catch (e) {
      console.error("Failed to retrieve cart", e)
      localStorage.removeItem("medusa_cart_id")
      return null
    }
  }

  // Helper to create a new cart in Medusa
  const createNewCart = async () => {
    const regionId = process.env.NEXT_PUBLIC_MEDUSA_REGION_ID
    const { cart: newCart } = await sdk.store.cart.create({
      ...(regionId ? { region_id: regionId } : {})
    })
    localStorage.setItem("medusa_cart_id", newCart.id)
    return newCart
  }

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
        const existingItem = activeCart.items?.find((i: any) => i.variant_id === incoming.variantId)
        let updatedCart: any

        if (existingItem) {
          const res = await sdk.store.cart.updateLineItem(
            cartId,
            existingItem.id,
            { quantity: existingItem.quantity + (incoming.quantity ?? 1) }
          )
          updatedCart = res.cart
        } else {
          const res = await sdk.store.cart.createLineItem(
            cartId,
            {
              variant_id: incoming.variantId,
              quantity: incoming.quantity ?? 1
            }
          )
          updatedCart = res.cart
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
          setCart(res.cart)
        } catch (retryError) {
          console.error("Retry adding item failed", retryError)
        }
      }
    },
    [cart]
  )

  const updateQuantity = useCallback(
    async (variantId: string, quantity: number) => {
      const activeCart = await getOrRetrieveCart()
      if (!activeCart) return

      const existingItem = activeCart.items?.find((i: any) => i.variant_id === variantId)
      if (!existingItem) return

      try {
        if (quantity <= 0) {
          const { parent: updatedCart } = await sdk.store.cart.deleteLineItem(activeCart.id, existingItem.id)
          setCart(updatedCart)
        } else {
          const { cart: updatedCart } = await sdk.store.cart.updateLineItem(
            activeCart.id,
            existingItem.id,
            { quantity }
          )
          setCart(updatedCart)
        }
      } catch (e) {
        console.error("Failed to update quantity in Medusa", e)
      }
    },
    [cart]
  )

  const removeItem = useCallback(
    async (variantId: string) => {
      const activeCart = await getOrRetrieveCart()
      if (!activeCart) return

      const existingItem = activeCart.items?.find((i: any) => i.variant_id === variantId)
      if (!existingItem) return

      try {
        const { parent: updatedCart } = await sdk.store.cart.deleteLineItem(activeCart.id, existingItem.id)
        setCart(updatedCart)
      } catch (e) {
        console.error("Failed to remove item in Medusa", e)
      }
    },
    [cart]
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
          activeCart.items.map((item: any) =>
            sdk.store.cart.deleteLineItem(cartId, item.id)
          )
        )
      } catch (e) {
        console.error("Failed to clear remote cart items", e)
      }
    }
  }, [cart])

  const updateCart = useCallback(
    async (data: any) => {
      const activeCart = await getOrRetrieveCart()
      if (!activeCart) return

      try {
        const { cart: updatedCart } = await sdk.store.cart.update(activeCart.id, data)
        setCart(updatedCart)
      } catch (e) {
        console.error("Failed to update cart in Medusa", e)
      }
    },
    [cart]
  )

  // Map state values
  const items = cart ? mapCartItems(cart.items) : []
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
