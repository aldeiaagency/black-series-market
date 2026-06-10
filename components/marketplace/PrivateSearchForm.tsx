'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { CheckCircle } from 'lucide-react'

const schema = z.object({
  name:             z.string().min(2, 'Nombre requerido'),
  email:            z.string().email('Email inválido'),
  phone:            z.string().optional(),
  vehicle_type:     z.enum(['car', 'motorcycle', 'any']),
  brand:            z.string().optional(),
  model:            z.string().optional(),
  version:          z.string().optional(),
  budget:           z.string().optional(),
  location:         z.string().optional(),
  timeline:         z.enum(['immediate', '1_3_months', '3_6_months', 'exploring']),
  financing:        z.enum(['yes', 'no', 'maybe']),
  trade_in:         z.enum(['yes', 'no']),
  notes:            z.string().optional(),
})

type FormData = z.infer<typeof schema>

export default function PrivateSearchForm() {
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      vehicle_type: 'car',
      timeline: '1_3_months',
      financing: 'maybe',
      trade_in: 'no',
    },
  })

  async function onSubmit(data: FormData) {
    setError(null)

    // Persist server-side (table: custom_requests) — this is the operational store.
    try {
      const res = await fetch('/api/custom-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        setError('No se pudo enviar la solicitud. Inténtalo de nuevo en unos minutos.')
        return
      }
    } catch {
      setError('No se pudo enviar la solicitud. Revisa tu conexión e inténtalo de nuevo.')
      return
    }

    // Keep a local copy only as a UX convenience (not the source of truth).
    try {
      const stored = JSON.parse(localStorage.getItem('blm_private_searches') || '[]')
      stored.push({ ...data, submitted_at: new Date().toISOString() })
      localStorage.setItem('blm_private_searches', JSON.stringify(stored))
    } catch {}

    fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event_type: 'vehicle_request_submit' }),
    }).catch(() => {})

    if (typeof window !== 'undefined') {
      const dl = ((window as any).dataLayer = (window as any).dataLayer || [])
      dl.push({
        event:        'vehiculo_carta_submit',
        vehicle_type: data.vehicle_type,
        timeline:     data.timeline,
      })
    }

    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center text-center py-12">
        <CheckCircle className="w-12 h-12 text-emerald-400 mb-4" />
        <h3 className="font-display text-2xl font-light text-bsm-text-primary mb-2">
          Solicitud enviada
        </h3>
        <p className="text-sm text-bsm-text-muted max-w-sm leading-relaxed">
          Hemos recibido tu búsqueda. Si encontramos una unidad compatible entre los profesionales verificados, te avisamos directamente.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

      {/* Contact */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="label-base">Nombre *</label>
          <input {...register('name')} placeholder="Tu nombre" className="input-base" />
          {errors.name && <p className="text-xs text-red-400 mt-1">{errors.name.message}</p>}
        </div>
        <div>
          <label className="label-base">Email *</label>
          <input {...register('email')} type="email" placeholder="Tu email" className="input-base" />
          {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email.message}</p>}
        </div>
      </div>
      <div>
        <label className="label-base">Teléfono</label>
        <input {...register('phone')} type="tel" placeholder="Opcional" className="input-base" />
      </div>

      <div className="border-t border-bsm-border pt-5">
        <p className="text-[10px] text-bsm-text-muted uppercase tracking-widest mb-4">El vehículo que buscas</p>

        {/* Vehicle type */}
        <div className="mb-4">
          <label className="label-base">Tipo</label>
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

        {/* Brand + Model */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="label-base">Marca deseada</label>
            <input {...register('brand')} placeholder="Ferrari, Porsche..." className="input-base" />
          </div>
          <div>
            <label className="label-base">Modelo</label>
            <input {...register('model')} placeholder="911, F8..." className="input-base" />
          </div>
        </div>

        {/* Version */}
        <div className="mb-4">
          <label className="label-base">Versión / variante</label>
          <input {...register('version')} placeholder="Turbo, GT3, V4 S..." className="input-base" />
        </div>

        {/* Budget + Location */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label-base">Presupuesto máximo</label>
            <input {...register('budget')} placeholder="Ej. 120.000 €" className="input-base" />
          </div>
          <div>
            <label className="label-base">Ubicación preferida</label>
            <input {...register('location')} placeholder="Madrid, nacional..." className="input-base" />
          </div>
        </div>
      </div>

      <div className="border-t border-bsm-border pt-5">
        <p className="text-[10px] text-bsm-text-muted uppercase tracking-widest mb-4">Tu intención de compra</p>

        {/* Timeline */}
        <div className="mb-4">
          <label className="label-base">Plazo de compra</label>
          <select {...register('timeline')} className="input-base">
            <option value="immediate">Inmediata</option>
            <option value="1_3_months">1-3 meses</option>
            <option value="3_6_months">3-6 meses</option>
            <option value="exploring">Explorando opciones</option>
          </select>
        </div>

        {/* Financing */}
        <div className="mb-4">
          <label className="label-base">¿Necesita financiación?</label>
          <div className="grid grid-cols-3 gap-2">
            {[{ value: 'yes', label: 'Sí' }, { value: 'no', label: 'No' }, { value: 'maybe', label: 'No lo sé' }].map((o) => (
              <label key={o.value}
                className="flex items-center justify-center py-2.5 border border-bsm-border text-xs text-bsm-text-muted cursor-pointer
                  has-[:checked]:border-[#C6A64B]/40 has-[:checked]:text-[#C6A64B] has-[:checked]:bg-[#C6A64B]/5
                  hover:border-bsm-border-light transition-colors">
                <input type="radio" {...register('financing')} value={o.value} className="sr-only" />
                {o.label}
              </label>
            ))}
          </div>
        </div>

        {/* Trade-in */}
        <div className="mb-4">
          <label className="label-base">¿Entrega vehículo?</label>
          <div className="grid grid-cols-2 gap-2">
            {[{ value: 'yes', label: 'Sí' }, { value: 'no', label: 'No' }].map((o) => (
              <label key={o.value}
                className="flex items-center justify-center py-2.5 border border-bsm-border text-xs text-bsm-text-muted cursor-pointer
                  has-[:checked]:border-[#C6A64B]/40 has-[:checked]:text-[#C6A64B] has-[:checked]:bg-[#C6A64B]/5
                  hover:border-bsm-border-light transition-colors">
                <input type="radio" {...register('trade_in')} value={o.value} className="sr-only" />
                {o.label}
              </label>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="label-base">Detalles adicionales</label>
          <textarea
            {...register('notes')}
            rows={4}
            placeholder="Criterios específicos, condiciones, prioridades de búsqueda..."
            className="input-base resize-none"
          />
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
        {isSubmitting ? 'Enviando...' : 'Solicitar búsqueda'}
      </button>

      <p className="text-[10px] text-bsm-text-muted text-center leading-relaxed">
        El servicio de vehículos a la carta registra tu interés para detectar oportunidades compatibles. No garantiza disponibilidad, precio ni localización concreta. Al enviar aceptas la política de privacidad.
      </p>
    </form>
  )
}
