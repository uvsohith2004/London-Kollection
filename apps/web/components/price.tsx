"use client"

import React from "react"
import { useCurrency } from "@/components/providers/currency-provider"

interface PriceProps {
  /** The amount in base currency (KWD) */
  amount: number | string
  className?: string
  /** Whether to show the currency code/symbol (default: true) */
  showCurrency?: boolean
  /** Force base currency display (for admin panels) */
  asBase?: boolean
}

/**
 * Centralized price display component.
 * Automatically converts and formats prices based on the user's detected currency.
 * Use `asBase` prop in admin panels to always show the store's base currency.
 */
export function Price({ amount, className, showCurrency = true, asBase = false }: PriceProps) {
  const { formatPrice, formatBasePrice, isConverted } = useCurrency()
  
  if (!showCurrency) {
    const num = Number(amount)
    return <span className={className}>{num.toFixed(2)}</span>
  }

  const formatted = asBase ? formatBasePrice(amount) : formatPrice(amount)

  return (
    <span className={className}>
      {isConverted && !asBase && "≈ "}{formatted}
    </span>
  )
}
