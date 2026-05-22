'use client'

import { useState } from 'react'
import { X, AlertTriangle } from 'lucide-react'

interface Props {
  vehicleId: string
  vehicleTitle: string
}

export default function RejectVehicleButton({ vehicleId, vehicleTitle }: Props) {
  const [open, setOpen]     = useState(false)
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleReject() {
    if (!reason.trim()) return
    setLoading(true)
    const res = await fetch(`/api/admin/vehicles/${vehicleId}/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason: reason.trim() }),
    })
    if (res.ok) {
      setOpen(false)
      window.location.reload()
    } else {
      setLoading(false)
      alert('Error al rechazar el vehículo')
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-xs text-red-400 hover:text-red-300 font-medium transition-colors"
      >
        Rechazar
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-obsidian/80 backdrop-blur-sm p-4">
          <div className="bg-surface border border-bsm-border w-full max-w-md p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                <h2 className="font-medium text-bsm-text-primary">Rechazar vehículo</h2>
              </div>
              <button onClick={() => setOpen(false)} className="text-bsm-text-muted hover:text-bsm-text-primary">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-bsm-text-secondary mb-1">
              <span className="text-bsm-text-primary font-medium">{vehicleTitle}</span>
            </p>
            <p className="text-xs text-bsm-text-muted mb-5">
              El concesionario recibirá el motivo del rechazo y podrá corregirlo.
            </p>

            <label className="label-base">Motivo del rechazo *</label>
            <textarea
              rows={4}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ej: Las fotos no cumplen los criterios de calidad mínimos. Por favor, sube imágenes con fondo neutro y buena iluminación."
              className="input-base resize-none"
            />

            <div className="flex gap-3 mt-5">
              <button
                onClick={() => setOpen(false)}
                className="btn-outline flex-1 justify-center"
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                onClick={handleReject}
                disabled={!reason.trim() || loading}
                className="flex-1 py-2.5 px-4 bg-red-500/10 border border-red-500/30 text-red-400
                  hover:bg-red-500/20 transition-colors text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {loading ? 'Rechazando...' : 'Confirmar rechazo'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
