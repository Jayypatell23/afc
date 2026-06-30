import { sdk } from "@/lib/medusa"
import { MOCK_PRODUCTS, MOCK_CATEGORIES } from "@/lib/mock-data"
import MenuSection from "@/components/MenuSection"

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

async function getProducts(): Promise<Product[]> {
  try {
    const { products } = await sdk.store.product.list({
      fields:
        "id,title,handle,description,thumbnail,*variants,*categories,+variants.calculated_price",
    })
    return (products as unknown as Product[]) ?? []
  } catch {
    return []
  }
}

async function getCategories(): Promise<Category[]> {
  try {
    const { product_categories } = await sdk.store.category.list({
      fields: "id,name,handle",
    })
    return (product_categories as unknown as Category[]) ?? []
  } catch {
    return []
  }
}

export default async function HomePage() {
  const [medusaProducts, medusaCategories] = await Promise.all([
    getProducts(),
    getCategories(),
  ])

  const products =
    medusaProducts.length > 0
      ? medusaProducts
      : (MOCK_PRODUCTS as unknown as Product[])

  const categories =
    medusaCategories.length > 0 ? medusaCategories : MOCK_CATEGORIES

  return (
    <div>
      {/* Hero */}
      <div className="border-b border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_360px] gap-0">
            {/* Left — text */}
            <div className="py-10 md:py-14 md:pr-12">
              <p
                className="font-mono text-xs uppercase tracking-[0.1em] mb-5"
                style={{ color: "#9a5b34" }}
              >
                Open today &middot; 11–9 &middot; Pickup &amp; delivery
              </p>
              <h1 className="font-serif text-3xl sm:text-4xl md:text-[2.625rem] font-semibold text-dark leading-[1.15] mb-4">
                Fresh food, made with care,<br className="hidden sm:inline" /> served at your corner.
              </h1>
              <p className="font-sans text-sm text-muted leading-relaxed max-w-sm">
                Home-style meals and snacks from Ambica Food Corner. Order
                ahead — we&apos;ll have it fresh and ready for you.
              </p>
            </div>

            {/* Right — photo placeholder (desktop only) */}
            <div
              className="hidden md:flex items-center justify-center self-stretch"
              style={{ background: "#e7ddc8", borderLeft: "1px solid #e6dcc8" }}
              aria-hidden="true"
            >
              <span className="font-serif text-2xl italic text-faint select-none">
                Ambica
              </span>
            </div>
          </div>
        </div>
      </div>

      <MenuSection products={products} categories={categories} />
    </div>
  )
}
