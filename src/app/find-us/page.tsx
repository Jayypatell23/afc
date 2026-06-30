import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Find Us — Ambica Food Corner",
  description: "Where to find Ambica Food Corner and when we are open.",
}

const HOURS = [
  { day: "Monday", hours: "11:00 – 21:00" },
  { day: "Tuesday", hours: "11:00 – 21:00" },
  { day: "Wednesday", hours: "11:00 – 21:00" },
  { day: "Thursday", hours: "11:00 – 21:00" },
  { day: "Friday", hours: "11:00 – 22:00" },
  { day: "Saturday", hours: "10:00 – 22:00" },
  { day: "Sunday", hours: "12:00 – 18:00" },
]

const TODAY = new Date().toLocaleDateString("en-GB", { weekday: "long" })

export default function FindUsPage() {
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
        Location
      </p>
      <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-dark leading-tight mb-10">
        Find us
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16">
        {/* Left — address & contact */}
        <div className="flex flex-col gap-8">
          {/* Address */}
          <div>
            <p
              className="font-mono text-xs uppercase tracking-[0.07em] mb-3"
              style={{ color: "#9a5b34" }}
            >
              Address
            </p>
            <address className="not-italic font-sans text-sm text-dark leading-relaxed">
              Ambica Food Corner
              <br />
              Shop No. 5, Main Market
            </address>
            <p className="font-sans text-xs text-muted mt-2 leading-relaxed">
              Look for our sign at the entrance to the market — we&apos;re
              open six days a week with fresh food every day.
            </p>
          </div>

          {/* Map placeholder */}
          <div
            className="w-full rounded-sm flex items-center justify-center"
            style={{ height: 200, background: "#e7ddc8", border: "1px solid #e6dcc8" }}
            aria-label="Map of Ambica Food Corner location"
          >
            <div className="text-center">
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                className="mx-auto mb-2"
                aria-hidden="true"
              >
                <path
                  d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
                  fill="#a8492f"
                  opacity="0.5"
                />
                <circle cx="12" cy="9" r="2.5" fill="#a8492f" />
              </svg>
              <p className="font-mono text-xs text-muted uppercase tracking-[0.07em]">
                Ambica Food Corner
              </p>
            </div>
          </div>

          {/* Getting here */}
          <div>
            <p
              className="font-mono text-xs uppercase tracking-[0.07em] mb-3"
              style={{ color: "#9a5b34" }}
            >
              Getting here
            </p>
            <ul className="font-sans text-sm text-dark flex flex-col gap-1.5">
              <li className="flex items-start gap-2">
                <span className="text-faint mt-0.5">—</span>
                <span>Easily accessible from the main road</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-faint mt-0.5">—</span>
                <span>Ample parking available near the market</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-faint mt-0.5">—</span>
                <span>Local bus stop within 2 minutes&apos; walk</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Right — hours */}
        <div>
          <p
            className="font-mono text-xs uppercase tracking-[0.07em] mb-3"
            style={{ color: "#9a5b34" }}
          >
            Opening hours
          </p>
          <ul className="flex flex-col">
            {HOURS.map(({ day, hours }) => {
              const isToday = day === TODAY
              return (
                <li
                  key={day}
                  className="flex justify-between py-3"
                  style={{
                    borderBottom: "1px solid #e6dcc8",
                    background: isToday ? "rgba(168, 73, 47, 0.04)" : "transparent",
                  }}
                >
                  <span
                    className="font-sans text-sm"
                    style={{
                      color: isToday ? "#a8492f" : "#241f1b",
                      fontWeight: isToday ? 600 : 400,
                    }}
                  >
                    {day}
                    {isToday && (
                      <span
                        className="font-mono text-xs ml-2"
                        style={{ color: "#9a5b34" }}
                      >
                        Today
                      </span>
                    )}
                  </span>
                  <span
                    className="font-mono text-sm"
                    style={{ color: isToday ? "#241f1b" : "#6f6456" }}
                  >
                    {hours}
                  </span>
                </li>
              )
            })}
          </ul>

          <div
            className="mt-6 rounded-sm px-4 py-3"
            style={{ background: "#f0e9d8", border: "1px solid #e6dcc8" }}
          >
            <p className="font-sans text-sm text-dark font-medium mb-1">
              Pickup &amp; local delivery
            </p>
            <p className="font-sans text-xs text-muted leading-relaxed">
              Order ahead on the website — we&apos;ll have it fresh and
              ready. Local delivery available for nearby areas.
            </p>
          </div>

          <div className="mt-6">
            <Link
              href="/"
              className="inline-block font-sans font-semibold text-sm text-cream py-3 px-6 rounded-sm transition-opacity hover:opacity-90"
              style={{ background: "#a8492f" }}
            >
              Order now
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
