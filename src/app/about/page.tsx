import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "About — Ambica Food Corner",
  description: "The story behind Ambica Food Corner.",
}

const VALUES = [
  {
    label: "Home-style",
    body: "Every dish is made the way it would be at home — fresh ingredients, proper seasoning, no shortcuts.",
  },
  {
    label: "By hand",
    body: "Everything we serve is prepared fresh each morning, on site. We don't believe in pre-made shortcuts.",
  },
  {
    label: "For everyone",
    body: "Good food shouldn't be complicated or expensive. We keep things simple, generous, and honest.",
  },
]

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      {/* Back */}
      <Link
        href="/"
        className="inline-flex items-center gap-1 font-mono text-xs uppercase tracking-[0.07em] text-muted hover:text-dark transition-colors mb-8"
      >
        ← Menu
      </Link>

      <p
        className="font-mono text-xs uppercase tracking-[0.1em] mb-3"
        style={{ color: "#9a5b34" }}
      >
        Our story
      </p>
      <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-dark leading-tight mb-6">
        About Ambica Food Corner
      </h1>

      {/* Intro block with photo placeholder */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 mb-14">
        <div>
          <p className="font-sans text-sm text-muted leading-relaxed mb-4">
            Ambica Food Corner started as a family venture with one simple
            goal — to bring the warmth of home-cooked food to more people.
            We believe the best meals are made with care, served fresh, and
            shared generously.
          </p>
          <p className="font-sans text-sm text-muted leading-relaxed">
            Every item on our menu is prepared fresh daily using quality
            ingredients. We change things up with the seasons and listen to
            what our customers love most. We&apos;re not trying to be fancy —
            we&apos;re trying to be the best part of your day.
          </p>
        </div>

        {/* Photo placeholder */}
        <div
          className="rounded-sm flex items-center justify-center"
          style={{ minHeight: 200, background: "#e7ddc8", border: "1px solid #e6dcc8" }}
          aria-hidden="true"
        >
          <span className="font-serif text-xl italic text-faint select-none">
            Ambica
          </span>
        </div>
      </div>

      {/* Values */}
      <div className="mb-14">
        <p
          className="font-mono text-xs uppercase tracking-[0.07em] mb-6"
          style={{ color: "#9a5b34" }}
        >
          What we&apos;re about
        </p>
        <ul className="flex flex-col">
          {VALUES.map(({ label, body }) => (
            <li
              key={label}
              className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-8 py-5"
              style={{ borderBottom: "1px solid #e6dcc8" }}
            >
              <span
                className="font-serif font-semibold text-dark shrink-0 sm:w-28"
                style={{ fontSize: "1.0625rem" }}
              >
                {label}
              </span>
              <p className="font-sans text-sm text-muted leading-relaxed">{body}</p>
            </li>
          ))}
        </ul>
      </div>

      {/* Sourcing */}
      <div className="mb-14">
        <p
          className="font-mono text-xs uppercase tracking-[0.07em] mb-4"
          style={{ color: "#9a5b34" }}
        >
          Our ingredients
        </p>
        <p className="font-sans text-sm text-muted leading-relaxed mb-3">
          We source fresh produce daily from trusted local suppliers. Quality
          ingredients are the foundation of everything we make — we&apos;d
          rather serve fewer things well than many things poorly.
        </p>
        <p className="font-sans text-sm text-muted leading-relaxed">
          We are committed to reducing waste and packaging across all order
          types. Your feedback helps us do better.
        </p>
      </div>

      {/* CTA */}
      <div
        className="rounded-sm px-6 py-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        style={{ background: "#f0e9d8", border: "1px solid #e6dcc8" }}
      >
        <div>
          <p className="font-serif text-lg font-semibold text-dark mb-1">
            Come and eat with us.
          </p>
          <p className="font-sans text-sm text-muted">
            Ambica Food Corner — Mon–Sat 11–9
          </p>
        </div>
        <div className="flex gap-3 shrink-0">
          <Link
            href="/find-us"
            className="font-sans text-sm font-medium text-dark py-2.5 px-5 rounded-sm transition-colors hover:bg-card"
            style={{ border: "1px solid #d3c7af" }}
          >
            Find us
          </Link>
          <Link
            href="/"
            className="font-sans font-semibold text-sm text-cream py-2.5 px-5 rounded-sm transition-opacity hover:opacity-90"
            style={{ background: "#a8492f" }}
          >
            Order now
          </Link>
        </div>
      </div>
    </div>
  )
}
