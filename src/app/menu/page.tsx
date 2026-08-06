import { sdk } from "@/lib/medusa"
import MenuPageBody from "@/components/MenuPageBody"
import { MENU_PRODUCT_FIELDS, MENU_PAGE_SIZE } from "@/lib/menu-products"

// Menu rarely changes; cache the rendered page and its data fetches for
// 60s instead of hitting the backend (and its price calculations) on
// every request.
export const revalidate = 60

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

// Only the first page loads server-side, for a fast initial paint — the rest
// is fetched on demand client-side (see MenuSection's "Load more" / category
// & search filtering) instead of pulling the entire catalog into one request.
async function getFirstProductsPage(): Promise<{ products: Product[]; count: number }> {
  const regionId = process.env.NEXT_PUBLIC_MEDUSA_REGION_ID
  try {
    const { products, count } = await sdk.store.product.list({
      fields: MENU_PRODUCT_FIELDS,
      limit: MENU_PAGE_SIZE,
      offset: 0,
      // region_id is required by Medusa to calculate variant prices.
      // Without it the API returns a pricing-context error and products come back empty.
      ...(regionId ? { region_id: regionId } : {}),
    } as Parameters<typeof sdk.store.product.list>[0])
    return { products: (products as unknown as Product[]) ?? [], count }
  } catch (err) {
    console.error("[menu] getFirstProductsPage error:", err)
    return { products: [], count: 0 }
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
  const [{ products, count }, categories] = await Promise.all([
    getFirstProductsPage(),
    getCategories(),
  ])

  return <MenuPageBody products={products} totalCount={count} categories={categories} />
}
