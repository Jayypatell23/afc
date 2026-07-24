import Medusa from "@medusajs/js-sdk"

export const sdk = new Medusa({
  baseUrl: process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ?? "http://localhost:9000",
  // JWT (not session/cookie) auth: storefront and backend are separate
  // origins (different ports locally, different domains in production), and
  // browsers increasingly block cross-origin cookies even between localhost
  // ports. A bearer token in localStorage sidesteps that entirely.
  auth: { type: "jwt" },
  publishableKey: process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY,
})
