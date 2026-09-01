'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Check, CheckCircle, ChevronDown, ChevronUp, Info } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import {
  getAcquisitionContext,
  getAnalyticsSessionId,
  trackEvent,
} from '@/lib/analytics/client'

const schema = z.object({
  buyer_name:         z.string().min(2, 'Nombre requerido'),
  buyer_email:        z.string().email('Email inválido'),
  buyer_phone:        z.string().optional(),
  message:            z.string().optional(),
  // Optional context — have defaults so they never block submission
  purchase_timeline:  z.enum(['immediate', '1_3_months', '3_6_months', 'exploring']).optional(),
  financing:          z.enum(['yes', 'no', 'maybe']).optional(),
  trade_in:           z.enum(['yes', 'no']).optional(),
  contact_preference: z.enum(['call', 'whatsapp', 'email']).optional(),
}).refine(
  (data) => data.contact_preference !== 'call' && data.contact_preference !== 'whatsapp'
    ? true
    : Boolean(data.buyer_phone && data.buyer_phone.trim().length >= 6),
  { message: 'Indica un teléfono para que puedan contactarte así', path: ['buyer_phone'] },
)

type FormData = z.infer<typeof schema>

interface QualifiedLeadFormProps {
  vehicleId: string
  dealerId: string
  vehicleTitle: string
}

const TIMELINE_OPTIONS = [
  { value: 'immediate',  label: 'De forma inmediata' },
  { value: '1_3_months', label: 'En 1-3 meses' },
  { value: '3_6_months', label: 'En 3-6 meses' },
  { value: 'exploring',  label: 'Explorando opciones' },
]

const FINANCING_OPTIONS = [
  { value: 'yes',   label: 'Sí' },
  { value: 'no',    label: 'No' },
  { value: 'maybe', label: 'No lo sé aún' },
]

const CONTACT_OPTIONS = [
  { value: 'call',     label: 'Llamada' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'email',    label: 'Email' },
]

export default function QualifiedLeadForm({ vehicleId, dealerId, vehicleTitle }: QualifiedLeadFormProps) {
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showAdvanced, setShowAdvanced] = useState(false)

  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  // Precarga nombre/email si hay sesión de comprador activa — evita que alguien ya
  // identificado tenga que volver a teclear datos que el Market ya conoce de él.
  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      const fullName = typeof user.user_metadata?.full_name === 'string' ? user.user_metadata.full_name : ''
      if (fullName) setValue('buyer_name', fullName)
      if (user.email) setValue('buyer_email', user.email)
    })
  }, [setValue])

  async function onSubmit(data: FormData) {
    setError(null)

    const timelineLabels: Record<string, string> = {
      immediate: 'Inmediata', '1_3_months': '1-3 meses',
      '3_6_months': '3-6 meses', exploring: 'Explorando',
    }
    const financingLabels: Record<string, string> = { yes: 'Sí', no: 'No', maybe: 'No lo sé' }
    const contactLabels: Record<string, string> = { call: 'Llamada', whatsapp: 'WhatsApp', email: 'Email' }

    const parts: string[] = []
    if (data.message) parts.push(data.message)
    if (data.purchase_timeline) parts.push(`Plazo: ${timelineLabels[data.purchase_timeline]}`)
    if (data.financing) parts.push(`Financiación: ${financingLabels[data.financing]}`)
    if (data.trade_in) parts.push(`Entrega vehículo: ${data.trade_in === 'yes' ? 'Sí' : 'No'}`)
    if (data.contact_preference) parts.push(`Contacto preferido: ${contactLabels[data.contact_preference]}`)

    // Single server-side insert + n8n event (lead.created), via /api/leads.
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vehicle_id:  vehicleId,
          dealer_id:   dealerId,
          buyer_name:  data.buyer_name,
          buyer_email: data.buyer_email,
          buyer_phone: data.buyer_phone || null,
          qualification: {
            purchase_timeline: data.purchase_timeline,
            financing: data.financing,
            trade_in: data.trade_in,
            contact_preference: data.contact_preference,
          },
          acquisition_context: getAcquisitionContext(),
          session_id: getAnalyticsSessionId(),
          message:     parts.join(' · ') || 'Solicitud de información',
        }),
      })
      if (!res.ok) { setError('Error al enviar. Inténtalo de nuevo.'); return }
    } catch {
      setError('Error al enviar. Revisa tu conexión e inténtalo de nuevo.')
      return
    }

    trackEvent({
      event_type: 'vehicle_contact_submit',
      vehicle_id: vehicleId,
      dealer_id: dealerId,
    })

    if (typeof window !== 'undefined') {
      const dl = ((window as any).dataLayer = (window as any).dataLayer || [])
      dl.push({
        event:          'dealer_contact_click',
        contact_method: 'form',
        vehicle_id:     vehicleId || undefined,
        dealer_id:      dealerId  || undefined,
      })
    }

    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center text-center py-6">
        <CheckCircle className="w-10 h-10 text-emerald-400 mb-3" />
        <p className="font-medium text-bsm-text-primary mb-1">Consulta enviada</p>
        <p className="text-xs text-bsm-text-muted max-w-[240px]">
          Hemos registrado tu consulta y la estamos cursando al vendedor.
        </p>
        <p className="text-[10px] text-[#9E9E9E] mt-3 max-w-[220px] leading-relaxed italic">
          Esta consulta no implica reserva ni confirma disponibilidad de la unidad.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">

      {/* Nombre */}
      <div>
        <label htmlFor="qlf-name" className="sr-only">Tu nombre</label>
        <input
          {...register('buyer_name')}
          id="qlf-name"
          placeholder="Tu nombre"
          aria-invalid={!!errors.buyer_name}
          aria-describedby={errors.buyer_name ? 'qlf-name-err' : undefined}
          className="input-base"
        />
        {errors.buyer_name && <p id="qlf-name-err" role="alert" className="text-xs text-red-400 mt-1">{errors.buyer_name.message}</p>}
      </div>

      {/* Email */}
      <div>
        <label htmlFor="qlf-email" className="sr-only">Tu email</label>
        <input
          {...register('buyer_email')}
          id="qlf-email"
          type="email"
          placeholder="Tu email"
          aria-invalid={!!errors.buyer_email}
          aria-describedby={errors.buyer_email ? 'qlf-email-err' : undefined}
          className="input-base"
        />
        {errors.buyer_email && <p id="qlf-email-err" role="alert" className="text-xs text-red-400 mt-1">{errors.buyer_email.message}</p>}
      </div>

      {/* Teléfono */}
      <label htmlFor="qlf-phone" className="sr-only">Teléfono (opcional)</label>
      <input
        {...register('buyer_phone')}
        id="qlf-phone"
        type="tel"
        placeholder="Teléfono (opcional)"
        className="input-base"
      />

      {/* Mensaje */}
      <label htmlFor="qlf-message" className="sr-only">Mensaje</label>
      <textarea
        {...register('message')}
        id="qlf-message"
        rows={3}
        placeholder="Hola, me interesa este vehículo. Me gustaría recibir más información."
        className="input-base resize-none"
      />

      {/* Datos adicionales — colapsable */}
      <div className="border border-bsm-border">
        <button
          type="button"
          onClick={() => setShowAdvanced(v => !v)}
          className="w-full flex items-center justify-between px-3 py-2.5 text-xs text-bsm-text-muted hover:text-bsm-text-primary transition-colors"
        >
          <span>Datos adicionales (opcional)</span>
          {showAdvanced ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        {showAdvanced && (
          <div className="px-3 pb-3 space-y-3 border-t border-bsm-border pt-3">

            {/* Plazo */}
            <div>
              <label className="text-[10px] text-bsm-text-muted uppercase tracking-widest block mb-1.5">
                Plazo de compra
              </label>
              <select {...register('purchase_timeline')} className="input-base">
                <option value="">Sin especificar</option>
                {TIMELINE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>

            {/* Financiación */}
            <div>
              <label className="text-[10px] text-bsm-text-muted uppercase tracking-widest block mb-1.5">
                ¿Necesitas financiación?
              </label>
              <div className="grid grid-cols-3 gap-2">
                {FINANCING_OPTIONS.map((o) => (
                  <label
                    key={o.value}
                    className="flex items-center justify-center gap-1.5 px-2 py-2 border border-bsm-border
                      text-xs text-bsm-text-muted cursor-pointer
                      has-[:checked]:border-gold/40 has-[:checked]:text-gold has-[:checked]:bg-gold/5
                      hover:border-bsm-border-light transition-colors"
                  >
                    <input type="radio" {...register('financing')} value={o.value} className="sr-only peer" />
                    <Check className="w-3 h-3 shrink-0 opacity-0 peer-checked:opacity-100 transition-opacity" aria-hidden="true" />
                    {o.label}
                  </label>
                ))}
              </div>
            </div>

            {/* Entrega */}
            <div>
              <label className="text-[10px] text-bsm-text-muted uppercase tracking-widest block mb-1.5">
                ¿Entregas un vehículo?
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[{ value: 'yes', label: 'Sí' }, { value: 'no', label: 'No' }].map((o) => (
                  <label
                    key={o.value}
                    className="flex items-center justify-center gap-1.5 px-2 py-2 border border-bsm-border
                      text-xs text-bsm-text-muted cursor-pointer
                      has-[:checked]:border-gold/40 has-[:checked]:text-gold has-[:checked]:bg-gold/5
                      hover:border-bsm-border-light transition-colors"
                  >
                    <input type="radio" {...register('trade_in')} value={o.value} className="sr-only peer" />
                    <Check className="w-3 h-3 shrink-0 opacity-0 peer-checked:opacity-100 transition-opacity" aria-hidden="true" />
                    {o.label}
                  </label>
                ))}
              </div>
            </div>

            {/* Contacto preferido */}
            <div>
              <label className="text-[10px] text-bsm-text-muted uppercase tracking-widest block mb-1.5">
                Cómo prefieres que te contacten
              </label>
              <div className="grid grid-cols-3 gap-2">
                {CONTACT_OPTIONS.map((o) => (
                  <label
                    key={o.value}
                    className="flex items-center justify-center gap-1.5 px-2 py-2 border border-bsm-border
                      text-xs text-bsm-text-muted cursor-pointer
                      has-[:checked]:border-gold/40 has-[:checked]:text-gold has-[:checked]:bg-gold/5
                      hover:border-bsm-border-light transition-colors"
                  >
                    <input type="radio" {...register('contact_preference')} value={o.value} className="sr-only peer" />
                    <Check className="w-3 h-3 shrink-0 opacity-0 peer-checked:opacity-100 transition-opacity" aria-hidden="true" />
                    {o.label}
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {error && <p className="text-xs text-red-400">{error}</p>}

      <button
        type="submit"
        disabled={isSubmitting}
        className="btn-gold w-full justify-center"
      >
        {isSubmitting ? 'Enviando...' : 'Contactar sobre este vehículo'}
      </button>

      <div className="flex items-start gap-2 pt-1">
        <Info className="w-3.5 h-3.5 text-bsm-text-muted flex-shrink-0 mt-0.5" />
        <p className="text-[10px] text-bsm-text-muted leading-relaxed">
          Registraremos tu consulta para cursarla al vendedor. No implica reserva ni confirma disponibilidad.
        </p>
      </div>
    </form>
  )
}
