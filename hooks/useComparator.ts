'use client'

import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'blm_compare'
const MAX_COMPARE = 3

export function useComparator() {
  const [selected, setSelected] = useState<string[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) setSelected(JSON.parse(stored))
    } catch {}
  }, [])

  const toggle = useCallback((vehicleId: string) => {
    setSelected((prev) => {
      let next: string[]
      if (prev.includes(vehicleId)) {
        next = prev.filter((id) => id !== vehicleId)
      } else if (prev.length >= MAX_COMPARE) {
        return prev
      } else {
        next = [...prev, vehicleId]
      }
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)) } catch {}
      return next
    })
  }, [])

  const clear = useCallback(() => {
    setSelected([])
    try { localStorage.removeItem(STORAGE_KEY) } catch {}
  }, [])

  const isSelected = useCallback((vehicleId: string) => selected.includes(vehicleId), [selected])
  const canAdd = selected.length < MAX_COMPARE

  return { selected, isSelected, toggle, clear, canAdd, mounted, count: selected.length }
}
