'use client'

import {
  createContext, useContext, useState, useCallback, useEffect,
  type ReactNode,
} from 'react'

export interface CompareVehicle {
  id: string
  brand_name: string
  model_name: string
  year: number
  slug: string
  vehicle_type: string
  primaryImage: string | null
}

interface ComparatorCtx {
  selected:   CompareVehicle[]
  add:        (v: CompareVehicle) => void
  remove:     (id: string) => void
  toggle:     (v: CompareVehicle) => void
  clear:      () => void
  isSelected: (id: string) => boolean
  canAdd:     boolean
  mounted:    boolean
}

const Ctx = createContext<ComparatorCtx | null>(null)

const KEY = 'blm_compare'
const MAX = 3

export function ComparatorProvider({ children }: { children: ReactNode }) {
  const [selected, setSelected] = useState<CompareVehicle[]>([])
  const [mounted,  setMounted]  = useState(false)

  useEffect(() => {
    setMounted(true)
    try {
      const raw = localStorage.getItem(KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        // Guard against old format (array of strings) from previous version
        if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === 'object' && parsed[0] !== null) {
          setSelected(parsed)
        } else {
          // Old format — clear it
          localStorage.removeItem(KEY)
        }
      }
    } catch {
      try { localStorage.removeItem(KEY) } catch {}
    }
  }, [])

  function save(next: CompareVehicle[]) {
    try { localStorage.setItem(KEY, JSON.stringify(next)) } catch {}
  }

  const add = useCallback((v: CompareVehicle) => {
    setSelected(prev => {
      if (prev.some(x => x.id === v.id) || prev.length >= MAX) return prev
      const next = [...prev, v]
      save(next)
      return next
    })
  }, [])

  const remove = useCallback((id: string) => {
    setSelected(prev => {
      const next = prev.filter(x => x.id !== id)
      save(next)
      return next
    })
  }, [])

  const toggle = useCallback((v: CompareVehicle) => {
    setSelected(prev => {
      const exists = prev.some(x => x.id === v.id)
      let next: CompareVehicle[]
      if (exists) {
        next = prev.filter(x => x.id !== v.id)
      } else if (prev.length >= MAX) {
        return prev
      } else {
        next = [...prev, v]
      }
      save(next)
      return next
    })
  }, [])

  const clear = useCallback(() => {
    setSelected([])
    try { localStorage.removeItem(KEY) } catch {}
  }, [])

  const isSelected = useCallback((id: string) => selected.some(x => x.id === id), [selected])

  return (
    <Ctx.Provider value={{
      selected, add, remove, toggle, clear, isSelected,
      canAdd: selected.length < MAX,
      mounted,
    }}>
      {children}
    </Ctx.Provider>
  )
}

const NOOP_CTX: ComparatorCtx = {
  selected: [],
  add: () => {},
  remove: () => {},
  toggle: () => {},
  clear: () => {},
  isSelected: () => false,
  canAdd: true,
  mounted: false,
}

export function useComparator(): ComparatorCtx {
  return useContext(Ctx) ?? NOOP_CTX
}
