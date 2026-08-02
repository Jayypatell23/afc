// Ported from the backend's order-confirmation email template
// (apps/backend/src/modules/smtp-notification/templates/order-placed.ts) so the
// storefront's downloaded bill PDF, the admin's downloaded bill PDF, and the
// emailed bill all render identically. Keep this in sync with that file if the
// branding changes.

type BillItem = {
  title: string
  quantity: number
  unit_price: number
  total: number
}

type BillAddress = {
  address_1?: string | null
  city?: string | null
  province?: string | null
  postal_code?: string | null
  phone?: string | null
}

export type BillData = {
  customerName: string
  orderDisplayId: string | number
  orderDate?: string | Date | null
  currencyCode: string
  items: BillItem[]
  subtotal: number
  shippingTotal: number
  discountTotal?: number | null
  total: number
  mode?: string | null
  shippingAddress?: BillAddress | null
}

export type BillTemplateOptions = {
  from_name?: string
  logo_url?: string
  store_url?: string
}

const BRAND = "#A8674A"
const CREAM = "#FAF6EE"
const DARK = "#2E2A26"
const MUTED = "#6B6459"
const BORDER = "#E2D9CC"
const CARD = "#EFE6D8"

function formatMoney(amount: number, currencyCode: string) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: (currencyCode || "INR").toUpperCase(),
    maximumFractionDigits: 2,
  }).format(amount)
}

function formatDate(value?: string | Date | null) {
  if (!value) {
    return ""
  }
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) {
    return ""
  }
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
}

export function buildBillHtml(data: BillData, options: BillTemplateOptions = {}): string {
  const storeName = options.from_name || "Ambica Food Corner"

  const headerMark = options.logo_url
    ? `<img src="${options.logo_url}" alt="${escapeHtml(storeName)}" width="56" height="56" style="display:block;border-radius:12px;object-fit:cover;" />`
    : `<div style="width:56px;height:56px;border-radius:12px;background:${CREAM};display:flex;align-items:center;justify-content:center;font-family:Georgia,'Times New Roman',serif;font-size:22px;font-weight:700;color:${BRAND};line-height:56px;text-align:center;">
        ${escapeHtml(storeName.trim().charAt(0).toUpperCase())}
      </div>`

  const itemRows = data.items
    .map(
      (item) => `
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid ${BORDER};font-family:Arial,Helvetica,sans-serif;font-size:14px;color:${DARK};">
            ${escapeHtml(item.title)}
          </td>
          <td align="center" style="padding:10px 0;border-bottom:1px solid ${BORDER};font-family:Arial,Helvetica,sans-serif;font-size:13px;color:${MUTED};white-space:nowrap;">
            ${item.quantity}
          </td>
          <td align="right" style="padding:10px 0;border-bottom:1px solid ${BORDER};font-family:Arial,Helvetica,sans-serif;font-size:13px;color:${MUTED};white-space:nowrap;">
            ${formatMoney(item.unit_price, data.currencyCode)}
          </td>
          <td align="right" style="padding:10px 0;border-bottom:1px solid ${BORDER};font-family:Arial,Helvetica,sans-serif;font-size:14px;color:${DARK};white-space:nowrap;">
            ${formatMoney(item.total, data.currencyCode)}
          </td>
        </tr>`
    )
    .join("")

  const itemHeaderRow = `
    <tr>
      <td style="padding:0 0 8px;font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:700;letter-spacing:0.04em;text-transform:uppercase;color:${MUTED};border-bottom:1px solid ${BORDER};">Item</td>
      <td align="center" style="padding:0 0 8px;font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:700;letter-spacing:0.04em;text-transform:uppercase;color:${MUTED};border-bottom:1px solid ${BORDER};">Qty</td>
      <td align="right" style="padding:0 0 8px;font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:700;letter-spacing:0.04em;text-transform:uppercase;color:${MUTED};border-bottom:1px solid ${BORDER};">Rate</td>
      <td align="right" style="padding:0 0 8px;font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:700;letter-spacing:0.04em;text-transform:uppercase;color:${MUTED};border-bottom:1px solid ${BORDER};">Amount</td>
    </tr>`

  const summaryRow = (label: string, value: string, bold = false) => `
    <tr>
      <td style="padding:4px 0;font-family:Arial,Helvetica,sans-serif;font-size:${bold ? "15px" : "13px"};color:${bold ? DARK : MUTED};font-weight:${bold ? "700" : "400"};">
        ${label}
      </td>
      <td align="right" style="padding:4px 0;font-family:Arial,Helvetica,sans-serif;font-size:${bold ? "15px" : "13px"};color:${bold ? DARK : MUTED};font-weight:${bold ? "700" : "400"};white-space:nowrap;">
        ${value}
      </td>
    </tr>`

  const address = data.shippingAddress
  const isDelivery = data.mode !== "pickup"

  const addressBlock =
    isDelivery && address
      ? `
        <tr>
          <td style="padding:16px 0 0;">
            <p style="margin:0 0 4px;font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:${BRAND};">
              Delivering to
            </p>
            <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.6;color:${MUTED};">
              ${[address.address_1, address.city, address.province, address.postal_code]
                .filter(Boolean)
                .map((part) => escapeHtml(String(part)))
                .join(", ")}
              ${address.phone ? `<br/>Phone: ${escapeHtml(address.phone)}` : ""}
            </p>
          </td>
        </tr>`
      : `
        <tr>
          <td style="padding:16px 0 0;">
            <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.6;color:${MUTED};">
              This order will be ready for pickup at the store.
            </p>
          </td>
        </tr>`

  const title = `Your bill for order #${data.orderDisplayId} — ${storeName}`
  const orderDate = formatDate(data.orderDate)

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(title)}</title>
  </head>
  <body style="margin:0;padding:0;background:${CREAM};">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${CREAM};padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid ${BORDER};">
            <tr>
              <td style="background:${DARK};padding:28px 32px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td>${headerMark}</td>
                    <td align="right" style="font-family:Georgia,'Times New Roman',serif;font-size:18px;font-weight:700;color:${CREAM};">
                      ${escapeHtml(storeName)}
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:32px;">
                <p style="margin:0 0 4px;font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:${BRAND};">
                  Bill
                </p>
                <h1 style="margin:0 0 4px;font-family:Georgia,'Times New Roman',serif;font-size:22px;color:${DARK};">
                  Thanks, ${escapeHtml(data.customerName)}!
                </h1>
                <p style="margin:0 0 24px;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.6;color:${MUTED};">
                  Here's your bill for order <strong style="color:${DARK};">#${escapeHtml(String(data.orderDisplayId))}</strong>${orderDate ? ` &middot; ${escapeHtml(orderDate)}` : ""}.
                </p>

                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${CARD};border-radius:12px;padding:20px;">
                  <tr>
                    <td style="padding:0 4px;">
                      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                        ${itemHeaderRow}
                        ${itemRows}
                      </table>
                      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:12px;">
                        ${summaryRow("Subtotal", formatMoney(data.subtotal, data.currencyCode))}
                        ${summaryRow(isDelivery ? "Delivery" : "Pickup", formatMoney(data.shippingTotal, data.currencyCode))}
                        ${
                          data.discountTotal
                            ? summaryRow("Discount", `-${formatMoney(data.discountTotal, data.currencyCode)}`)
                            : ""
                        }
                        <tr><td colspan="2" style="border-top:1px solid ${BORDER};padding-top:8px;"></td></tr>
                        ${summaryRow("Total", formatMoney(data.total, data.currencyCode), true)}
                      </table>
                    </td>
                  </tr>
                </table>

                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  ${addressBlock}
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:20px 32px;background:${CREAM};border-top:1px solid ${BORDER};">
                <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:${MUTED};text-align:center;">
                  ${escapeHtml(storeName)} ${options.store_url ? `&middot; <a href="${options.store_url}" style="color:${BRAND};text-decoration:none;">${options.store_url.replace(/^https?:\/\//, "")}</a>` : ""}
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`
}
