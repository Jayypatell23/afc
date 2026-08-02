"use client"

import { useCallback, useState } from "react"
import Toast from "@/components/Toast"
import { buildBillHtml, type BillData } from "@/lib/bill-template"

interface ReceiptActionsProps {
  shareTitle: string
  shareText: string
  billData: BillData
  orderDisplayId: string | number
}

async function downloadBillPdf(billData: BillData, orderDisplayId: string | number) {
  const html = buildBillHtml(billData, { from_name: "Ambica Food Corner", logo_url: "/logo.png" })

  const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
    import("jspdf"),
    import("html2canvas"),
  ])

  const iframe = document.createElement("iframe")
  iframe.style.position = "fixed"
  iframe.style.left = "-9999px"
  iframe.style.top = "0"
  iframe.style.width = "600px"
  iframe.style.height = "900px"
  iframe.style.border = "0"
  document.body.appendChild(iframe)

  try {
    await new Promise<void>((resolve) => {
      iframe.onload = () => resolve()
      iframe.srcdoc = html
    })

    const body = iframe.contentDocument?.body
    if (!body) {
      throw new Error("Failed to render bill for PDF export")
    }

    const canvas = await html2canvas(body, { scale: 2, useCORS: true })
    const imgData = canvas.toDataURL("image/png")

    const pdf = new jsPDF({ unit: "px", format: [canvas.width, canvas.height] })
    pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height)
    pdf.save(`order-${orderDisplayId}-bill.pdf`)
  } finally {
    document.body.removeChild(iframe)
  }
}

export default function ReceiptActions({ shareTitle, shareText, billData, orderDisplayId }: ReceiptActionsProps) {
  const [toastMessage, setToastMessage] = useState("")
  const [toastVisible, setToastVisible] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)

  const showToast = useCallback((message: string) => {
    setToastMessage(message)
    setToastVisible(true)
  }, [])

  const handleShare = useCallback(async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: shareTitle, text: shareText })
        return
      } catch (err) {
        if ((err as Error)?.name === "AbortError") return
        // fall through to clipboard below
      }
    }

    try {
      await navigator.clipboard.writeText(shareText)
      showToast("Receipt copied to clipboard")
    } catch {
      showToast("Couldn't share — try downloading the bill instead")
    }
  }, [shareTitle, shareText, showToast])

  const handleDownload = useCallback(async () => {
    setIsDownloading(true)
    try {
      await downloadBillPdf(billData, orderDisplayId)
    } catch (err) {
      console.error("Failed to generate bill PDF:", err)
      showToast("Couldn't generate the PDF — please try again")
    } finally {
      setIsDownloading(false)
    }
  }, [billData, orderDisplayId, showToast])

  return (
    <div className="print:hidden flex gap-3 mb-8">
      <button
        type="button"
        onClick={handleShare}
        className="flex-1 font-mono text-xs uppercase tracking-[0.07em] hover:bg-dark hover:text-cream transition-colors"
        style={{
          border: "1px solid var(--color-dark)",
          background: "transparent",
          padding: "10px 12px",
          borderRadius: 2,
          cursor: "pointer",
        }}
      >
        Share receipt
      </button>
      <button
        type="button"
        onClick={handleDownload}
        disabled={isDownloading}
        className="flex-1 font-mono text-xs uppercase tracking-[0.07em] hover:bg-dark hover:text-cream transition-colors disabled:opacity-60"
        style={{
          border: "1px solid var(--color-dark)",
          background: "transparent",
          padding: "10px 12px",
          borderRadius: 2,
          cursor: isDownloading ? "default" : "pointer",
        }}
      >
        {isDownloading ? "Preparing…" : "Download bill"}
      </button>
      <Toast message={toastMessage} visible={toastVisible} onDismiss={() => setToastVisible(false)} />
    </div>
  )
}
