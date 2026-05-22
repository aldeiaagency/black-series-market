'use client'

import { useRef, useState } from 'react'
import { Upload, X, Loader2 } from 'lucide-react'

interface VehicleImage {
  url: string
  order: number
}

interface Props {
  images: VehicleImage[]
  onChange: (images: VehicleImage[]) => void
}

export default function ImageUploader({ images, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return
    setError('')
    setUploading(true)

    const uploaded: VehicleImage[] = []
    for (const file of Array.from(files)) {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      if (res.ok) {
        const { url } = await res.json()
        uploaded.push({ url, order: images.length + uploaded.length })
      } else {
        const { error: msg } = await res.json().catch(() => ({ error: 'Error al subir' }))
        setError(msg || 'Error al subir imagen')
        break
      }
    }

    setUploading(false)
    if (uploaded.length > 0) {
      onChange([...images, ...uploaded])
    }
  }

  function remove(index: number) {
    const next = images
      .filter((_, i) => i !== index)
      .map((img, i) => ({ ...img, order: i }))
    onChange(next)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    handleFiles(e.dataTransfer.files)
  }

  return (
    <div className="space-y-4">
      <div
        className="border-2 border-dashed border-bsm-border hover:border-gold/40 transition-colors p-12 text-center cursor-pointer"
        onClick={() => inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        {uploading ? (
          <Loader2 className="w-10 h-10 text-gold mx-auto mb-4 animate-spin" />
        ) : (
          <Upload className="w-10 h-10 text-bsm-text-muted mx-auto mb-4" />
        )}
        <p className="text-sm text-bsm-text-secondary mb-2">
          {uploading ? 'Subiendo...' : 'Arrastra y suelta las imágenes aquí'}
        </p>
        <p className="text-xs text-bsm-text-muted">JPG, PNG, WebP · Máximo 10MB por imagen</p>
        {!uploading && (
          <button type="button" className="btn-outline text-sm mt-4">
            Seleccionar archivos
          </button>
        )}
      </div>

      {error && <p className="text-xs text-red-400">{error}</p>}

      {images.length > 0 && (
        <div className="grid grid-cols-4 gap-2">
          {images.map((img, i) => (
            <div key={i} className="relative aspect-video bg-surface-elevated overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.url} alt="" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => remove(i)}
                className="absolute top-1 right-1 w-5 h-5 bg-obsidian/80 flex items-center justify-center"
              >
                <X className="w-3 h-3 text-white" />
              </button>
              {i === 0 && (
                <span className="absolute bottom-1 left-1 text-[9px] bg-gold text-obsidian px-1.5 py-0.5">
                  PORTADA
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
