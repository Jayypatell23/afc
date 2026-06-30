"use client"

import { useState, useMemo } from "react"
import Image from "next/image"
import Link from "next/link"
import AddToCartBtn from "@/components/AddToCartBtn"
import EmptyState from "@/components/EmptyState"

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

const TABS = ["All", "Plates", "Small", "Sweet", "Drinks"]

function getPrice(product: Product): number {
  return product.variants?.[0]?.calculated_price?.calculated_amount ?? 0
}

function getDefaultVariant(product: Product): ProductVariant | undefined {
  return product.variants?.[0]
}

function ProductCard({ product }: { product: Product }) {
  const variant = getDefaultVariant(product)
  const price = getPrice(product)
  const handle = product.handle ?? product.id

  return (
    <li
      className="flex items-start justify-between gap-4 py-5"
      style={{ borderBottom: "1px solid #e6dcc8" }}
    >
      <div className="flex items-start gap-3 flex-1 min-w-0">
        {/* Thumbnail or placeholder */}
        <Link href={`/products/${handle}`} className="shrink-0" tabIndex={-1} aria-hidden="true">
          <span
            className="block rounded-sm overflow-hidden"
            style={{ width: 60, height: 60, background: "#e7ddc8", flexShrink: 0 }}
          >
            {product.thumbnail ? (
              <Image
                src={product.thumbnail}
                alt={product.title}
                width={60}
                height={60}
                className="object-cover w-full h-full"
                loading="lazy"
              />
            ) : (
              <span className="w-full h-full flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
                    fill="#9a8d79"
                    opacity="0.4"
                  />
                </svg>
              </span>
            )}
          </span>
        </Link>

        <div className="min-w-0">
          <Link
            href={`/products/${handle}`}
            className="font-sans font-semibold text-sm text-dark hover:text-brand transition-colors"
          >
            {product.title}
          </Link>
          {product.description && (
            <p className="font-sans text-xs text-muted mt-0.5 leading-relaxed line-clamp-2">
              {product.description}
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-col items-end gap-2 shrink-0">
        {price > 0 && (
          <span className="font-mono text-sm text-dark">
            £{price.toFixed(2)}
          </span>
        )}
        {variant && (
          <AddToCartBtn
            variantId={variant.id}
            productTitle={product.title}
            variantTitle={variant.title}
            price={price}
            thumbnail={product.thumbnail ?? undefined}
          />
        )}
      </div>
    </li>
  )
}

export default function MenuSection({ products }: MenuSectionProps) {
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
    <section className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#9a8d79"
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
            className="w-full font-sans text-sm bg-input text-dark placeholder:text-faint pl-9 pr-4 py-2.5 rounded-sm outline-none focus:ring-1 focus:ring-border-md"
            style={{ border: "1px solid #e6dcc8" }}
            aria-label="Search the menu"
          />
        </div>
      </div>

      {/* Category tabs */}
      <div
        className="flex gap-6 border-b border-border mb-6 overflow-x-auto"
        role="tablist"
        aria-label="Menu categories"
      >
        {TABS.map((tab) => {
          const isActive = tab === activeTab
          return (
            <button
              key={tab}
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveTab(tab)}
              className="font-mono text-xs uppercase tracking-[0.07em] shrink-0 transition-colors"
              style={{
                color: isActive ? "#241f1b" : "#9a8d79",
                background: "none",
                border: "none",
                borderBottom: `2px solid ${isActive ? "#241f1b" : "transparent"}`,
                marginBottom: -1,
                cursor: "pointer",
                paddingBottom: 12,
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
          className="grid grid-cols-1 md:grid-cols-2 gap-x-10"
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
