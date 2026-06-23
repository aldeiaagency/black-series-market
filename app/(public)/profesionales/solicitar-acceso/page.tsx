'use client'

import Link from 'next/link'
import { useState, useTransition, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

const PLANS = [
  { value: 'essential',    label: 'Essential — 197 €/mes' },
  { value: 'professional', label: 'Professional — 449 €/mes' },
  { value: 'elite',        label: 'Elite — 899 €/mes (plazas limitadas)' },
  { value: 'grupo',        label: 'Modelo Grupo (multi-sede)' },
]

const VEHICLE_VOLUMES = [
  'Menos de 15 unidades activas',
  '15-50 unidades activas',
  '51-100 unidades activas',
  'Más de 100 unidades activas',
]

function SolicitarAccesoForm() {
  const params = useSearchParams()
  const defaultPlan = params.get('plan') ?? ''
  const isWaitlist = params.get('waitlist') === '1'
  const isConsulta = params.get('consulta') === '1'

  const [pending, startTransition] = useTransition()
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    plan: defaultPlan,
    volume: '',
    city: '',
    message: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    startTransition(async () => {
      try {
        const res = await fetch('/api/showroom-applications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name:    form.name,
            email:   form.email,
            company: form.company,
            phone:   form.phone,
            city:    form.city,
            plan:    form.plan || undefined,
            volume:  form.volume || undefined,
            message: [
              isWaitlist ? 'Lista de espera Elite' : '',
              form.message,
            ].filter(Boolean).join('\n') || undefined,
          }),
        })
        if (!res.ok) throw new Error('Error al enviar')
        setSent(true)
      } catch {
        setError('Ha ocurrido un error. Escríbenos directamente a hola@blacklabelmarket.es')
      }
    })
  }

  const title = isWaitlist
    ? 'Lista de espera Elite'
    : isConsulta
    ? 'Consulta disponibilidad Elite'
    : 'Solicitar acceso profesional'

  if (sent) {
    return (
      <div className="max-w-screen-sm mx-auto px-6 pt-40 pb-24 text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="h-px w-8 bg-gold" />
          <span className="text-xs text-gold tracking-widest uppercase">Solicitud recibida</span>
          <div className="h-px w-8 bg-gold" />
        </div>
        <h1 className="font-display text-3xl font-light text-bsm-text-primary mb-4">
          Nos ponemos en contacto contigo
        </h1>
        <p className="text-sm text-bsm-text-secondary mb-8">
          Hemos recibido tu solicitud. El equipo de Black Label Market la revisará
          y te contactará en el menor tiempo posible.
        </p>
        <Link href="/" className="btn-outline px-6">
          Volver al inicio
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-screen-sm mx-auto px-6 pt-28 pb-24">
      {/* Breadcrumb */}
      <nav aria-label="breadcrumb" className="mb-10">
        <ol className="flex items-center gap-1.5 text-xs text-bsm-text-muted">
          <li><Link href="/" className="hover:text-gold transition-colors">Inicio</Link></li>
          <li className="text-[#3A3A3A]" aria-hidden="true">/</li>
          <li><Link href="/para-profesionales" className="hover:text-gold transition-colors">Para profesionales</Link></li>
          <li className="text-[#3A3A3A]" aria-hidden="true">/</li>
          <li className="text-bsm-text-secondary">Solicitar acceso</li>
        </ol>
      </nav>

      <div className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-px w-8 bg-gold" />
          <span className="text-xs text-gold tracking-widest uppercase">Acceso profesional</span>
        </div>
        <h1 className="font-display text-3xl font-light text-bsm-text-primary mb-2">{title}</h1>
        <p className="text-sm text-bsm-text-secondary">
          {isWaitlist
            ? 'Cuando se libere disponibilidad Elite en tu zona, te avisamos.'
            : 'El equipo revisará tu solicitud y te contactará para completar la verificación.'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs text-bsm-text-muted uppercase tracking-widest mb-2">
              Nombre *
            </label>
            <input
              required
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full bg-surface border border-bsm-border px-4 py-3 text-sm text-bsm-text-primary focus:outline-none focus:border-gold transition-colors"
              placeholder="Tu nombre"
            />
          </div>
          <div>
            <label className="block text-xs text-bsm-text-muted uppercase tracking-widest mb-2">
              Empresa *
            </label>
            <input
              required
              name="company"
              value={form.company}
              onChange={handleChange}
              className="w-full bg-surface border border-bsm-border px-4 py-3 text-sm text-bsm-text-primary focus:outline-none focus:border-gold transition-colors"
              placeholder="Nombre del concesionario o empresa"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs text-bsm-text-muted uppercase tracking-widest mb-2">
              Email *
            </label>
            <input
              required
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="w-full bg-surface border border-bsm-border px-4 py-3 text-sm text-bsm-text-primary focus:outline-none focus:border-gold transition-colors"
              placeholder="tu@empresa.com"
            />
          </div>
          <div>
            <label className="block text-xs text-bsm-text-muted uppercase tracking-widest mb-2">
              Teléfono
            </label>
            <input
              name="phone"
              type="tel"
              value={form.phone}
              onChange={handleChange}
              className="w-full bg-surface border border-bsm-border px-4 py-3 text-sm text-bsm-text-primary focus:outline-none focus:border-gold transition-colors"
              placeholder="+34 600 000 000"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs text-bsm-text-muted uppercase tracking-widest mb-2">
            Plan de interés
          </label>
          <select
            name="plan"
            value={form.plan}
            onChange={handleChange}
            className="w-full bg-surface border border-bsm-border px-4 py-3 text-sm text-bsm-text-primary focus:outline-none focus:border-gold transition-colors"
          >
            <option value="">Selecciona un plan</option>
            {PLANS.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs text-bsm-text-muted uppercase tracking-widest mb-2">
              Volumen de inventario
            </label>
            <select
              name="volume"
              value={form.volume}
              onChange={handleChange}
              className="w-full bg-surface border border-bsm-border px-4 py-3 text-sm text-bsm-text-primary focus:outline-none focus:border-gold transition-colors"
            >
              <option value="">Seleccionar</option>
              {VEHICLE_VOLUMES.map((v) => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-bsm-text-muted uppercase tracking-widest mb-2">
              Ciudad principal
            </label>
            <input
              name="city"
              value={form.city}
              onChange={handleChange}
              className="w-full bg-surface border border-bsm-border px-4 py-3 text-sm text-bsm-text-primary focus:outline-none focus:border-gold transition-colors"
              placeholder="Madrid, Barcelona…"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs text-bsm-text-muted uppercase tracking-widest mb-2">
            Mensaje (opcional)
          </label>
          <textarea
            name="message"
            value={form.message}
            onChange={handleChange}
            rows={3}
            className="w-full bg-surface border border-bsm-border px-4 py-3 text-sm text-bsm-text-primary focus:outline-none focus:border-gold transition-colors resize-none"
            placeholder="Cuéntanos algo sobre tu negocio o lo que necesitas"
          />
        </div>

        {error && (
          <p className="text-sm text-red-400">{error}</p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="btn-gold w-full justify-center"
        >
          {pending ? 'Enviando…' : 'Enviar solicitud'}
        </button>

        <p className="text-xs text-bsm-text-muted text-center">
          Al enviar aceptas nuestra{' '}
          <Link href="/legal/privacidad" className="text-gold hover:underline">política de privacidad</Link>.
        </p>
      </form>
    </div>
  )
}

export default function SolicitarAccesoPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-screen-sm mx-auto px-6 pt-40 pb-24 text-center">
          <p className="text-sm text-bsm-text-muted">Cargando…</p>
        </div>
      }
    >
      <SolicitarAccesoForm />
    </Suspense>
  )
}
