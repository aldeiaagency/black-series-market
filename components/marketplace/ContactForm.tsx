'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
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
    const supabase = createClient()
    const { error: err } = await supabase.from('leads').insert({
      vehicle_id: vehicleId,
      dealer_id: dealerId,
      ...data,
    })
    if (err) {
      setError('Error al enviar. Inténtalo de nuevo.')
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
        <input
          {...register('buyer_name')}
          placeholder="Tu nombre"
          className="input-base"
        />
        {errors.buyer_name && (
          <p className="text-xs text-red-400 mt-1">{errors.buyer_name.message}</p>
        )}
      </div>
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
      <div>
        <input
          {...register('buyer_phone')}
          type="tel"
          placeholder="Teléfono (opcional)"
          className="input-base"
        />
      </div>
      <div>
        <textarea
          {...register('message')}
          rows={4}
          className="input-base resize-none"
        />
        {errors.message && (
          <p className="text-xs text-red-400 mt-1">{errors.message.message}</p>
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
