'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { CheckCircle } from 'lucide-react'
import { getAcquisitionContext } from '@/lib/analytics/client'
import { NEWSLETTER_CONSENT_TEXT, NEWSLETTER_CONSENT_VERSION, NEWSLETTER_TOPICS } from '@/lib/newsletter'

// Solo se muestran los temas activos hoy (ver lib/newsletter.ts) — "nuevas_llegadas"
// existe en el mapeo pero no se ofrece todavía.
const VISIBLE_TOPICS = NEWSLETTER_TOPICS.filter((t) => t.active)

const schema = z.object({
  email: z.string().email('Email inválido'),
  topics: z.array(z.string()).min(1, 'Elige al menos un tema'),
  consent: z.literal(true, { errorMap: () => ({ message: 'Falta tu consentimiento' }) }),
})

type FormData = z.infer<typeof schema>

interface Props {
  variant?: 'landing' | 'embed'
}

export default function NewsletterSignupForm({ variant = 'landing' }: Props) {
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    // Sin defaultValues en topics/consent — nada va premarcado, el usuario elige.
  })

  async function onSubmit(data: FormData) {
    setError(null)
    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: data.email,
          topics: data.topics,
          consent_version: NEWSLETTER_CONSENT_VERSION,
          acquisition_context: getAcquisitionContext(),
          landing_path: typeof window !== 'undefined' ? window.location.pathname : null,
        }),
      })
      if (!res.ok) {
        setError('No se pudo procesar la suscripción. Inténtalo de nuevo en unos minutos.')
        return
      }
    } catch {
      setError('No se pudo procesar la suscripción. Revisa tu conexión e inténtalo de nuevo.')
      return
    }
    setSubmitted(true)
  }

  if (submitted) {
    const successClass = variant === 'landing'
      ? 'bg-surface border border-bsm-border px-8 py-10 text-center'
      : 'bg-surface-elevated border border-bsm-border border-l-2 border-l-gold px-8 py-8 text-center'
    return (
      <div className={successClass}>
        <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-4" />
        <p className="font-display text-lg font-light text-bsm-text-primary mb-1">Revisa tu email</p>
        <p className="text-sm text-bsm-text-muted max-w-xs mx-auto">
          Te hemos enviado un enlace para confirmar la suscripción. Sin ese paso, no llega ningún envío.
        </p>
      </div>
    )
  }

  if (variant === 'embed') {
    return (
      <div className="bg-surface-elevated border border-bsm-border border-l-2 border-l-gold px-8 py-8">
        <p className="text-[10px] tracking-widest uppercase text-gold mb-2">Selección mensual</p>
        <h3 className="font-display text-xl font-normal text-bsm-text-primary mb-2">
          ¿Sigues comparando unidades como esta?
        </h3>
        <p className="text-[13px] text-bsm-text-muted leading-relaxed mb-5 max-w-sm">
          Una vez al mes, una edición con lo nuevo del catálogo y un dato de mercado — sin listados, sin spam.
        </p>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div className="flex gap-2 flex-wrap">
            <input
              {...register('email')}
              type="email"
              placeholder="tu@email.com"
              className="input-base flex-1 min-w-[200px]"
            />
            <button type="submit" disabled={isSubmitting} className="btn-gold whitespace-nowrap">
              {isSubmitting ? 'Enviando…' : 'Suscribirme'}
            </button>
          </div>
          {errors.email && <p className="text-[11px] text-red-400">{errors.email.message}</p>}
          <TopicCheckboxes register={register} compact />
          {errors.topics && <p className="text-[11px] text-red-400">{errors.topics.message}</p>}
          <ConsentCheckbox register={register} error={errors.consent?.message} compact />
          {error && <p className="text-[11px] text-red-400">{error}</p>}
        </form>
      </div>
    )
  }

  return (
    <div className="bg-surface border border-bsm-border p-10 max-w-[480px] mx-auto text-left">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label className="label-base">Email</label>
          <input {...register('email')} type="email" placeholder="tu@email.com" className="input-base" />
          {errors.email && <p className="text-[11px] text-red-400 mt-1">{errors.email.message}</p>}
        </div>
        <div>
          <label className="label-base">Qué quieres recibir</label>
          <TopicCheckboxes register={register} />
          {errors.topics && <p className="text-[11px] text-red-400 mt-1.5">{errors.topics.message}</p>}
        </div>
        <ConsentCheckbox register={register} error={errors.consent?.message} />
        {error && <p className="text-[11px] text-red-400">{error}</p>}
        <button type="submit" disabled={isSubmitting} className="btn-gold w-full">
          {isSubmitting ? 'Enviando…' : 'Suscribirme'}
        </button>
        <p className="text-center text-[11px] text-bsm-text-muted">
          Doble confirmación por email · sin premarcar nada
        </p>
      </form>
    </div>
  )
}

function TopicCheckboxes({ register, compact = false }: { register: ReturnType<typeof useForm<FormData>>['register']; compact?: boolean }) {
  if (compact) {
    return (
      <div className="flex gap-4 flex-wrap">
        {VISIBLE_TOPICS.map((topic) => (
          <label key={topic.id} className="flex items-center gap-2 text-xs text-bsm-text-secondary cursor-pointer">
            <input type="checkbox" value={topic.id} {...register('topics')} className="accent-gold" />
            {topic.name}
          </label>
        ))}
      </div>
    )
  }
  return (
    <div className="space-y-2">
      {VISIBLE_TOPICS.map((topic) => (
        <label
          key={topic.id}
          className="flex items-start gap-3 p-3.5 border border-bsm-border cursor-pointer hover:border-gold/35 transition-colors"
        >
          <input type="checkbox" value={topic.id} {...register('topics')} className="mt-0.5 accent-gold" />
          <span>
            <span className="block text-[13.5px] font-medium text-bsm-text-primary">{topic.name}</span>
            <span className="block text-xs text-bsm-text-muted leading-relaxed">{topic.description}</span>
          </span>
        </label>
      ))}
    </div>
  )
}

// Divide el texto compartido de lib/newsletter.ts justo antes de "Política de
// Privacidad" para enlazarlo sin mantener una segunda copia del texto legal — lo que
// se muestra aquí y lo que el servidor guarda como consent_snapshot es literalmente
// el mismo string.
const [CONSENT_LEAD, CONSENT_LINK_LABEL] = (() => {
  const marker = 'Política de Privacidad'
  const idx = NEWSLETTER_CONSENT_TEXT.indexOf(marker)
  return [NEWSLETTER_CONSENT_TEXT.slice(0, idx), marker]
})()

function ConsentCheckbox({
  register,
  error,
  compact = false,
}: {
  register: ReturnType<typeof useForm<FormData>>['register']
  error?: string
  compact?: boolean
}) {
  return (
    <div>
      <label className={`flex items-start gap-2.5 ${compact ? '' : 'mt-1'}`}>
        <input type="checkbox" {...register('consent')} className="mt-0.5 accent-gold" />
        <span className={`text-bsm-text-muted leading-relaxed ${compact ? 'text-[10.5px]' : 'text-xs'}`}>
          {CONSENT_LEAD}
          <a href="/legal/privacidad" className="text-gold underline underline-offset-2">
            {CONSENT_LINK_LABEL}
          </a>.
        </span>
      </label>
      {error && <p className="text-[11px] text-red-400 mt-1">{error}</p>}
    </div>
  )
}
