"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import Link from "next/link"
import AddToCartBtn from "@/components/AddToCartBtn"
import EmptyState from "@/components/EmptyState"
import StockBadge from "@/components/StockBadge"
import { formatPrice } from "@/lib/format-price"
import { sdk } from "@/lib/medusa"
import { MENU_PRODUCT_FIELDS, MENU_PAGE_SIZE } from "@/lib/menu-products"

interface ProductVariant {
  id: string
  title: string
  inventory_quantity?: number | null
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
  images?: { url: string }[]
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
  totalCount: number
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

  // Products uploaded via admin media (without an explicit thumbnail set)
  // only populate `images`, not `thumbnail` — match the product detail
  // page's fallback so those still show a photo here instead of the
  // placeholder mark.
  const photoUrl = product.images?.[0]?.url ?? product.thumbnail ?? null

  // Only variants with tracked inventory report a quantity — untracked
  // items (inventory_quantity is null/undefined) are treated as available.
  const trackedQuantity = variant?.inventory_quantity
  const outOfStock = trackedQuantity != null && trackedQuantity <= 0

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
          {photoUrl && !imgFailed ? (
            // Plain img avoids next/image blocking localhost and private-IP hosts
            // eslint-disable-next-line @next/next/no-img-element
            <img
              ref={imgRef}
              src={photoUrl}
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
              disabled={outOfStock}
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
        <div className="flex items-center justify-between mt-1">
          {price > 0 && <span className="font-mono text-sm text-dark">{formatPrice(price)}</span>}
          <StockBadge inStock={!outOfStock} />
        </div>
      </div>
    </li>
  )
}

export default function MenuSection({ products: initialProducts, totalCount, categories }: MenuSectionProps) {
  const tabs = ["All", ...categories.map((c) => c.name)]
  const [activeTab, setActiveTab] = useState("All")
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")

  const [products, setProducts] = useState(initialProducts)
  const [count, setCount] = useState(totalCount)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)

  // The server already gave us page 1 for the default (All, no search)
  // state via SSR — skip re-fetching that exact same page on mount.
  const isFirstRun = useRef(true)
  // Guards against an in-flight fetch from a stale filter (e.g. a slow
  // search request) overwriting the results of a filter changed after it.
  const requestId = useRef(0)

  // Debounce search input so every keystroke doesn't trigger a request.
  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(search.trim()), 300)
    return () => clearTimeout(timeout)
  }, [search])

  const regionId = process.env.NEXT_PUBLIC_MEDUSA_REGION_ID

  const activeCategoryId = categories.find(
    (c) => c.name.toLowerCase() === activeTab.toLowerCase()
  )?.id

  // Server-paginated: one page (in the active category) per call.
  const fetchCategoryPage = useCallback(
    async (offset: number) => {
      const { products: fetched, count: fetchedCount } = await sdk.store.product.list({
        fields: MENU_PRODUCT_FIELDS,
        limit: MENU_PAGE_SIZE,
        offset,
        ...(regionId ? { region_id: regionId } : {}),
        ...(activeCategoryId ? { category_id: [activeCategoryId] } : {}),
      } as Parameters<typeof sdk.store.product.list>[0])

      return { fetched: (fetched as unknown as Product[]) ?? [], fetchedCount }
    },
    [activeCategoryId, regionId]
  )

  // Medusa's store product search (`q`) isn't reliable without a search-engine
  // module (MeiliSearch/Algolia) configured — tested against this store, it
  // returned 39 of 46 products for "cheese". Fetch everything in the active
  // category instead and filter by title/description client-side, same as
  // this component did before server-side pagination was introduced.
  const SEARCH_FETCH_PAGE_SIZE = 100
  const fetchAllMatchingSearch = useCallback(
    async (term: string) => {
      const all: Product[] = []
      let offset = 0
      let total = Infinity
      while (offset < total) {
        const { products: fetched, count: fetchedCount } = await sdk.store.product.list({
          fields: MENU_PRODUCT_FIELDS,
          limit: SEARCH_FETCH_PAGE_SIZE,
          offset,
          ...(regionId ? { region_id: regionId } : {}),
          ...(activeCategoryId ? { category_id: [activeCategoryId] } : {}),
        } as Parameters<typeof sdk.store.product.list>[0])
        all.push(...((fetched as unknown as Product[]) ?? []))
        total = fetchedCount
        offset += SEARCH_FETCH_PAGE_SIZE
      }

      const q = term.toLowerCase()
      const matched = all.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          (p.description ?? "").toLowerCase().includes(q)
      )
      return { fetched: matched, fetchedCount: matched.length }
    },
    [activeCategoryId, regionId]
  )

  // Re-fetch whenever the category or (debounced) search changes: page 1 of
  // the category when browsing, or every matching product when searching
  // (search results aren't paginated further — "Load more" only applies to
  // plain category browsing).
  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false
      return
    }

    const thisRequest = ++requestId.current
    setIsLoading(true)
    const run = debouncedSearch ? fetchAllMatchingSearch(debouncedSearch) : fetchCategoryPage(0)
    run
      .then(({ fetched, fetchedCount }) => {
        if (thisRequest !== requestId.current) return
        setProducts(fetched)
        setCount(fetchedCount)
      })
      .catch((err) => console.error("[menu] Failed to filter products:", err))
      .finally(() => {
        if (thisRequest === requestId.current) setIsLoading(false)
      })
  }, [activeTab, debouncedSearch, fetchCategoryPage, fetchAllMatchingSearch])

  const handleLoadMore = async () => {
    const thisRequest = requestId.current
    setIsLoadingMore(true)
    try {
      const { fetched, fetchedCount } = await fetchCategoryPage(products.length)
      if (thisRequest !== requestId.current) return
      setProducts((prev) => [...prev, ...fetched])
      setCount(fetchedCount)
    } catch (err) {
      console.error("[menu] Failed to load more products:", err)
    } finally {
      setIsLoadingMore(false)
    }
  }

  const hasMore = products.length < count

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
      {!isLoading && products.length === 0 ? (
        <EmptyState
          title={search ? "No results found" : "No items available"}
          description={
            search
              ? `Nothing matched "${search}". Try a different search.`
              : "The menu is unavailable right now. Please check back soon."
          }
        />
      ) : (
        <>
          <ul
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
            role="list"
            aria-busy={isLoading}
            style={{ opacity: isLoading ? 0.5 : 1, transition: "opacity 150ms" }}
          >
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </ul>

          {hasMore && (
            <div className="flex justify-center mt-8">
              <button
                type="button"
                onClick={handleLoadMore}
                disabled={isLoadingMore || isLoading}
                className="font-mono text-xs uppercase tracking-[0.07em] px-6 py-3 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  color: "var(--color-dark)",
                  border: "1px solid var(--color-border)",
                  background: "var(--color-card)",
                }}
              >
                {isLoadingMore ? "Loading…" : "Load more"}
              </button>
            </div>
          )}
        </>
      )}
    </section>
  )
}
