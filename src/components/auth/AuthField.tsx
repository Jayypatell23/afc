"use client"

import { useId } from "react"
import { AlertIcon, CheckCircleIcon } from "./AuthIcons"

interface AuthFieldProps {
  label: string
  type: string
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  icon: React.ReactNode
  placeholder?: string
  error?: string
  valid?: boolean
  autoComplete?: string
  inputMode?: "text" | "tel" | "email" | "numeric"
  maxLength?: number
}

export default function AuthField({
  label,
  type,
  value,
  onChange,
  onBlur,
  icon,
  placeholder,
  error,
  valid,
  autoComplete,
  inputMode,
  maxLength,
}: AuthFieldProps) {
  const id = useId()
  const errorId = `${id}-error`

  return (
    <div>
      <label
        htmlFor={id}
        className="block font-mono text-xs uppercase tracking-[0.07em] text-faint mb-1.5"
      >
        {label}
      </label>
      <div
        className="flex items-center gap-2.5 rounded-md px-3.5 py-2.5 transition-colors duration-200 focus-within:ring-2 focus-within:ring-offset-1"
        style={{
          background: "var(--color-input)",
          border: `1px solid ${error ? "var(--color-brand)" : "var(--color-border)"}`,
          ["--tw-ring-color" as string]: "var(--color-brand)",
          ["--tw-ring-offset-color" as string]: "var(--color-cream)",
        }}
      >
        <span className="text-faint shrink-0" aria-hidden="true" style={{ width: 18, height: 18 }}>
          {icon}
        </span>
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          placeholder={placeholder}
          autoComplete={autoComplete}
          inputMode={inputMode}
          maxLength={maxLength}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          className="w-full bg-transparent font-sans text-sm text-dark placeholder:text-faint outline-none min-w-0"
        />
        {valid && !error && (
          <span className="shrink-0 text-green-600" aria-hidden="true" style={{ width: 18, height: 18 }}>
            <CheckCircleIcon className="w-full h-full" />
          </span>
        )}
      </div>
      {error && (
        <p
          id={errorId}
          role="alert"
          className="flex items-center gap-1.5 font-sans text-xs mt-1.5"
          style={{ color: "var(--color-brand)" }}
        >
          <AlertIcon className="w-3.5 h-3.5 shrink-0" />
          {error}
        </p>
      )}
    </div>
  )
}
