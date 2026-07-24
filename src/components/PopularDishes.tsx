"use client"

import { useRef, useState, useEffect } from "react"
import Link from "next/link"
import AddToCartBtn from "@/components/AddToCartBtn"
import { formatPrice } from "@/lib/format-price"

interface ProductVariant {
  id: string
  title: string
  calculated_price?: {
    calculated_amount: number
    currency_code: string
  }
}

interface Product {
  id: string
  title: string
  handle: string | null
  description: string | null
  thumbnail: string | null
  variants: ProductVariant[]
}

interface PopularDishesProps {
  products: Product[]
}

function DishCard({ product }: { product: Product }) {
  const variant = product.variants?.[0]
  const price = variant?.calculated_price?.calculated_amount ?? 0
  const handle = product.handle ?? product.id
  const [imgFailed, setImgFailed] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)

  // A 404'd thumbnail can finish loading (and fire its error event) before
  // hydration attaches onError — check the already-settled state on mount too.
  useEffect(() => {
    if (imgRef.current?.complete && imgRef.current.naturalWidth === 0) {
      setImgFailed(true)
    }
  }, [])

  return (
    <li className="shrink-0 w-[190px] sm:w-[210px] snap-start flex flex-col items-center text-center">
      <div className="relative mb-4">
        <Link
          href={`/products/${handle}`}
          className="block rounded-full overflow-hidden"
          style={{ width: 170, height: 170, background: "var(--color-card)" }}
        >
          {product.thumbnail && !imgFailed ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              ref={imgRef}
              src={product.thumbnail}
              alt={product.title}
              className="w-full h-full object-cover"
              loading="lazy"
              onError={() => setImgFailed(true)}
            />
          ) : (
            <span className="w-full h-full flex items-center justify-center font-serif italic text-faint text-base select-none">
              Ambica
            </span>
          )}
        </Link>

        {variant && (
          <div className="absolute bottom-1 right-1">
            <AddToCartBtn
              variant="circle"
              variantId={variant.id}
              productTitle={product.title}
              variantTitle={variant.title}
              price={price}
              thumbnail={product.thumbnail ?? undefined}
            />
          </div>
        )}
      </div>

      <Link
        href={`/products/${handle}`}
        className="font-sans font-semibold text-sm text-dark hover:text-brand transition-colors"
      >
        {product.title}
      </Link>
      {price > 0 && <p className="font-mono text-sm text-dark mt-1">{formatPrice(price)}</p>}
    </li>
  )
}

export default function PopularDishes({ products }: PopularDishesProps) {
  const scrollerRef = useRef<HTMLUListElement>(null)
  const items = products.slice(0, 8)

  const scrollBy = (direction: 1 | -1) => {
    scrollerRef.current?.scrollBy({ left: direction * 240, behavior: "smooth" })
  }

  if (items.length === 0) return null

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
      <div className="flex items-end justify-between mb-8 sm:mb-10">
        <div>
          <p
            className="font-mono text-xs uppercase tracking-[0.1em] mb-2"
            style={{ color: "var(--color-amber)" }}
          >
            Fan favourites
          </p>
          <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-dark">
            Popular dishes
          </h2>
        </div>
        <div className="hidden sm:flex items-center gap-2">
          <button
            type="button"
            onClick={() => scrollBy(-1)}
            aria-label="Scroll left"
            className="flex items-center justify-center w-10 h-10 rounded-full transition-colors hover:bg-card"
            style={{ border: "1px solid var(--color-border-md)" }}
          >
            <ArrowIcon direction="left" />
          </button>
          <button
            type="button"
            onClick={() => scrollBy(1)}
            aria-label="Scroll right"
            className="flex items-center justify-center w-10 h-10 rounded-full text-cream transition-opacity hover:opacity-90"
            style={{ background: "var(--color-brand)" }}
          >
            <ArrowIcon direction="right" />
          </button>
        </div>
      </div>

      <ul
        ref={scrollerRef}
        className="afc-scrollbar-hide flex gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-2"
      >
        {items.map((product) => (
          <DishCard key={product.id} product={product} />
        ))}
      </ul>
    </section>
  )
}

function ArrowIcon({ direction }: { direction: "left" | "right" }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ transform: direction === "left" ? "rotate(180deg)" : undefined }}
      aria-hidden="true"
    >
      <path d="M5 12h14" />
      <path d="M13 6l6 6-6 6" />
    </svg>
  )
}
