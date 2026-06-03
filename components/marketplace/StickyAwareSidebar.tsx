'use client'

import { useEffect, useRef } from 'react'

interface Props {
  children: React.ReactNode
  className?: string
}

export default function StickyAwareSidebar({ children, className = '' }: Props) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const HEADER = 96  // top-24 = 6rem
    const MARGIN = 16  // breathing room at bottom

    function update() {
      const sidebarH = el!.scrollHeight
      const viewH    = window.innerHeight

      // If sidebar fits in viewport → stick at top
      // If sidebar is taller      → stick so the bottom of sidebar aligns with viewport bottom
      const top = sidebarH + HEADER + MARGIN <= viewH
        ? HEADER
        : viewH - sidebarH - MARGIN

      el!.style.top = `${top}px`
    }

    update()
    window.addEventListener('resize', update)
    const ro = new ResizeObserver(update)
    ro.observe(el)

    return () => {
      window.removeEventListener('resize', update)
      ro.disconnect()
    }
  }, [])

  return (
    <div ref={ref} className={`sticky ${className}`}>
      {children}
    </div>
  )
}
