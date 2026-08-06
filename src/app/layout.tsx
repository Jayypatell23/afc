import type { Metadata } from "next"
import { Spectral, Hanken_Grotesk, Spline_Sans_Mono, Anton } from "next/font/google"
import "./globals.css"
import { CartProvider } from "@/lib/cart-context"
import { OrderStatusProvider } from "@/lib/order-status-context"
import LayoutWrapper from "@/components/LayoutWrapper"

const THEME_BOOT_SCRIPT = `
(function () {
  try {
    var stored = localStorage.getItem("afc-theme");
    var theme = stored === "dark" || stored === "light"
      ? stored
      : (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    document.documentElement.setAttribute("data-theme", theme);
  } catch (e) {}
})();
`

const spectral = Spectral({
  variable: "--font-spectral",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
})

const hanken = Hanken_Grotesk({
  variable: "--font-hanken",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
})

const spline = Spline_Sans_Mono({
  variable: "--font-spline",
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
})

const anton = Anton({
  variable: "--font-anton",
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
})

export const metadata: Metadata = {
  title: "Ambica Food Corner",
  description: "Fresh food, ordered simply — Ambica Food Corner.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      data-theme="light"
      suppressHydrationWarning
      className={`${spectral.variable} ${hanken.variable} ${spline.variable} ${anton.variable} h-full`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{ __html: THEME_BOOT_SCRIPT }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-cream text-dark antialiased">
        <OrderStatusProvider>
          <CartProvider>
            <LayoutWrapper>
              {children}
            </LayoutWrapper>
          </CartProvider>
        </OrderStatusProvider>
      </body>
    </html>
  )
}
