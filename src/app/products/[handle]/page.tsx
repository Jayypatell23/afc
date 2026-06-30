import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { sdk } from "@/lib/medusa"
import { getMockProduct } from "@/lib/mock-data"
import ProductAddToOrder from "@/components/ProductAddToOrder"

interface ProductVariant {
  id: string
  title: string
  calculated_price?: {
    calculated_amount: number
  }
}

interface Product {
  id: string
  title: string
  handle: string | null
  description: string | null
  thumbnail: string | null
  variants: ProductVariant[]
  images?: { id: string; url: string }[]
}

async function getProduct(handle: string): Promise<Product | null> {
  try {
    const { products } = await sdk.store.product.list({
      handle,
      fields:
        "id,title,handle,description,thumbnail,*variants,*images,+variants.calculated_price",
    } as Parameters<typeof sdk.store.product.list>[0])
    const list = products as unknown as Product[]
    return list?.[0] ?? null
  } catch {
    return null
  }
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ handle: string }>
}) {
  const { handle } = await params
  const medusaProduct = await getProduct(handle)
  const mockProduct = getMockProduct(handle)

  const product: Product | null = medusaProduct ?? (mockProduct as unknown as Product | null)

  if (!product) {
    notFound()
  }

  const photoUrl = (product as { images?: { id: string; url: string }[] }).images?.[0]?.url
    ?? product.thumbnail
    ?? null

  const description =
    product.description ??
    (mockProduct?.longDescription ?? null)

  const variants = (product.variants ?? []).map((v) => ({
    id: v.id,
    title: v.title,
    price: v.calculated_price?.calculated_amount ?? 0,
  }))

  const firstPrice = variants[0]?.price ?? 0

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
      {/* Back link */}
      <Link
        href="/"
        className="inline-flex items-center gap-1 font-mono text-xs uppercase tracking-[0.07em] text-muted hover:text-dark transition-colors mb-6"
      >
        ← Menu
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
        {/* Photo */}
        <div
          className="w-full rounded-sm overflow-hidden relative"
          style={{ height: 260, background: "#e7ddc8" }}
        >
          {photoUrl ? (
            <Image
              src={photoUrl}
              alt={product.title}
              fill
              className="object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="font-serif text-faint text-2xl italic select-none">Ambica</span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col gap-5">
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-dark leading-tight mb-1">
              {product.title}
            </h1>
            {variants.length === 1 && firstPrice > 0 && (
              <p className="font-mono text-sm text-dark">
                £{firstPrice.toFixed(2)}
              </p>
            )}
          </div>

          {description && (
            <p className="font-sans text-sm text-muted leading-relaxed">
              {description}
            </p>
          )}

          <ProductAddToOrder
            variants={variants}
            productTitle={product.title}
            thumbnail={product.thumbnail ?? undefined}
          />
        </div>
      </div>
    </div>
  )
}
