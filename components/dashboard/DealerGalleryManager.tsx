'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { ChevronDown, ChevronUp, CheckCircle, Loader2, Upload, X } from 'lucide-react'

const MAX_GALLERY = 6

interface GalleryImage {
  id: string
  url: string
  storage_path: string
  position: number
}

export default function DealerGalleryManager() {
  const [images, setImages]       = useState<GalleryImage[]>([])
  const [loading, setLoading]     = useState(true)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [saved, setSaved]         = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch('/api/gallery')
      .then((r) => r.json())
      .then((data) => { setImages(data.images ?? []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  async function handleUpload(file: File) {
    setUploadError(null)
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res  = await fetch('/api/upload?type=gallery', { method: 'POST', body: fd })
      const json = await res.json()
      if (!res.ok) { setUploadError(json.error || 'Error al subir la imagen'); return }
      setImages((prev) => [
        ...prev,
        { id: json.id, url: json.url, storage_path: json.path, position: prev.length },
      ])
    } catch {
      setUploadError('Error de conexión al subir la imagen')
    } finally {
      setUploading(false)
    }
  }

  async function handleDelete(id: string) {
    setDeleteError(null)
    const res = await fetch(`/api/gallery?id=${id}`, { method: 'DELETE' })
    if (res.ok) {
      setImages((prev) =>
        prev.filter((img) => img.id !== id).map((img, i) => ({ ...img, position: i }))
      )
    } else {
      const json = await res.json().catch(() => ({}))
      setDeleteError(json.error || 'Error al eliminar la imagen')
    }
  }

  async function saveOrder(ordered: GalleryImage[]) {
    const order = ordered.map((img, i) => ({ id: img.id, position: i }))
    const res = await fetch('/api/gallery', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order }),
    })
    if (res.ok) {
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    }
  }

  function moveUp(index: number) {
    if (index === 0) return
    const next = [...images]
    ;[next[index - 1], next[index]] = [next[index], next[index - 1]]
    const updated = next.map((img, i) => ({ ...img, position: i }))
    setImages(updated)
    saveOrder(updated)
  }

  function moveDown(index: number) {
    if (index === images.length - 1) return
    const next = [...images]
    ;[next[index], next[index + 1]] = [next[index + 1], next[index]]
    const updated = next.map((img, i) => ({ ...img, position: i }))
    setImages(updated)
    saveOrder(updated)
  }

  const atLimit = images.length >= MAX_GALLERY

  if (loading) {
    return (
      <div className="bg-surface border border-bsm-border p-6 mb-6 flex items-center gap-2 text-bsm-text-muted text-sm">
        <Loader2 className="w-4 h-4 animate-spin" />
        Cargando galería…
      </div>
    )
  }

  return (
    <div className="bg-surface border border-bsm-border p-6 mb-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-1">
        <h2 className="font-medium text-bsm-text-primary">Galería de instalaciones</h2>
        <span className="text-xs text-bsm-text-muted tabular-nums flex-shrink-0">
          {images.length} de {MAX_GALLERY}
        </span>
      </div>
      <p className="text-xs text-bsm-text-muted mb-5 leading-relaxed">
        Sube fotografías reales y cuidadas de tus instalaciones para reforzar la presencia y
        confianza de tu showroom. La primera fotografía aparece como imagen principal.
      </p>

      {/* Image list */}
      {images.length > 0 && (
        <ul role="list" className="space-y-2 mb-4">
          {images.map((img, i) => (
            <li
              key={img.id}
              role="listitem"
              className="flex items-center gap-3 border border-bsm-border bg-[#0D0D0D] p-2"
            >
              {/* Thumbnail */}
              <div className="relative w-20 h-14 flex-shrink-0 overflow-hidden bg-surface">
                <Image
                  src={img.url}
                  alt={`Instalación ${i + 1}`}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              </div>

              {/* Label */}
              <span className="flex-1 text-xs text-bsm-text-muted">
                {i === 0 ? (
                  <span className="text-gold">Principal</span>
                ) : (
                  `Fotografía ${i + 1}`
                )}
              </span>

              {/* Controls */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => moveUp(i)}
                  disabled={i === 0}
                  aria-label="Subir posición"
                  className="w-7 h-7 flex items-center justify-center border border-bsm-border text-bsm-text-muted hover:text-bsm-text-primary disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronUp className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => moveDown(i)}
                  disabled={i === images.length - 1}
                  aria-label="Bajar posición"
                  className="w-7 h-7 flex items-center justify-center border border-bsm-border text-bsm-text-muted hover:text-bsm-text-primary disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(img.id)}
                  aria-label={`Eliminar fotografía ${i + 1}`}
                  className="w-7 h-7 flex items-center justify-center border border-bsm-border text-bsm-text-muted hover:text-red-400 ml-1 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Order saved feedback */}
      {saved && (
        <p className="flex items-center gap-1.5 text-xs text-emerald-400 mb-3">
          <CheckCircle className="w-3 h-3" />
          Orden guardado
        </p>
      )}

      {/* Delete error */}
      {deleteError && (
        <p className="text-xs text-red-400 mb-3">{deleteError}</p>
      )}

      {/* Upload button */}
      {!atLimit ? (
        <>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) handleUpload(file)
              if (inputRef.current) inputRef.current.value = ''
            }}
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="btn-outline text-sm px-4 py-2 flex items-center gap-2"
          >
            {uploading
              ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
              : <Upload className="w-3.5 h-3.5" />
            }
            {uploading ? 'Subiendo…' : 'Añadir fotografía'}
          </button>
          {uploadError && <p className="mt-3 text-xs text-red-400">{uploadError}</p>}
        </>
      ) : (
        <p className="text-xs text-bsm-text-muted">
          Límite de {MAX_GALLERY} fotografías alcanzado. Elimina alguna para añadir otra.
        </p>
      )}
    </div>
  )
}
