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

export default function VehicleGallery({ images, title }: VehicleGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)

  const prev = () => setActiveIndex((i) => (i === 0 ? images.length - 1 : i - 1))
  const next = () => setActiveIndex((i) => (i === images.length - 1 ? 0 : i + 1))

  if (!images || images.length === 0) {
    return (
      <div className="aspect-[16/9] bg-surface flex items-center justify-center">
        <span className="text-bsm-text-muted">Sin imágenes</span>
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
          <Image
            src={images[activeIndex].url}
            alt={images[activeIndex].alt || title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
            priority
            sizes="(max-width: 1024px) 100vw, 60vw"
          />
          <div className="absolute inset-0 flex items-center justify-between px-4 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => { e.stopPropagation(); prev() }}
              className="w-10 h-10 bg-obsidian/70 flex items-center justify-center text-white hover:bg-obsidian transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); next() }}
              className="w-10 h-10 bg-obsidian/70 flex items-center justify-center text-white hover:bg-obsidian transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
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
                onClick={() => setActiveIndex(i)}
                className={cn(
                  'relative flex-shrink-0 w-20 h-14 overflow-hidden transition-all duration-150',
                  i === activeIndex
                    ? 'ring-2 ring-gold opacity-100'
                    : 'opacity-50 hover:opacity-75'
                )}
              >
                <Image
                  src={img.url}
                  alt={img.alt || `${title} ${i + 1}`}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-obsidian/95 flex items-center justify-center p-4"
          onClick={() => setLightboxOpen(false)}
        >
          <button
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
              <Image
                src={images[activeIndex].url}
                alt={images[activeIndex].alt || title}
                fill
                className="object-contain"
                sizes="100vw"
              />
            </div>

            <button
              onClick={prev}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-12 w-10 h-10 bg-surface flex items-center justify-center hover:bg-surface-elevated transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={next}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-12 w-10 h-10 bg-surface flex items-center justify-center hover:bg-surface-elevated transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            <div className="text-center mt-4 text-sm text-bsm-text-muted">
              {activeIndex + 1} / {images.length}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
