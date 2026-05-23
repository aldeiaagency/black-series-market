'use client'

import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'blm_favorites'

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) setFavorites(JSON.parse(stored))
    } catch {}
  }, [])

  const toggle = useCallback((vehicleId: string) => {
    setFavorites((prev) => {
      const next = prev.includes(vehicleId)
        ? prev.filter((id) => id !== vehicleId)
        : [...prev, vehicleId]
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)) } catch {}
      return next
    })
  }, [])

  const isFavorite = useCallback((vehicleId: string) => favorites.includes(vehicleId), [favorites])

  return { favorites, isFavorite, toggle, mounted }
}
