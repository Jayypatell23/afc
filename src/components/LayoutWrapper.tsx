"use client"
import { usePathname } from "next/navigation"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import { useCart } from "@/lib/cart-context"
import Link from "next/link"

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAuthPage = pathname === "/sign-in" || pathname === "/sign-up"
  const { itemCount, total, isLoaded } = useCart()

  const showStickyCart = isLoaded && itemCount > 0 && !isAuthPage && pathname !== "/cart" && pathname !== "/checkout"

  return (
    <>
      {!isAuthPage && <Navbar />}
      <main className="flex-1">{children}</main>
      {!isAuthPage && <Footer />}
      
      {/* Sticky Cart Summary */}
      {showStickyCart && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#a8492f] text-cream px-4 py-3 sm:px-6 flex items-center justify-between shadow-[0_-4px_20px_rgba(0,0,0,0.15)] animate-in slide-in-from-bottom-2 duration-300">
          <div className="font-mono text-sm tracking-wide">
            {itemCount} {itemCount === 1 ? "item" : "items"} | £{total.toFixed(2)}
          </div>
          <Link 
            href="/cart"
            className="font-sans font-semibold text-sm hover:opacity-90 transition-opacity bg-dark text-cream px-4 py-1.5 rounded-sm"
          >
            View Cart
          </Link>
        </div>
      )}
    </>
  )
}
