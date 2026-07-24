"use client"

import { useState, useMemo, useRef, useEffect } from "react"
import Link from "next/link"
import AddToCartBtn from "@/components/AddToCartBtn"
import EmptyState from "@/components/EmptyState"
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
  categories?: { id: string; name: string; handle: string }[]
}

interface Category {
  id: string
  name: string
  handle: string
}

interface MenuSectionProps {
  products: Product[]
  categories: Category[]
}

function getPrice(product: Product): number {
  return product.variants?.[0]?.calculated_price?.calculated_amount ?? 0
}

function getDefaultVariant(product: Product): ProductVariant | undefined {
  return product.variants?.[0]
}

// Seed descriptions end with a tag like "(Best Seller)" / "(New)" — pull that
// out as a card badge instead of showing it as prose.
const BADGE_PATTERN = /\s*\(([^)]+)\)\s*$/

function splitDescriptionAndBadge(description: string | null): {
  text: string | null
  badge: string | null
} {
  if (!description) return { text: null, badge: null }
  const match = description.match(BADGE_PATTERN)
  if (!match) return { text: description, badge: null }
  return { text: description.slice(0, match.index).trim(), badge: match[1] }
}

function ProductCard({ product }: { product: Product }) {
  const variant = getDefaultVariant(product)
  const price = getPrice(product)
  const handle = product.handle ?? product.id
  const [imgFailed, setImgFailed] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)
  const { text: description, badge } = splitDescriptionAndBadge(product.description)

  // A 404'd thumbnail can finish loading (and fire its error event) before
  // hydration attaches onError — check the already-settled state on mount too.
  useEffect(() => {
    if (imgRef.current?.complete && imgRef.current.naturalWidth === 0) {
      setImgFailed(true)
    }
  }, [])

  return (
    <li
      className="relative rounded-xl overflow-hidden flex flex-col"
      style={{ background: "var(--color-cream)", border: "1px solid var(--color-border)" }}
    >
      <div className="relative shrink-0">
        <Link
          href={`/products/${handle}`}
          className="relative block aspect-[4/3]"
          style={{ background: "var(--color-card)" }}
        >
          {product.thumbnail && !imgFailed ? (
            // Plain img avoids next/image blocking localhost and private-IP hosts
            // eslint-disable-next-line @next/next/no-img-element
            <img
              ref={imgRef}
              src={product.thumbnail}
              alt={product.title}
              className="absolute inset-0 w-full h-full object-cover"
              loading="lazy"
              onError={() => setImgFailed(true)}
            />
          ) : (
            <span className="absolute inset-0 flex items-center justify-center">
              <span className="font-serif italic text-faint text-lg select-none">Ambica</span>
            </span>
          )}

          {badge && (
            <span
              className="absolute top-2.5 left-2.5 font-mono text-[10px] uppercase tracking-[0.06em] text-cream px-2.5 py-1 rounded-full"
              style={{ background: "var(--color-dark)" }}
            >
              {badge}
            </span>
          )}
        </Link>

        {variant && (
          <div className="absolute -bottom-4 right-3">
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

      <div className="pt-5 pb-4 px-4 flex flex-col gap-1 flex-1">
        <Link
          href={`/products/${handle}`}
          className="font-sans font-semibold text-sm text-dark hover:text-brand transition-colors"
        >
          {product.title}
        </Link>
        {description && (
          <p className="font-sans text-xs text-muted leading-relaxed line-clamp-2">
            {description}
          </p>
        )}
        {price > 0 && (
          <span className="font-mono text-sm text-dark mt-1">{formatPrice(price)}</span>
        )}
      </div>
    </li>
  )
}

export default function MenuSection({ products, categories }: MenuSectionProps) {
  const tabs = ["All", ...categories.map((c) => c.name)]
  const [activeTab, setActiveTab] = useState("All")
  const [search, setSearch] = useState("")

  const filtered = useMemo(() => {
    let list = products

    if (activeTab !== "All") {
      list = list.filter((p) =>
        p.categories?.some(
          (c) => c.name.toLowerCase() === activeTab.toLowerCase()
        )
      )
    }

    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          (p.description ?? "").toLowerCase().includes(q)
      )
    }

    return list
  }, [products, activeTab, search])

  return (
    <section>
      {/* Search */}
      <div className="mb-5">
        <div className="relative">
          <svg
            className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--color-faint)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search the menu"
            className="w-full font-sans text-sm bg-input text-dark placeholder:text-faint pl-9 pr-4 py-2.5 rounded-full outline-none focus:ring-1 focus:ring-border-md"
            style={{ border: "1px solid var(--color-border)" }}
            aria-label="Search the menu"
          />
        </div>
      </div>

      {/* Category tabs */}
      <div
        className="flex gap-2 mb-6 overflow-x-auto pb-1"
        role="tablist"
        aria-label="Menu categories"
      >
        {tabs.map((tab) => {
          const isActive = tab === activeTab
          return (
            <button
              key={tab}
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveTab(tab)}
              className="font-mono text-xs uppercase tracking-[0.06em] shrink-0 transition-colors px-4 py-2 rounded-full"
              style={{
                color: isActive ? "var(--color-cream)" : "var(--color-muted)",
                background: isActive ? "var(--color-brand)" : "transparent",
                border: `1px solid ${isActive ? "var(--color-brand)" : "var(--color-border)"}`,
                cursor: "pointer",
              }}
            >
              {tab}
            </button>
          )
        })}
      </div>

      {/* Items */}
      {filtered.length === 0 ? (
        <EmptyState
          title={search ? "No results found" : "No items available"}
          description={
            search
              ? `Nothing matched "${search}". Try a different search.`
              : "The menu is unavailable right now. Please check back soon."
          }
        />
      ) : (
        <ul
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
          role="list"
        >
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </ul>
      )}
    </section>
  )
}
