import type { Metadata } from "next"
import { Spectral, Hanken_Grotesk, Spline_Sans_Mono } from "next/font/google"
import "./globals.css"
import { CartProvider } from "@/lib/cart-context"
import LayoutWrapper from "@/components/LayoutWrapper"

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
      className={`${spectral.variable} ${hanken.variable} ${spline.variable} h-full`}
    >
      <body className="min-h-full flex flex-col bg-cream text-dark antialiased">
        <CartProvider>
          <LayoutWrapper>
            {children}
          </LayoutWrapper>
        </CartProvider>
      </body>
    </html>
  )
}
