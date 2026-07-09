"use client"

import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react'

export interface AppSettings {
  defaultCurrency: string
  orderPrefix: string
  logoUrl?: any
  logoDarkUrl?: any
}

interface SettingsContextType {
  settings: AppSettings
  setSettings: (newSettings: Partial<AppSettings>) => void
}

const defaultSettings: AppSettings = {
  defaultCurrency: 'KWD',
  orderPrefix: 'LK-',
}

const SettingsContext = createContext<SettingsContextType>({
  settings: defaultSettings,
  setSettings: () => {},
})

export function SettingsProvider({ children, initialSettings }: { children: ReactNode, initialSettings?: Partial<AppSettings> }) {
  const [settings, setSettingsState] = useState<AppSettings>({
    ...defaultSettings,
    ...initialSettings,
  })

  // Expose a way to update settings globally (e.g. after a mutation)
  const setSettings = (newSettings: Partial<AppSettings>) => {
    setSettingsState((prev) => ({ ...prev, ...newSettings }))
  }

  return (
    <SettingsContext.Provider value={{ settings, setSettings }}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  return useContext(SettingsContext)
}
