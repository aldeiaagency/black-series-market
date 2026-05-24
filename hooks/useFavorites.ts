'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

const STORAGE_KEY = 'blm_favorites'

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([])
  const [mounted, setMounted] = useState(false)
  const userIdRef = useRef<string | null>(null)

  useEffect(() => {
    setMounted(true)
    const supabase = createClient()

    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (user) {
        userIdRef.current = user.id

        const { data } = await supabase
          .from('favorites')
          .select('vehicle_id')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        const supabaseFavs = (data || []).map((f: { vehicle_id: string }) => f.vehicle_id)

        // One-time sync: merge any localStorage favorites into Supabase
        let localFavs: string[] = []
        try {
          const raw = localStorage.getItem(STORAGE_KEY)
          if (raw) localFavs = JSON.parse(raw)
        } catch {}

        if (localFavs.length > 0) {
          await supabase.from('favorites').upsert(
            localFavs.map((vehicle_id) => ({ user_id: user.id, vehicle_id })),
            { onConflict: 'user_id,vehicle_id', ignoreDuplicates: true }
          )
          localStorage.removeItem(STORAGE_KEY)
        }

        setFavorites(Array.from(new Set([...supabaseFavs, ...localFavs])))
      } else {
        // Guest — use localStorage
        try {
          const raw = localStorage.getItem(STORAGE_KEY)
          if (raw) setFavorites(JSON.parse(raw))
        } catch {}
      }
    })
  }, [])

  const toggle = useCallback((vehicleId: string) => {
    const currentUserId = userIdRef.current

    setFavorites((prev) => {
      const isSaved = prev.includes(vehicleId)
      const next = isSaved ? prev.filter((id) => id !== vehicleId) : [...prev, vehicleId]

      if (currentUserId) {
        const supabase = createClient()
        if (isSaved) {
          supabase.from('favorites').delete()
            .eq('user_id', currentUserId).eq('vehicle_id', vehicleId)
        } else {
          supabase.from('favorites').insert({ user_id: currentUserId, vehicle_id: vehicleId })
        }
      } else {
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)) } catch {}
      }

      return next
    })
  }, [])

  const isFavorite = useCallback((vehicleId: string) => favorites.includes(vehicleId), [favorites])

  return { favorites, isFavorite, toggle, mounted }
}
