'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X, Bell, CheckCircle } from 'lucide-react'

const schema = z.object({
  vehicle_type: z.enum(['car', 'motorcycle', 'any']),
  brand:        z.string().optional(),
  model:        z.string().optional(),
  budget_max:   z.string().optional(),
  year_min:     z.string().optional(),
  km_max:       z.string().optional(),
  location:     z.string().optional(),
  email:        z.string().email('Email inválido'),
  phone:        z.string().optional(),
  timeline:     z.enum(['immediate', '1_3_months', '3_6_months', 'exploring']),
})

type FormData = z.infer<typeof schema>

interface Props {
  open: boolean
  onClose: () => void
  defaultVehicleType?: 'car' | 'motorcycle'
}

export default function SearchAlertModal({ open, onClose, defaultVehicleType }: Props) {
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      vehicle_type: defaultVehicleType ?? 'any',
      timeline: '1_3_months',
    },
  })

  async function onSubmit(data: FormData) {
    setError(null)

    // Persist server-side for everyone — anonymous and logged-in alike. The server
    // route attaches the user when a session exists; anonymous alerts no longer get
    // lost in localStorage.
    try {
      const res = await fetch('/api/search-alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        setError('No se pudo registrar la alerta. Inténtalo de nuevo.')
        return
      }
    } catch {
      setError('No se pudo registrar la alerta. Revisa tu conexión.')
      return
    }

    // Track alert creation (non-blocking)
    fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event_type: 'search_alert_created' }),
    }).catch(() => {})

    setSubmitted(true)
  }

  if (!open) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Crear alerta de búsqueda"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0A0A0A]/85 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-[#0D0D0D] border border-[#1E1E1E] shadow-[0_24px_80px_rgba(0,0,0,0.8)] animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#1A1A1A]">
          <div className="flex items-center gap-3">
            <Bell className="w-4 h-4 text-[#C6A64B]" />
            <h2 className="text-sm font-medium text-[#F4F1EA] tracking-wide">
              Crear alerta de búsqueda
            </h2>
          </div>
          <button
            aria-label="Cerrar"
            onClick={onClose}
            className="text-[#9E9E9E] hover:text-[#C9C9C9] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="px-6 py-12 text-center">
            <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto mb-4" />
            <h3 className="font-display text-xl font-light text-[#F4F1EA] mb-2">
              Búsqueda registrada
            </h3>
            <p className="text-sm text-[#8A8A8A] leading-relaxed max-w-xs mx-auto">
              Dejaremos registrada tu preferencia para futuras oportunidades compatibles.
            </p>
            <p className="text-[10px] text-[#8A8A8A] mt-4">
              Este registro no garantiza disponibilidad ni contacto inmediato.
            </p>
            <button onClick={onClose} className="btn-outline mt-6 text-sm px-8">
              Cerrar
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-5 space-y-4 max-h-[80vh] overflow-y-auto">

            {/* Tipo */}
            <div>
              <label className="label-base">Tipo de vehículo</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 'car',        label: 'Coche' },
                  { value: 'motorcycle', label: 'Moto' },
                  { value: 'any',        label: 'Cualquiera' },
                ].map((o) => (
                  <label key={o.value}
                    className="flex items-center justify-center py-2.5 border border-bsm-border text-xs text-bsm-text-muted cursor-pointer
                      has-[:checked]:border-[#C6A64B]/40 has-[:checked]:text-[#C6A64B] has-[:checked]:bg-[#C6A64B]/5
                      hover:border-bsm-border-light transition-colors">
                    <input type="radio" {...register('vehicle_type')} value={o.value} className="sr-only" />
                    {o.label}
                  </label>
                ))}
              </div>
            </div>

            {/* Marca + Modelo */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label-base">Marca</label>
                <input {...register('brand')} placeholder="Ferrari, Ducati…" className="input-base" />
              </div>
              <div>
                <label className="label-base">Modelo</label>
                <input {...register('model')} placeholder="911, Panigale…" className="input-base" />
              </div>
            </div>

            {/* Presupuesto + Año mínimo */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label-base">Presupuesto máx.</label>
                <input {...register('budget_max')} placeholder="Ej. 120.000 €" className="input-base" />
              </div>
              <div>
                <label className="label-base">Año mínimo</label>
                <input {...register('year_min')} type="number" placeholder="2015" min="1960" className="input-base" />
              </div>
            </div>

            {/* Km máx + Ubicación */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label-base">Km máximos</label>
                <input {...register('km_max')} placeholder="Ej. 50.000 km" className="input-base" />
              </div>
              <div>
                <label className="label-base">Ubicación</label>
                <input {...register('location')} placeholder="Madrid, nacional…" className="input-base" />
              </div>
            </div>

            {/* Plazo */}
            <div>
              <label className="label-base">Plazo de compra</label>
              <select {...register('timeline')} className="input-base">
                <option value="immediate">Inmediata</option>
                <option value="1_3_months">1-3 meses</option>
                <option value="3_6_months">3-6 meses</option>
                <option value="exploring">Explorando opciones</option>
              </select>
            </div>

            {/* Email + Teléfono */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label-base">Email *</label>
                <input {...register('email')} type="email" placeholder="tu@email.com" className="input-base" />
                {errors.email && (
                  <p className="text-xs text-red-400 mt-1">{errors.email.message}</p>
                )}
              </div>
              <div>
                <label className="label-base">Teléfono</label>
                <input {...register('phone')} type="tel" placeholder="Opcional" className="input-base" />
              </div>
            </div>

            {error && (
              <p className="text-xs text-red-400 text-center" role="alert">{error}</p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-gold w-full justify-center text-sm py-3"
            >
              {isSubmitting ? 'Registrando…' : 'Crear alerta'}
            </button>

            <p className="text-[10px] text-[#8A8A8A] text-center leading-relaxed pb-1">
              Dejaremos registrada tu preferencia para futuras oportunidades compatibles.
              Este registro no garantiza disponibilidad ni contacto inmediato.
            </p>
          </form>
        )}
      </div>
    </div>
  )
}
