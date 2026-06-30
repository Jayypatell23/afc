export interface MockVariant {
  id: string
  title: string
  calculated_price: { calculated_amount: number; currency_code: string }
}

export interface MockProduct {
  id: string
  title: string
  handle: string
  description: string
  longDescription: string
  thumbnail: null
  categories: { id: string; name: string; handle: string }[]
  variants: MockVariant[]
}

export const MOCK_PRODUCTS: MockProduct[] = [
  {
    id: "mock-charred-corn-ribs",
    title: "Charred Corn Ribs",
    handle: "charred-corn-ribs",
    description: "Chilli butter, lime, smoked salt",
    longDescription:
      "Whole corn ribs grilled over fire until they curl and char. Finished with whipped chilli butter, a squeeze of lime and a pinch of smoked sea salt. A proper snack.",
    thumbnail: null,
    categories: [{ id: "cat-plates", name: "Plates", handle: "plates" }],
    variants: [
      {
        id: "var-ccr-regular",
        title: "Regular",
        calculated_price: { calculated_amount: 6.5, currency_code: "gbp" },
      },
    ],
  },
  {
    id: "mock-smoked-brisket-bun",
    title: "Smoked Brisket Bun",
    handle: "smoked-brisket-bun",
    description: "Pickled slaw, mustard, soft milk bun",
    longDescription:
      "Twelve-hour smoked brisket, pickled red slaw and grain mustard in a soft toasted milk bun. Cooked to order — the way we'd serve it at the stall.",
    thumbnail: null,
    categories: [{ id: "cat-plates", name: "Plates", handle: "plates" }],
    variants: [
      {
        id: "var-sbb-regular",
        title: "Regular",
        calculated_price: { calculated_amount: 9.5, currency_code: "gbp" },
      },
      {
        id: "var-sbb-large",
        title: "Large — extra brisket",
        calculated_price: { calculated_amount: 11.5, currency_code: "gbp" },
      },
    ],
  },
  {
    id: "mock-halloumi-wrap",
    title: "Halloumi & Harissa Wrap",
    handle: "halloumi-harissa-wrap",
    description: "Roasted pepper, herbs, warm flatbread",
    longDescription:
      "Grilled halloumi with a red harissa paste, slow-roasted peppers and fresh herbs wrapped in a warm flatbread straight off the grill. Vegetarian.",
    thumbnail: null,
    categories: [{ id: "cat-plates", name: "Plates", handle: "plates" }],
    variants: [
      {
        id: "var-hhw-regular",
        title: "Regular",
        calculated_price: { calculated_amount: 8.0, currency_code: "gbp" },
      },
    ],
  },
  {
    id: "mock-loaded-fries",
    title: "Loaded Kraft Fries",
    handle: "loaded-kraft-fries",
    description: "Confit garlic, parmesan, chives",
    longDescription:
      "Thick-cut fries tossed with slow-cooked confit garlic, shaved parmesan and fresh chives. A side that earns its place on the plate.",
    thumbnail: null,
    categories: [{ id: "cat-small", name: "Small", handle: "small" }],
    variants: [
      {
        id: "var-lkf",
        title: "Regular",
        calculated_price: { calculated_amount: 5.5, currency_code: "gbp" },
      },
    ],
  },
  {
    id: "mock-burnt-aubergine",
    title: "Burnt Aubergine Dip",
    handle: "burnt-aubergine-dip",
    description: "Flatbread, dukkah, olive oil",
    longDescription:
      "Aubergine charred directly over flame until smoky and soft, blended with tahini and lemon. Served with warm flatbread, a dukkah crumb and good olive oil.",
    thumbnail: null,
    categories: [{ id: "cat-small", name: "Small", handle: "small" }],
    variants: [
      {
        id: "var-bad",
        title: "Regular",
        calculated_price: { calculated_amount: 5.0, currency_code: "gbp" },
      },
    ],
  },
  {
    id: "mock-cardamom-bun",
    title: "Cardamom Bun",
    handle: "cardamom-bun",
    description: "Pearl sugar, brown butter",
    longDescription:
      "Enriched dough laminated with cardamom and brown butter, shaped by hand and baked until golden. Finished with pearl sugar while still warm.",
    thumbnail: null,
    categories: [{ id: "cat-sweet", name: "Sweet", handle: "sweet" }],
    variants: [
      {
        id: "var-cb",
        title: "Regular",
        calculated_price: { calculated_amount: 3.5, currency_code: "gbp" },
      },
    ],
  },
  {
    id: "mock-filter-coffee",
    title: "Filter Coffee",
    handle: "filter-coffee",
    description: "Single origin, brewed by the cup",
    longDescription:
      "We brew filter to order using a rotating selection of single-origin beans. Ask us what's on today — we love to talk about it.",
    thumbnail: null,
    categories: [{ id: "cat-drinks", name: "Drinks", handle: "drinks" }],
    variants: [
      {
        id: "var-fc",
        title: "Regular",
        calculated_price: { calculated_amount: 3.0, currency_code: "gbp" },
      },
    ],
  },
  {
    id: "mock-house-lemonade",
    title: "House Lemonade",
    handle: "house-lemonade",
    description: "Rosemary, lightly sweet",
    longDescription:
      "Fresh lemon juice with a rosemary and cane sugar syrup, topped up with sparkling water. Made in small batches through the day.",
    thumbnail: null,
    categories: [{ id: "cat-drinks", name: "Drinks", handle: "drinks" }],
    variants: [
      {
        id: "var-hl",
        title: "Regular",
        calculated_price: { calculated_amount: 3.5, currency_code: "gbp" },
      },
    ],
  },
]

export const MOCK_CATEGORIES = [
  { id: "cat-plates", name: "Plates", handle: "plates" },
  { id: "cat-small", name: "Small", handle: "small" },
  { id: "cat-sweet", name: "Sweet", handle: "sweet" },
  { id: "cat-drinks", name: "Drinks", handle: "drinks" },
]

export function getMockProduct(handle: string): MockProduct | null {
  return MOCK_PRODUCTS.find((p) => p.handle === handle) ?? null
}
