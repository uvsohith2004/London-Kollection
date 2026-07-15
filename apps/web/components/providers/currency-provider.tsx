"use client"

import React, { createContext, useContext, ReactNode, useState, useEffect, useCallback } from 'react'
import { useSettings } from './settings-provider'

// Map country codes to their local currency
const COUNTRY_CURRENCY_MAP: Record<string, string> = {
  KW: 'KWD', AE: 'AED', SA: 'SAR', QA: 'QAR', BH: 'BHD', OM: 'OMR',
  US: 'USD', GB: 'GBP', EU: 'EUR', DE: 'EUR', FR: 'EUR', IT: 'EUR', ES: 'EUR', NL: 'EUR',
  IN: 'INR', JP: 'JPY', CN: 'CNY', KR: 'KRW',
  AU: 'AUD', CA: 'CAD', CH: 'CHF', SE: 'SEK', NO: 'NOK', DK: 'DKK',
  EG: 'EGP', JO: 'JOD', LB: 'LBP', IQ: 'IQD', PK: 'PKR', BD: 'BDT',
  TR: 'TRY', RU: 'RUB', BR: 'BRL', MX: 'MXN', ZA: 'ZAR',
  SG: 'SGD', MY: 'MYR', TH: 'THB', ID: 'IDR', PH: 'PHP', VN: 'VND',
  NG: 'NGN', KE: 'KES', GH: 'GHS',
  NZ: 'NZD', HK: 'HKD', TW: 'TWD',
}

// Currency symbols for display
const CURRENCY_SYMBOLS: Record<string, string> = {
  KWD: 'KD', USD: '$', GBP: '£', EUR: '€', INR: '₹', JPY: '¥', CNY: '¥',
  AED: 'AED', SAR: 'SAR', QAR: 'QAR', BHD: 'BHD', OMR: 'OMR',
  AUD: 'A$', CAD: 'C$', CHF: 'CHF', SEK: 'kr', NOK: 'kr', DKK: 'kr',
  KRW: '₩', TRY: '₺', BRL: 'R$', MXN: 'MX$', ZAR: 'R',
  SGD: 'S$', MYR: 'RM', THB: '฿', PKR: '₨', BDT: '৳',
  EGP: 'E£', NGN: '₦', PHP: '₱', NZD: 'NZ$', HKD: 'HK$', TWD: 'NT$',
}

interface CurrencyContextType {
  /** The base store currency (always KWD from settings) */
  baseCurrency: string
  /** The user's display currency (detected from IP or manually set) */
  displayCurrency: string
  /** Exchange rate: 1 baseCurrency = X displayCurrency */
  exchangeRate: number
  /** Convert an amount from base currency to display currency */
  convert: (amount: number) => number
  /** Format an amount in display currency */
  formatPrice: (amount: number | string) => string
  /** Format an amount in base currency (for admin) */
  formatBasePrice: (amount: number | string) => string
  /** Manually set the display currency */
  setDisplayCurrency: (currency: string) => void
  /** Whether we're still loading rates */
  isLoading: boolean
  /** Whether user is viewing in a converted currency */
  isConverted: boolean
}

const CurrencyContext = createContext<CurrencyContextType | null>(null)

const RATES_CACHE_KEY = 'lk_exchange_rates'
const RATES_CACHE_TTL = 60 * 60 * 1000 // 1 hour
const USER_CURRENCY_KEY = 'lk_user_currency'

interface CachedRates {
  rates: Record<string, number>
  timestamp: number
  base: string
}

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const { settings } = useSettings()
  const baseCurrency = (settings.defaultCurrency || 'KWD').toUpperCase()
  
  const displayCurrency = baseCurrency
  const exchangeRate = 1
  const isConverted = false
  const isLoading = false

  const convert = useCallback((amount: number) => {
    return amount
  }, [])

  const formatPrice = useCallback((amount: number | string) => {
    const num = Number(amount)
    try {
      const formatted = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: baseCurrency,
        minimumFractionDigits: baseCurrency === 'KWD' || baseCurrency === 'BHD' || baseCurrency === 'OMR' ? 3 : 2,
        maximumFractionDigits: baseCurrency === 'KWD' || baseCurrency === 'BHD' || baseCurrency === 'OMR' ? 3 : 2,
      }).format(num)
      return formatted
    } catch {
      // Fallback for unknown currencies
      const symbol = CURRENCY_SYMBOLS[baseCurrency] || baseCurrency
      return `${symbol} ${num.toFixed(2)}`
    }
  }, [baseCurrency])

  const formatBasePrice = formatPrice

  const setDisplayCurrency = useCallback((currency: string) => {
    // Disabled dynamic currency switching
  }, [])

  return (
    <CurrencyContext.Provider value={{
      baseCurrency,
      displayCurrency,
      exchangeRate,
      convert,
      formatPrice,
      formatBasePrice,
      setDisplayCurrency,
      isLoading,
      isConverted,
    }}>
      {children}
    </CurrencyContext.Provider>
  )
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext)
  if (!ctx) {
    // Fallback for components outside the provider (e.g. server components)
    return {
      baseCurrency: 'KWD',
      displayCurrency: 'KWD',
      exchangeRate: 1,
      convert: (a: number) => a,
      formatPrice: (a: number | string) => `${Number(a).toFixed(3)} KWD`,
      formatBasePrice: (a: number | string) => `${Number(a).toFixed(3)} KWD`,
      setDisplayCurrency: () => {},
      isLoading: false,
      isConverted: false,
    }
  }
  return ctx
}
