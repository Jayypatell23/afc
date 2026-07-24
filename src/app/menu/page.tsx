import { sdk } from "@/lib/medusa"
import MenuPageBody from "@/components/MenuPageBody"

// Menu rarely changes; cache the rendered page and its data fetches for
// 60s instead of hitting the backend (and its price calculations) on
// every request.
export const revalidate = 60

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
  const regionId = process.env.NEXT_PUBLIC_MEDUSA_REGION_ID
  try {
    const { products } = await sdk.store.product.list({
      fields:
        "id,title,handle,description,thumbnail,*variants,*categories,+variants.calculated_price",
      // region_id is required by Medusa to calculate variant prices.
      // Without it the API returns a pricing-context error and products come back empty.
      ...(regionId ? { region_id: regionId } : {}),
    } as Parameters<typeof sdk.store.product.list>[0])
    return (products as unknown as Product[]) ?? []
  } catch (err) {
    console.error("[menu] getProducts error:", err)
    return []
  }
}

async function getCategories(): Promise<Category[]> {
  try {
    const { product_categories } = await sdk.store.category.list({
      fields: "id,name,handle",
    })
    return (product_categories as unknown as Category[]) ?? []
  } catch (err) {
    console.error("[menu] getCategories error:", err)
    return []
  }
}


export default async function HomePage() {
  const [products, categories] = await Promise.all([
    getProducts(),
    getCategories(),
  ])

  return <MenuPageBody products={products} categories={categories} />
}
