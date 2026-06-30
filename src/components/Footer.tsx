import Link from "next/link"

export default function Footer() {
  return (
    <footer
      className="mt-auto"
      style={{ borderTop: "1px solid #e6dcc8", background: "#f6f1e8" }}
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          {/* Brand */}
          <div className="flex items-center gap-2">
            <span
              className="inline-block rounded-sm bg-brand"
              style={{ width: 8, height: 8 }}
              aria-hidden="true"
            />
            <span className="font-serif font-semibold text-dark" style={{ fontSize: 18 }}>
              Ambica
            </span>
          </div>

          {/* Nav links */}
          <nav aria-label="Footer navigation">
            <ul className="flex flex-wrap gap-x-6 gap-y-2">
              {[
                { href: "/", label: "Menu" },
                { href: "/find-us", label: "Find us" },
                { href: "/about", label: "About" },
                { href: "/sign-in", label: "Sign in" },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="font-mono text-xs uppercase tracking-[0.07em] text-muted hover:text-dark transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Copyright */}
          <p className="font-mono text-xs text-faint">
            &copy; {new Date().getFullYear()} Ambica Food Corner
          </p>
        </div>

        <p className="font-sans text-xs text-faint mt-6 max-w-sm leading-relaxed">
          Ambica Food Corner &middot; Open Mon–Sat 11–9, Sun 12–6 &middot;
          Pickup &amp; local delivery
        </p>
      </div>
    </footer>
  )
}
