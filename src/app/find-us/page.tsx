import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Find Us — Ambica Food Corner",
  description: "Where to find Ambica Food Corner and when we are open.",
}

const HOURS = [
  { day: "Monday", hours: "17:00 – 02:00" },
  { day: "Tuesday", hours: "17:00 – 02:00" },
  { day: "Wednesday", hours: "17:00 – 02:00" },
  { day: "Thursday", hours: "17:00 – 02:00" },
  { day: "Friday", hours: "17:00 – 02:00" },
  { day: "Saturday", hours: "17:00 – 02:00" },
  { day: "Sunday", hours: "17:00 – 02:00" },
]

const TODAY = new Date().toLocaleDateString("en-GB", { weekday: "long" })

export default function FindUsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      {/* Back */}
      <Link
        href="/menu"
        className="inline-flex items-center gap-1 font-mono text-xs uppercase tracking-[0.07em] text-muted hover:text-dark transition-colors mb-8"
      >
        ← Menu
      </Link>

      <p
        className="font-mono text-xs uppercase tracking-[0.1em] mb-3"
        style={{ color: "var(--color-amber)" }}
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
              style={{ color: "var(--color-amber)" }}
            >
              Address
            </p>
            <address className="not-italic font-sans text-sm text-dark leading-relaxed">
              Ambica Food Corner
              <br />
              Vaso Circle, Vaso, Gujarat 387380
            </address>
            <p className="font-sans text-xs text-muted mt-2 leading-relaxed">
              Look for our sign at the entrance to the market — we&apos;re
              open daily with fresh food every day.
            </p>
          </div>

          {/* Google Map */}
          <div
            className="w-full rounded-sm overflow-hidden shadow-sm border"
            style={{ height: 250, borderColor: "var(--color-border)" }}
          >
            <iframe
              title="Ambica Food Corner Google Maps Location"
              src="https://maps.google.com/maps?q=Ambica%20Food%20Corner,%20Vaso,%20Gujarat%20387380&t=&z=16&ie=UTF8&iwloc=&output=embed"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>

          {/* Getting here */}
          <div>
            <p
              className="font-mono text-xs uppercase tracking-[0.07em] mb-3"
              style={{ color: "var(--color-amber)" }}
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
                <span>Local bus stop within 2 minutes&apos; walk</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Right — hours */}
        <div>
          <p
            className="font-mono text-xs uppercase tracking-[0.07em] mb-3"
            style={{ color: "var(--color-amber)" }}
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
                    borderBottom: "1px solid var(--color-border)",
                    background: isToday ? "rgba(168, 73, 47, 0.04)" : "transparent",
                  }}
                >
                  <span
                    className="font-sans text-sm"
                    style={{
                      color: isToday ? "var(--color-brand)" : "var(--color-dark)",
                      fontWeight: isToday ? 600 : 400,
                    }}
                  >
                    {day}
                    {isToday && (
                      <span
                        className="font-mono text-xs ml-2"
                        style={{ color: "var(--color-amber)" }}
                      >
                        Today
                      </span>
                    )}
                  </span>
                  <span
                    className="font-mono text-sm"
                    style={{ color: isToday ? "var(--color-dark)" : "var(--color-muted)" }}
                  >
                    {hours}
                  </span>
                </li>
              )
            })}
          </ul>

          <div
            className="mt-6 rounded-sm px-4 py-3"
            style={{ background: "var(--color-card)", border: "1px solid var(--color-border)" }}
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
              style={{ background: "var(--color-brand)" }}
            >
              Order now
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
