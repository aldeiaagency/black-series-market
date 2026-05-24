'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import { CheckCircle, Info } from 'lucide-react'

const schema = z.object({
  buyer_name:         z.string().min(2, 'Nombre requerido'),
  buyer_email:        z.string().email('Email inválido'),
  buyer_phone:        z.string().optional(),
  purchase_timeline:  z.enum(['immediate', '1_3_months', '3_6_months', 'exploring']),
  financing:          z.enum(['yes', 'no', 'maybe']),
  trade_in:           z.enum(['yes', 'no']),
  contact_preference: z.enum(['call', 'whatsapp', 'email']),
  message:            z.string().optional(),
})

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
  { value: 'maybe', label: 'Aún no lo sé' },
]

const CONTACT_OPTIONS = [
  { value: 'call',     label: 'Llamada' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'email',    label: 'Email' },
]

export default function QualifiedLeadForm({ vehicleId, dealerId, vehicleTitle }: QualifiedLeadFormProps) {
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      purchase_timeline:  '1_3_months',
      financing:          'maybe',
      trade_in:           'no',
      contact_preference: 'whatsapp',
    },
  })

  async function onSubmit(data: FormData) {
    setError(null)
    const supabase = createClient()

    const timelineLabels: Record<string, string> = {
      immediate:    'Inmediata',
      '1_3_months': '1-3 meses',
      '3_6_months': '3-6 meses',
      exploring:    'Explorando',
    }
    const financingLabels: Record<string, string> = {
      yes: 'Sí', no: 'No', maybe: 'No lo sé',
    }
    const contactLabels: Record<string, string> = {
      call: 'Llamada', whatsapp: 'WhatsApp', email: 'Email',
    }

    const contextMessage = [
      `Plazo de compra: ${timelineLabels[data.purchase_timeline]}`,
      `Financiación: ${financingLabels[data.financing]}`,
      `Entrega de vehículo: ${data.trade_in === 'yes' ? 'Sí' : 'No'}`,
      `Contacto preferido: ${contactLabels[data.contact_preference]}`,
      data.message ? `\nMensaje: ${data.message}` : '',
    ].filter(Boolean).join(' · ')

    const { error: err } = await supabase.from('leads').insert({
      vehicle_id:  vehicleId,
      dealer_id:   dealerId,
      buyer_name:  data.buyer_name,
      buyer_email: data.buyer_email,
      buyer_phone: data.buyer_phone || null,
      message:     contextMessage,
    })

    if (err) {
      setError('Error al enviar. Inténtalo de nuevo.')
      return
    }
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center text-center py-6">
        <CheckCircle className="w-10 h-10 text-emerald-400 mb-3" />
        <p className="font-medium text-bsm-text-primary mb-1">Solicitud registrada</p>
        <p className="text-xs text-bsm-text-muted max-w-[240px]">
          El vendedor recibirá tu interés con el contexto necesario.
        </p>
        <p className="text-[10px] text-[#575757] mt-3 max-w-[220px] leading-relaxed italic">
          El envío no garantiza disponibilidad. Confirma siempre condiciones actualizadas con el vendedor.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      {/* Name */}
      <div>
        <input
          {...register('buyer_name')}
          placeholder="Tu nombre"
          className="input-base"
        />
        {errors.buyer_name && (
          <p className="text-xs text-red-400 mt-1">{errors.buyer_name.message}</p>
        )}
      </div>

      {/* Email */}
      <div>
        <input
          {...register('buyer_email')}
          type="email"
          placeholder="Tu email"
          className="input-base"
        />
        {errors.buyer_email && (
          <p className="text-xs text-red-400 mt-1">{errors.buyer_email.message}</p>
        )}
      </div>

      {/* Phone */}
      <input
        {...register('buyer_phone')}
        type="tel"
        placeholder="Teléfono (opcional)"
        className="input-base"
      />

      {/* Purchase timeline */}
      <div>
        <label className="text-[10px] text-bsm-text-muted uppercase tracking-widest block mb-1.5">
          Plazo de compra
        </label>
        <select {...register('purchase_timeline')} className="input-base">
          {TIMELINE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {/* Financing */}
      <div>
        <label className="text-[10px] text-bsm-text-muted uppercase tracking-widest block mb-1.5">
          ¿Necesita financiación?
        </label>
        <div className="grid grid-cols-3 gap-2">
          {FINANCING_OPTIONS.map((o) => (
            <label
              key={o.value}
              className="flex items-center justify-center gap-1.5 px-2 py-2 border border-bsm-border
                text-xs text-bsm-text-muted cursor-pointer
                has-[:checked]:border-[#C6A64B]/40 has-[:checked]:text-[#C6A64B] has-[:checked]:bg-[#C6A64B]/5
                hover:border-bsm-border-light transition-colors"
            >
              <input type="radio" {...register('financing')} value={o.value} className="sr-only" />
              {o.label}
            </label>
          ))}
        </div>
      </div>

      {/* Trade-in */}
      <div>
        <label className="text-[10px] text-bsm-text-muted uppercase tracking-widest block mb-1.5">
          ¿Entrega vehículo?
        </label>
        <div className="grid grid-cols-2 gap-2">
          {[{ value: 'yes', label: 'Sí' }, { value: 'no', label: 'No' }].map((o) => (
            <label
              key={o.value}
              className="flex items-center justify-center gap-1.5 px-2 py-2 border border-bsm-border
                text-xs text-bsm-text-muted cursor-pointer
                has-[:checked]:border-[#C6A64B]/40 has-[:checked]:text-[#C6A64B] has-[:checked]:bg-[#C6A64B]/5
                hover:border-bsm-border-light transition-colors"
            >
              <input type="radio" {...register('trade_in')} value={o.value} className="sr-only" />
              {o.label}
            </label>
          ))}
        </div>
      </div>

      {/* Contact preference */}
      <div>
        <label className="text-[10px] text-bsm-text-muted uppercase tracking-widest block mb-1.5">
          Contacto preferido
        </label>
        <div className="grid grid-cols-3 gap-2">
          {CONTACT_OPTIONS.map((o) => (
            <label
              key={o.value}
              className="flex items-center justify-center gap-1.5 px-2 py-2 border border-bsm-border
                text-xs text-bsm-text-muted cursor-pointer
                has-[:checked]:border-[#C6A64B]/40 has-[:checked]:text-[#C6A64B] has-[:checked]:bg-[#C6A64B]/5
                hover:border-bsm-border-light transition-colors"
            >
              <input type="radio" {...register('contact_preference')} value={o.value} className="sr-only" />
              {o.label}
            </label>
          ))}
        </div>
      </div>

      {/* Message */}
      <textarea
        {...register('message')}
        rows={3}
        placeholder="Comentarios adicionales (opcional)"
        className="input-base resize-none"
      />

      {error && <p className="text-xs text-red-400">{error}</p>}

      <button
        type="submit"
        disabled={isSubmitting}
        className="btn-gold w-full justify-center"
      >
        {isSubmitting ? 'Enviando...' : 'Enviar solicitud'}
      </button>

      <div className="flex items-start gap-2 pt-1">
        <Info className="w-3.5 h-3.5 text-bsm-text-muted flex-shrink-0 mt-0.5" />
        <p className="text-[10px] text-bsm-text-muted leading-relaxed">
          El envío no garantiza disponibilidad. Confirma siempre condiciones actualizadas con el vendedor.
        </p>
      </div>
    </form>
  )
}
