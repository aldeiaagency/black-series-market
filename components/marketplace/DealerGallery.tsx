'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'

export interface DealerGalleryImage {
  id: string
  url: string
}

interface Props {
  images: DealerGalleryImage[]
  dealerName: string
}

const MAX_VISIBLE = 4 // images shown in desktop mosaic before "Ver galería" overlay

export default function DealerGallery({ images, dealerName }: Props) {
  // ── All hooks first (React rules) ──────────────────────────────────────────
  const [lightboxOpen,  setLightboxOpen]  = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)
  const [mobileIndex,   setMobileIndex]   = useState(0)
  const closeBtnRef  = useRef<HTMLButtonElement>(null)
  const triggerRef   = useRef<HTMLElement | null>(null)
  const swipeStartX  = useRef<number | null>(null)

  // Focus close button when lightbox opens
  useEffect(() => {
    if (lightboxOpen) closeBtnRef.current?.focus()
  }, [lightboxOpen])

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (!lightboxOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setLightboxOpen(false)
        document.body.style.overflow = ''
        triggerRef.current?.focus()
      }
      if (e.key === 'ArrowLeft')  setLightboxIndex((i) => (i === 0 ? images.length - 1 : i - 1))
      if (e.key === 'ArrowRight') setLightboxIndex((i) => (i === images.length - 1 ? 0 : i + 1))
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [lightboxOpen, images.length])

  // ── Early return after hooks ───────────────────────────────────────────────
  if (!images.length) return null

  // ── Derived values ─────────────────────────────────────────────────────────
  const visibleImages  = images.slice(0, MAX_VISIBLE)
  const hasMore        = images.length > MAX_VISIBLE
  const mainImage      = visibleImages[0]
  const thumbImages    = visibleImages.slice(1)
  const thumbCount     = thumbImages.length

  // ── Helpers ────────────────────────────────────────────────────────────────
  function openLightbox(index: number, trigger: HTMLElement | null = null) {
    triggerRef.current = trigger
    setLightboxIndex(index)
    setLightboxOpen(true)
    document.body.style.overflow = 'hidden'
  }

  function closeLightbox() {
    setLightboxOpen(false)
    document.body.style.overflow = ''
    triggerRef.current?.focus()
  }

  function lbPrev() {
    setLightboxIndex((i) => (i === 0 ? images.length - 1 : i - 1))
  }
  function lbNext() {
    setLightboxIndex((i) => (i === images.length - 1 ? 0 : i + 1))
  }

  function mobilePrev() { setMobileIndex((i) => (i === 0 ? images.length - 1 : i - 1)) }
  function mobileNext() { setMobileIndex((i) => (i === images.length - 1 ? 0 : i + 1)) }

  // Grid rows for mosaic (Tailwind class must be statically known at build time)
  const gridRowsClass =
    thumbCount >= 3 ? 'grid-rows-3' :
    thumbCount === 2 ? 'grid-rows-2' :
    'grid-rows-1'
  const mainRowSpanStyle = { gridRow: `1 / ${thumbCount + 1}` }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <section className="mb-12" aria-label={`Galería de instalaciones de ${dealerName}`}>
      <p className="text-[10px] text-bsm-text-muted uppercase tracking-widest mb-4">El showroom</p>

      {/* ── Desktop mosaic ─────────────────────────────────────────────────── */}

      {/* Single image */}
      {images.length === 1 && (
        <button
          className="hidden md:block relative w-full h-64 lg:h-72 overflow-hidden group cursor-zoom-in focus:outline-none focus:ring-1 focus:ring-gold"
          onClick={(e) => openLightbox(0, e.currentTarget)}
          aria-label={`Ver fotografía de las instalaciones de ${dealerName}`}
        >
          <Image
            src={mainImage.url}
            alt={`${dealerName} — instalaciones`}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
            sizes="(max-width: 1280px) 100vw, 1280px"
            priority
          />
        </button>
      )}

      {/* Two images — equal columns */}
      {images.length === 2 && (
        <div className="hidden md:grid grid-cols-2 gap-1.5 h-64 lg:h-72">
          {visibleImages.map((img, i) => (
            <button
              key={img.id}
              className="relative overflow-hidden group cursor-zoom-in focus:outline-none focus:ring-1 focus:ring-gold"
              onClick={(e) => openLightbox(i, e.currentTarget)}
              aria-label={`Ver fotografía ${i + 1} de ${images.length} de ${dealerName}`}
            >
              <Image
                src={img.url}
                alt={`${dealerName} — instalaciones ${i + 1}`}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                sizes="50vw"
                priority={i === 0}
                loading={i === 0 ? 'eager' : 'lazy'}
              />
            </button>
          ))}
        </div>
      )}

      {/* Three or more images — main (2/3) + thumbnails stacked (1/3) */}
      {images.length >= 3 && (
        <div className={`hidden md:grid grid-cols-3 ${gridRowsClass} gap-1.5 h-64 lg:h-72`}>
          {/* Main image */}
          <button
            className="relative col-span-2 overflow-hidden group cursor-zoom-in focus:outline-none focus:ring-1 focus:ring-gold"
            style={mainRowSpanStyle}
            onClick={(e) => openLightbox(0, e.currentTarget)}
            aria-label={`Ver fotografía principal de las instalaciones de ${dealerName}`}
          >
            <Image
              src={mainImage.url}
              alt={`${dealerName} — instalaciones`}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
              sizes="(max-width: 1024px) 66vw, 50vw"
              priority
            />
          </button>

          {/* Thumbnails */}
          {thumbImages.map((img, i) => {
            const globalIndex  = i + 1
            const isLastThumb  = i === thumbImages.length - 1
            const showOverlay  = isLastThumb && hasMore

            return (
              <button
                key={img.id}
                className="relative overflow-hidden group cursor-zoom-in focus:outline-none focus:ring-1 focus:ring-gold"
                onClick={(e) => openLightbox(globalIndex, e.currentTarget)}
                aria-label={
                  showOverlay
                    ? `Ver galería completa — ${images.length} fotografías`
                    : `Ver fotografía ${globalIndex + 1} de ${images.length} de ${dealerName}`
                }
              >
                <Image
                  src={img.url}
                  alt={`${dealerName} — instalaciones ${globalIndex + 1}`}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                  sizes="33vw"
                  loading="lazy"
                />
                {showOverlay ? (
                  <div className="absolute inset-0 bg-obsidian/60 group-hover:bg-obsidian/70 transition-colors flex flex-col items-center justify-center gap-1">
                    <span className="text-sm font-medium text-white">Ver galería</span>
                    <span className="text-xs text-[#C0C0C0]">{images.length} fotografías</span>
                  </div>
                ) : (
                  <div className="absolute inset-0 bg-obsidian/0 group-hover:bg-obsidian/20 transition-colors" />
                )}
              </button>
            )
          })}
        </div>
      )}

      {/* ── Mobile carousel ────────────────────────────────────────────────── */}
      <div className="md:hidden relative overflow-hidden h-64">
        {/* Sliding strip */}
        <div
          className="flex h-full transition-transform duration-300 ease-out"
          style={{
            width: `${images.length * 100}%`,
            transform: `translateX(calc(-${mobileIndex} * ${100 / images.length}%))`,
          }}
          onPointerDown={(e) => { swipeStartX.current = e.clientX }}
          onPointerUp={(e) => {
            if (swipeStartX.current === null) return
            const delta = swipeStartX.current - e.clientX
            if (Math.abs(delta) > 40) delta > 0 ? mobileNext() : mobilePrev()
            swipeStartX.current = null
          }}
          onPointerCancel={() => { swipeStartX.current = null }}
        >
          {images.map((img, i) => (
            <button
              key={img.id}
              className="relative h-full flex-shrink-0 cursor-zoom-in focus:outline-none"
              style={{ width: `${100 / images.length}%` }}
              onClick={(e) => openLightbox(i, e.currentTarget)}
              aria-label={`Ver fotografía ${i + 1} de ${images.length} de ${dealerName}`}
            >
              <Image
                src={img.url}
                alt={`${dealerName} — instalaciones ${i + 1}`}
                fill
                className="object-cover"
                sizes="100vw"
                priority={i === 0}
                loading={i === 0 ? 'eager' : 'lazy'}
              />
            </button>
          ))}
        </div>

        {/* Prev / Next controls */}
        {images.length > 1 && (
          <>
            <button
              onClick={mobilePrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-obsidian/70 flex items-center justify-center"
              aria-label="Fotografía anterior"
            >
              <ChevronLeft className="w-4 h-4 text-white" />
            </button>
            <button
              onClick={mobileNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-obsidian/70 flex items-center justify-center"
              aria-label="Fotografía siguiente"
            >
              <ChevronRight className="w-4 h-4 text-white" />
            </button>
            {/* Counter */}
            <div className="absolute bottom-3 right-3 bg-obsidian/70 px-2.5 py-1 text-xs text-white tabular-nums pointer-events-none">
              {mobileIndex + 1} / {images.length}
            </div>
          </>
        )}
      </div>

      {/* ── Lightbox ───────────────────────────────────────────────────────── */}
      {lightboxOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Galería de instalaciones: ${dealerName}`}
          className="fixed inset-0 z-50 bg-obsidian/95 flex items-center justify-center p-4"
          onClick={closeLightbox}
        >
          {/* Close button */}
          <button
            ref={closeBtnRef}
            aria-label="Cerrar galería"
            className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center text-bsm-text-secondary hover:text-white transition-colors"
            onClick={closeLightbox}
          >
            <X className="w-6 h-6" />
          </button>

          {/* Image container */}
          <div
            className="relative w-full max-w-5xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative aspect-[16/9]">
              <Image
                src={images[lightboxIndex].url}
                alt={`${dealerName} — instalaciones ${lightboxIndex + 1}`}
                fill
                className="object-contain"
                sizes="100vw"
              />
            </div>

            {/* Prev / Next */}
            {images.length > 1 && (
              <>
                <button
                  aria-label="Fotografía anterior"
                  onClick={lbPrev}
                  className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-12 w-10 h-10 bg-surface flex items-center justify-center hover:bg-surface-elevated transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 text-white" />
                </button>
                <button
                  aria-label="Fotografía siguiente"
                  onClick={lbNext}
                  className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-12 w-10 h-10 bg-surface flex items-center justify-center hover:bg-surface-elevated transition-colors"
                >
                  <ChevronRight className="w-5 h-5 text-white" />
                </button>
              </>
            )}

            {/* Counter */}
            <div className="text-center mt-4 text-sm text-bsm-text-muted tabular-nums">
              {lightboxIndex + 1} / {images.length}
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
