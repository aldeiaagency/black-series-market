'use client'

import { useEffect, useRef } from 'react'

export default function StickyAwareSidebar({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const HEADER  = 96  // top-24
    const MARGIN  = 16  // gap from bottom edge

    let currentTop  = HEADER
    let lastScrollY = window.scrollY

    function onScroll() {
      const sidebarH = el!.scrollHeight
      const viewH    = window.innerHeight
      const scrollY  = window.scrollY
      const delta    = scrollY - lastScrollY
      lastScrollY    = scrollY

      // Move the sidebar in the opposite direction of the scroll delta
      currentTop -= delta

      // Clamp between two bounds:
      //   max: HEADER  → sidebar can never go higher than the header offset
      //   min: viewH - sidebarH - MARGIN → sidebar bottom never goes below the viewport
      const minTop = Math.min(HEADER, viewH - sidebarH - MARGIN)
      currentTop   = Math.max(minTop, Math.min(HEADER, currentTop))

      el!.style.top = `${currentTop}px`
    }

    // Recalculate bounds when sidebar content changes height
    function onResize() {
      const sidebarH = el!.scrollHeight
      const viewH    = window.innerHeight
      const minTop   = Math.min(HEADER, viewH - sidebarH - MARGIN)
      currentTop     = Math.max(minTop, Math.min(HEADER, currentTop))
      el!.style.top  = `${currentTop}px`
    }

    el.style.top = `${HEADER}px`

    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize)
    const ro = new ResizeObserver(onResize)
    ro.observe(el)

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
      ro.disconnect()
    }
  }, [])

  return (
    <div ref={ref} className="sticky space-y-5">
      {children}
    </div>
  )
}
