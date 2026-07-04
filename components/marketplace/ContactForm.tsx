'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { CheckCircle } from 'lucide-react'

const schema = z.object({
  buyer_name: z.string().min(2, 'Nombre requerido'),
  buyer_email: z.string().email('Email inválido'),
  buyer_phone: z.string().optional(),
  message: z.string().min(10, 'El mensaje debe tener al menos 10 caracteres'),
})

type FormData = z.infer<typeof schema>

interface ContactFormProps {
  vehicleId: string
  dealerId: string
  vehicleTitle: string
}

export default function ContactForm({ vehicleId, dealerId, vehicleTitle }: ContactFormProps) {
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      message: `Hola, estoy interesado/a en el ${vehicleTitle}. ¿Podría darme más información?`,
    },
  })

  async function onSubmit(data: FormData) {
    setError(null)
    // Vía el endpoint endurecido /api/leads: rate limit, validación de pertenencia y evento n8n
    // (antes se insertaba directo por el cliente, saltándose todo eso).
    const res = await fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vehicle_id: vehicleId, dealer_id: dealerId, ...data }),
    })
    if (!res.ok) {
      setError(res.status === 429 ? 'Demasiados envíos. Espera un momento e inténtalo de nuevo.' : 'Error al enviar. Inténtalo de nuevo.')
      return
    }
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center text-center py-4">
        <CheckCircle className="w-10 h-10 text-emerald-400 mb-3" />
        <p className="font-medium text-bsm-text-primary mb-1">Solicitud enviada</p>
        <p className="text-xs text-bsm-text-muted">
          El concesionario recibirá tu mensaje y te responderá en breve.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      <div>
        <label htmlFor="cf-name" className="sr-only">Tu nombre</label>
        <input
          {...register('buyer_name')}
          id="cf-name"
          placeholder="Tu nombre"
          aria-invalid={!!errors.buyer_name}
          aria-describedby={errors.buyer_name ? 'cf-name-err' : undefined}
          className="input-base"
        />
        {errors.buyer_name && (
          <p id="cf-name-err" role="alert" className="text-xs text-red-400 mt-1">{errors.buyer_name.message}</p>
        )}
      </div>
      <div>
        <label htmlFor="cf-email" className="sr-only">Tu email</label>
        <input
          {...register('buyer_email')}
          id="cf-email"
          type="email"
          placeholder="Tu email"
          aria-invalid={!!errors.buyer_email}
          aria-describedby={errors.buyer_email ? 'cf-email-err' : undefined}
          className="input-base"
        />
        {errors.buyer_email && (
          <p id="cf-email-err" role="alert" className="text-xs text-red-400 mt-1">{errors.buyer_email.message}</p>
        )}
      </div>
      <div>
        <label htmlFor="cf-phone" className="sr-only">Teléfono (opcional)</label>
        <input
          {...register('buyer_phone')}
          id="cf-phone"
          type="tel"
          placeholder="Teléfono (opcional)"
          className="input-base"
        />
      </div>
      <div>
        <label htmlFor="cf-message" className="sr-only">Mensaje</label>
        <textarea
          {...register('message')}
          id="cf-message"
          rows={4}
          aria-invalid={!!errors.message}
          aria-describedby={errors.message ? 'cf-message-err' : undefined}
          className="input-base resize-none"
        />
        {errors.message && (
          <p id="cf-message-err" role="alert" className="text-xs text-red-400 mt-1">{errors.message.message}</p>
        )}
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
      <button
        type="submit"
        disabled={isSubmitting}
        className="btn-gold w-full justify-center"
      >
        {isSubmitting ? 'Enviando...' : 'Enviar consulta'}
      </button>
      <p className="text-[10px] text-bsm-text-muted text-center">
        Al enviar aceptas nuestra política de privacidad.
      </p>
    </form>
  )
}
