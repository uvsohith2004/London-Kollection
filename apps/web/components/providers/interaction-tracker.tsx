"use client"

import { useEffect } from 'react'
import { useInteractionStore } from '@/stores/use-interaction-store'
import { api } from '@/api'

export function InteractionTracker() {
  useEffect(() => {
    const syncData = async () => {
      const { productViews, searchTerms } = useInteractionStore.getState().flush()
      
      if (productViews.length === 0 && searchTerms.length === 0) {
        return
      }

      try {
        await api.post('/history/batch', {
          productIds: productViews,
          searchTerms: searchTerms
        })
      } catch (error) {
        console.error('Failed to sync interaction history', error)
      }
    }

    // Run every 60 seconds
    const interval = setInterval(syncData, 60000)
    
    // Also try to sync on unmount/page leave
    return () => {
      clearInterval(interval)
      syncData()
    }
  }, [])

  return null
}
