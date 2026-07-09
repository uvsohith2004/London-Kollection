"use client"

import React from "react"
import { useSettings } from "@/components/providers/settings-provider"

interface PriceProps {
  amount: number | string
  className?: string
  showCurrency?: boolean
}

export function Price({ amount, className, showCurrency = true }: PriceProps) {
  const { settings } = useSettings()
  const currencyCode = settings.defaultCurrency || "KWD"
  
  const formatted = new Intl.NumberFormat("en-KW", {
    style: "currency",
    currency: currencyCode,
    maximumFractionDigits: 2,
    minimumFractionDigits: 2
  }).format(Number(amount))

  // Some designs might just want the number followed by currency like "100.00 KWD"
  // If the standard Intl output is sufficient, we can just return it.
  // Alternatively, since the UI currently does `{Number(val).toFixed(2)} KWD`, let's match that format closely:
  
  const num = Number(amount).toFixed(2)

  return (
    <span className={className}>
      {num} {showCurrency && <span className="uppercase">{currencyCode}</span>}
    </span>
  )
}
