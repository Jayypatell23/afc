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

interface MenuPageBodyProps {
  products: Product[]
  categories: Category[]
}

export default function MenuPageBody({ products, categories }: MenuPageBodyProps) {
  return (
    <div className="relative pb-16 overflow-hidden" style={{ paddingTop: "4px" }}>
      {/* Oversized background wordmark */}
      <h1
        aria-hidden="true"
        className="text-center font-heading uppercase select-none pointer-events-none whitespace-nowrap"
        style={{
          fontSize: "clamp(4rem, 15vw, 11rem)",
          color: "var(--color-brand)",
          opacity: 0.16,
          lineHeight: 0.85,
          letterSpacing: "-0.02em",
          margin: 0,
        }}
      >
        Our Menu
      </h1>

      <div
        className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 rounded-2xl sm:rounded-3xl"
        style={{
          marginTop: "4px",
          background: "var(--color-cream)",
          border: "1px solid var(--color-border)",
          boxShadow: "0 20px 60px rgba(46,42,38,0.12)",
        }}
      >
        <div className="py-8 sm:py-10 px-4 sm:px-8">
          <p className="sr-only">Our menu</p>
          <MenuSection products={products} categories={categories} />
        </div>
      </div>
    </div>
  )
}
