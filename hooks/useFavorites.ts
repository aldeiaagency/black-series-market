'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { trackEvent } from '@/lib/analytics/client'

const STORAGE_KEY = 'blm_favorites'

export function useFavorites() {
  const [favorites, setFavorites]           = useState<string[]>([])
  const [mounted, setMounted]               = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const profileIdRef = useRef<string | null>(null)

  useEffect(() => {
    setMounted(true)
    const supabase = createClient()

    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (user) {
        profileIdRef.current = user.id
        setIsAuthenticated(true)

        const { data } = await supabase
          .from('favorites')
          .select('vehicle_id')
          .eq('profile_id', user.id)
          .order('created_at', { ascending: false })

        const supabaseFavs = (data || []).map((f: { vehicle_id: string }) => f.vehicle_id)

        // One-time sync: merge localStorage favorites into Supabase then clear
        let localFavs: string[] = []
        try {
          const raw = localStorage.getItem(STORAGE_KEY)
          if (raw) localFavs = JSON.parse(raw)
        } catch {}

        if (localFavs.length > 0) {
          await supabase.from('favorites').upsert(
            localFavs.map((vehicle_id) => ({ profile_id: user.id, vehicle_id })),
            { onConflict: 'profile_id,vehicle_id', ignoreDuplicates: true }
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
    const currentProfileId = profileIdRef.current

    setFavorites((prev) => {
      const isSaved = prev.includes(vehicleId)
      const next    = isSaved ? prev.filter((id) => id !== vehicleId) : [...prev, vehicleId]

      if (currentProfileId) {
        const supabase = createClient()
        if (isSaved) {
          supabase.from('favorites').delete()
            .eq('profile_id', currentProfileId).eq('vehicle_id', vehicleId)
            .then(() => {})
        } else {
          supabase.from('favorites').insert({ profile_id: currentProfileId, vehicle_id: vehicleId })
            .then(() => {})
        }
      } else {
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)) } catch {}
      }

      // Track save/unsave (non-blocking, fire-and-forget)
      trackEvent({
        event_type: isSaved ? 'vehicle_unsaved' : 'favorite_added',
        vehicle_id: vehicleId,
      })

      return next
    })
  }, [])

  const isFavorite = useCallback(
    (vehicleId: string) => favorites.includes(vehicleId),
    [favorites]
  )

  return { favorites, isFavorite, toggle, mounted, isAuthenticated }
}
