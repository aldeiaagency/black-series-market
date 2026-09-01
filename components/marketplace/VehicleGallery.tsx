'use client'

import { useState, useCallback } from 'react'
import Image from 'next/image'
import { X, ChevronLeft, ChevronRight, ZoomIn, Play } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useModalA11y } from '@/lib/hooks/useModalA11y'
import type { VehicleImage } from '@/lib/types'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ImageItem = { kind: 'image'; url: string; alt?: string }
type VideoItem = { kind: 'video'; videoId: string; thumbUrl: string }
type MediaItem = ImageItem | VideoItem

interface VehicleGalleryProps {
  images: VehicleImage[]
  title: string
  videoUrl?: string | null
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function extractYouTubeId(url: string): string | null {
  const m = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  )
  return m?.[1] ?? null
}

function buildMediaItems(images: VehicleImage[], videoId: string | null): MediaItem[] {
  const imageItems: ImageItem[] = images.map((img) => ({
    kind: 'image',
    url: img.url,
    alt: img.alt,
  }))

  if (!videoId) return imageItems

  const videoItem: VideoItem = {
    kind: 'video',
    videoId,
    // hqdefault (480×360) always exists; maxresdefault only for HD uploads
    thumbUrl: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
  }

  // Insert video after first image (or at start if no images)
  const insertAt = Math.min(1, imageItems.length)
  const result: MediaItem[] = [...imageItems]
  result.splice(insertAt, 0, videoItem)
  return result
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function NoImagePlaceholder({ compact }: { compact?: boolean }) {
  const icon = (
    <svg
      className={cn('text-bsm-text-muted', compact ? 'w-4 h-4' : 'w-6 h-6')}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1}
        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
      />
    </svg>
  )
  if (compact) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-surface opacity-80">
        {icon}
      </div>
    )
  }
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-surface">
      <div className="w-10 h-10 border border-bsm-border flex items-center justify-center opacity-70">
        {icon}
      </div>
      <span className="text-[10px] text-bsm-text-muted tracking-widest uppercase">
        Imagen no disponible
      </span>
    </div>
  )
}

function VideoThumbFallback({ compact }: { compact?: boolean }) {
  if (compact) {
    return (
      <div className="absolute inset-0 bg-surface flex items-center justify-center">
        <Play className="w-4 h-4 text-gold/50" />
      </div>
    )
  }
  return (
    <div className="absolute inset-0 bg-surface flex items-center justify-center">
      <div className="w-16 h-16 border border-gold/20 flex items-center justify-center">
        <Play className="w-7 h-7 text-gold/40 fill-gold/40 ml-1" />
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function VehicleGallery({ images, title, videoUrl }: VehicleGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [videoModalOpen, setVideoModalOpen] = useState(false)
  const [failedItems, setFailedItems] = useState<Set<number>>(new Set())

  // A11y de modales: focus-trap + Escape + retorno de foco. onClose estable para no
  // re-enfocar en cada render (el lightbox re-renderiza al navegar prev/next).
  const closeLightbox = useCallback(() => setLightboxOpen(false), [])
  const closeVideoModal = useCallback(() => setVideoModalOpen(false), [])
  const lightboxRef = useModalA11y(lightboxOpen, closeLightbox)
  const videoModalRef = useModalA11y(videoModalOpen, closeVideoModal)

  const videoId = videoUrl ? extractYouTubeId(videoUrl) : null
  const items = buildMediaItems(images, videoId)
  const activeItem = items[activeIndex] as MediaItem | undefined

  // Indices of image-only items, used for lightbox navigation
  const imageIndices = items.reduce<number[]>((acc, item, i) => {
    if (item.kind === 'image') acc.push(i)
    return acc
  }, [])

  function markFailed(index: number) {
    setFailedItems((prev) => new Set(prev).add(index))
  }

  const prev = () => setActiveIndex((i) => (i === 0 ? items.length - 1 : i - 1))
  const next = () => setActiveIndex((i) => (i === items.length - 1 ? 0 : i + 1))

  function handleMainClick() {
    if (!activeItem) return
    if (activeItem.kind === 'image') setLightboxOpen(true)
    else setVideoModalOpen(true)
  }

  // Lightbox image navigation (skips video items)
  function lightboxPrev() {
    const pos = imageIndices.indexOf(activeIndex)
    const prevPos = pos <= 0 ? imageIndices.length - 1 : pos - 1
    setActiveIndex(imageIndices[prevPos])
  }
  function lightboxNext() {
    const pos = imageIndices.indexOf(activeIndex)
    const nextPos = pos >= imageIndices.length - 1 ? 0 : pos + 1
    setActiveIndex(imageIndices[nextPos])
  }

  if (!items.length) {
    return (
      <div className="relative aspect-[16/9] bg-surface border border-bsm-border">
        <NoImagePlaceholder />
      </div>
    )
  }

  return (
    <>
      {/* ------------------------------------------------------------------ */}
      {/* Main gallery                                                         */}
      {/* ------------------------------------------------------------------ */}
      <div className="space-y-2">

        {/* Primary viewer */}
        <div
          role="button"
          tabIndex={0}
          aria-label={activeItem?.kind === 'video' ? 'Reproducir vídeo' : 'Ampliar imagen'}
          className={cn(
            'relative aspect-[16/9] bg-surface overflow-hidden group focus:outline-none focus-visible:ring-2 focus-visible:ring-gold',
            activeItem?.kind === 'image' ? 'cursor-zoom-in' : 'cursor-pointer',
          )}
          onClick={handleMainClick}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleMainClick() } }}
        >
          {activeItem?.kind === 'image' ? (
            // ---- Image slot ----
            failedItems.has(activeIndex) ? (
              <NoImagePlaceholder />
            ) : (
              <Image
                src={activeItem.url}
                alt={activeItem.alt || title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                priority
                sizes="(max-width: 1024px) 100vw, 60vw"
                onError={() => markFailed(activeIndex)}
              />
            )
          ) : activeItem?.kind === 'video' ? (
            // ---- Video facade slot ----
            <div className="absolute inset-0">
              {failedItems.has(activeIndex) ? (
                <VideoThumbFallback />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={activeItem.thumbUrl}
                  alt={`${title} — vídeo`}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                  onError={() => markFailed(activeIndex)}
                />
              )}
              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-obsidian/30 group-hover:bg-obsidian/20 transition-colors" />
              {/* Play button */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 bg-obsidian/70 border border-gold/50 flex items-center justify-center transition-all duration-200 group-hover:bg-obsidian/90 group-hover:border-gold group-hover:scale-105">
                  <Play className="w-7 h-7 text-gold fill-gold ml-1" />
                </div>
              </div>
              {/* Video badge */}
              <div className="absolute top-4 left-4 flex items-center gap-1.5 bg-obsidian/75 px-2.5 py-1.5">
                <Play className="w-2.5 h-2.5 text-gold fill-gold" />
                <span className="text-[10px] text-gold tracking-widest uppercase">Vídeo</span>
              </div>
            </div>
          ) : null}

          {/* Navigation arrows */}
          {items.length > 1 && (
            <div className="absolute inset-0 flex items-center justify-between px-4 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity pointer-events-none">
              <button
                aria-label="Anterior"
                onClick={(e) => { e.stopPropagation(); prev() }}
                className="w-10 h-10 bg-obsidian/70 flex items-center justify-center text-white hover:bg-obsidian transition-colors pointer-events-auto focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                aria-label="Siguiente"
                onClick={(e) => { e.stopPropagation(); next() }}
                className="w-10 h-10 bg-obsidian/70 flex items-center justify-center text-white hover:bg-obsidian transition-colors pointer-events-auto focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Zoom icon (images only) */}
          {activeItem?.kind === 'image' && (
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="bg-obsidian/70 p-2">
                <ZoomIn className="w-4 h-4 text-white" />
              </div>
            </div>
          )}

          {/* Counter */}
          <div className="absolute bottom-4 right-4 bg-obsidian/70 px-3 py-1.5 text-xs text-white">
            {activeIndex + 1} / {items.length}
          </div>
        </div>

        {/* Thumbnails strip */}
        {items.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
            {items.map((item, i) => (
              <button
                key={i}
                aria-label={item.kind === 'video' ? 'Ver vídeo' : `Ver imagen ${i + 1}`}
                onClick={() => setActiveIndex(i)}
                className={cn(
                  'relative flex-shrink-0 w-20 h-14 overflow-hidden transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold',
                  i === activeIndex
                    ? 'ring-2 ring-gold opacity-100'
                    : 'opacity-50 hover:opacity-75',
                )}
              >
                {item.kind === 'image' ? (
                  failedItems.has(i) ? (
                    <NoImagePlaceholder compact />
                  ) : (
                    <Image
                      src={item.url}
                      alt={item.alt || `${title} — foto ${i + 1}`}
                      fill
                      className="object-cover"
                      sizes="80px"
                      onError={() => markFailed(i)}
                    />
                  )
                ) : (
                  // Video thumbnail
                  <>
                    {failedItems.has(i) ? (
                      <VideoThumbFallback compact />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.thumbUrl}
                        alt={`${title} — vídeo`}
                        className="absolute inset-0 w-full h-full object-cover"
                        onError={() => markFailed(i)}
                      />
                    )}
                    <div className="absolute inset-0 bg-obsidian/50 flex items-center justify-center">
                      <Play className="w-4 h-4 text-gold fill-gold drop-shadow" />
                    </div>
                  </>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Image lightbox                                                       */}
      {/* ------------------------------------------------------------------ */}
      {lightboxOpen && activeItem?.kind === 'image' && (
        <div
          ref={lightboxRef}
          role="dialog"
          aria-label={`Galería de imágenes: ${title}`}
          aria-modal="true"
          className="fixed inset-0 z-50 bg-obsidian/95 flex items-center justify-center p-4"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            aria-label="Cerrar galería"
            className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center text-bsm-text-secondary hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
            onClick={() => setLightboxOpen(false)}
          >
            <X className="w-6 h-6" />
          </button>

          <div
            className="relative w-full max-w-5xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative aspect-[16/9]">
              {failedItems.has(activeIndex) ? (
                <NoImagePlaceholder />
              ) : (
                <Image
                  src={activeItem.url}
                  alt={activeItem.alt || title}
                  fill
                  className="object-contain"
                  sizes="100vw"
                  onError={() => markFailed(activeIndex)}
                />
              )}
            </div>

            {imageIndices.length > 1 && (
              <>
                <button
                  aria-label="Imagen anterior"
                  onClick={lightboxPrev}
                  className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-12 w-10 h-10 bg-surface flex items-center justify-center hover:bg-surface-elevated transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  aria-label="Imagen siguiente"
                  onClick={lightboxNext}
                  className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-12 w-10 h-10 bg-surface flex items-center justify-center hover:bg-surface-elevated transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}

            <div className="text-center mt-4 text-sm text-bsm-text-muted">
              {imageIndices.indexOf(activeIndex) + 1} / {imageIndices.length}
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Video modal                                                          */}
      {/* ------------------------------------------------------------------ */}
      {videoModalOpen && (
        <div
          ref={videoModalRef}
          role="dialog"
          aria-label={`Vídeo: ${title}`}
          aria-modal="true"
          className="fixed inset-0 z-50 bg-obsidian/95 flex items-center justify-center p-4"
          onClick={() => setVideoModalOpen(false)}
        >
          <button
            aria-label="Cerrar vídeo"
            className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center text-bsm-text-secondary hover:text-white transition-colors"
            onClick={() => setVideoModalOpen(false)}
          >
            <X className="w-6 h-6" />
          </button>

          <div
            className="relative w-full max-w-5xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative aspect-[16/9] bg-obsidian">
              {activeItem?.kind === 'video' && (
                <iframe
                  src={`https://www.youtube.com/embed/${activeItem.videoId}?autoplay=1&rel=0&modestbranding=1&color=white`}
                  title={`${title} — vídeo`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
