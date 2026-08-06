import { sdk } from "@/lib/medusa"

// Best-effort error reporting to the backend's logs (visible in Render).
// Never throws — a failure to report an error must never itself break the
// checkout flow the error already interrupted.
export function reportClientError(
  context: string,
  error: unknown,
  extra?: Record<string, unknown>
) {
  console.error(`[${context}]`, error)

  const message = error instanceof Error ? error.message : String(error)
  const stack = error instanceof Error ? error.stack : undefined

  sdk.client
    .fetch("/store/log-client-error", {
      method: "POST",
      body: { context, message, stack, extra },
    })
    .catch(() => {
      // Reporting failed too (e.g. offline) — nothing more we can do here.
    })
}
