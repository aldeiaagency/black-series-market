'use client'

import { useState } from 'react'
import Image from 'next/image'
import { X, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { VehicleImage } from '@/lib/types'

interface VehicleGalleryProps {
  images: VehicleImage[]
  title: string
}

function NoImagePlaceholder({ compact }: { compact?: boolean }) {
  const icon = (
    <svg className={cn('text-bsm-text-muted', compact ? 'w-4 h-4' : 'w-6 h-6')} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  )
  if (compact) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-surface opacity-60">
        {icon}
      </div>
    )
  }
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-surface">
      <div className="w-10 h-10 border border-bsm-border flex items-center justify-center opacity-40">
        {icon}
      </div>
      <span className="text-[10px] text-bsm-text-muted tracking-widest uppercase opacity-60">
        Imagen no disponible
      </span>
    </div>
  )
}

export default function VehicleGallery({ images, title }: VehicleGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [failedImages, setFailedImages] = useState<Set<number>>(new Set())

  function markFailed(index: number) {
    setFailedImages((prev) => new Set(prev).add(index))
  }

  const prev = () => setActiveIndex((i) => (i === 0 ? images.length - 1 : i - 1))
  const next = () => setActiveIndex((i) => (i === images.length - 1 ? 0 : i + 1))

  if (!images || images.length === 0) {
    return (
      <div className="relative aspect-[16/9] bg-surface border border-bsm-border">
        <NoImagePlaceholder />
      </div>
    )
  }

  return (
    <>
      {/* Main gallery */}
      <div className="space-y-2">
        {/* Primary image */}
        <div
          className="relative aspect-[16/9] bg-surface overflow-hidden cursor-zoom-in group"
          onClick={() => setLightboxOpen(true)}
        >
          {failedImages.has(activeIndex) ? (
            <NoImagePlaceholder />
          ) : (
            <Image
              src={images[activeIndex].url}
              alt={images[activeIndex].alt || title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
              priority
              sizes="(max-width: 1024px) 100vw, 60vw"
              onError={() => markFailed(activeIndex)}
            />
          )}

          {images.length > 1 && (
            <div className="absolute inset-0 flex items-center justify-between px-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                aria-label="Imagen anterior"
                onClick={(e) => { e.stopPropagation(); prev() }}
                className="w-10 h-10 bg-obsidian/70 flex items-center justify-center text-white hover:bg-obsidian transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                aria-label="Imagen siguiente"
                onClick={(e) => { e.stopPropagation(); next() }}
                className="w-10 h-10 bg-obsidian/70 flex items-center justify-center text-white hover:bg-obsidian transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}

          <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="bg-obsidian/70 p-2">
              <ZoomIn className="w-4 h-4 text-white" />
            </div>
          </div>
          <div className="absolute bottom-4 right-4 bg-obsidian/70 px-3 py-1.5 text-xs text-white">
            {activeIndex + 1} / {images.length}
          </div>
        </div>

        {/* Thumbnails */}
        {images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
            {images.map((img, i) => (
              <button
                key={i}
                aria-label={`Ver imagen ${i + 1} de ${images.length}`}
                onClick={() => setActiveIndex(i)}
                className={cn(
                  'relative flex-shrink-0 w-20 h-14 overflow-hidden transition-all duration-150',
                  i === activeIndex
                    ? 'ring-2 ring-gold opacity-100'
                    : 'opacity-50 hover:opacity-75'
                )}
              >
                {failedImages.has(i) ? (
                  <NoImagePlaceholder compact />
                ) : (
                  <Image
                    src={img.url}
                    alt={img.alt || `${title} — foto ${i + 1}`}
                    fill
                    className="object-cover"
                    sizes="80px"
                    onError={() => markFailed(i)}
                  />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <div
          role="dialog"
          aria-label={`Galería de imágenes: ${title}`}
          aria-modal="true"
          className="fixed inset-0 z-50 bg-obsidian/95 flex items-center justify-center p-4"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            aria-label="Cerrar galería"
            className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center text-bsm-text-secondary hover:text-white transition-colors"
            onClick={() => setLightboxOpen(false)}
          >
            <X className="w-6 h-6" />
          </button>

          <div
            className="relative w-full max-w-5xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative aspect-[16/9]">
              {failedImages.has(activeIndex) ? (
                <NoImagePlaceholder />
              ) : (
                <Image
                  src={images[activeIndex].url}
                  alt={images[activeIndex].alt || title}
                  fill
                  className="object-contain"
                  sizes="100vw"
                  onError={() => markFailed(activeIndex)}
                />
              )}
            </div>

            {images.length > 1 && (
              <>
                <button
                  aria-label="Imagen anterior"
                  onClick={prev}
                  className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-12 w-10 h-10 bg-surface flex items-center justify-center hover:bg-surface-elevated transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  aria-label="Imagen siguiente"
                  onClick={next}
                  className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-12 w-10 h-10 bg-surface flex items-center justify-center hover:bg-surface-elevated transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}

            <div className="text-center mt-4 text-sm text-bsm-text-muted">
              {activeIndex + 1} / {images.length}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
