'use client'

import { useState } from 'react'
import { Mail, MessageCircle } from 'lucide-react'

// Botón de WhatsApp solo se muestra si hay número dado de alta (agency/comercial/whatsapp_business_diseno.md).
// Prellena el texto para que el chatbot enrute a la Intención 2 (derivación market) sin disparar el pitch de agencia.
const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || ''
const WHATSAPP_URL = WHATSAPP_NUMBER
  ? `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Vengo desde Black Label Market')}`
  : null

export default function ContactoPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function update(key: string, value: string) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(
          data.error === 'rate_limited'
            ? 'Demasiados intentos. Espera unos minutos antes de volver a escribirnos.'
            : 'No hemos podido enviar tu mensaje. Escríbenos directamente a hola@blacklabelmarket.es.'
        )
        setLoading(false)
        return
      }
      setSent(true)
    } catch {
      setError('No hemos podido enviar tu mensaje. Escríbenos directamente a hola@blacklabelmarket.es.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-screen-xl mx-auto px-6 lg:px-12 pt-28 pb-20">
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-px w-8 bg-gold" />
          <span className="text-xs text-gold tracking-widest uppercase">Contacto</span>
        </div>
        <h1 className="section-title mb-3">Hablemos</h1>
        <p className="text-bsm-text-muted max-w-lg">
          ¿Tienes dudas sobre el marketplace, tu cuenta o cómo trabajamos? Escríbenos y te
          respondemos en menos de 24 horas laborables. Si lo que buscas es acceso profesional
          para tu showroom, empieza mejor por{' '}
          <a href="/profesionales/solicitar-acceso" className="text-gold hover:text-gold-light transition-colors">
            solicitar una valoración
          </a>.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Info */}
        <div className="space-y-8">
          {[
            { icon: Mail, label: 'Email', value: 'hola@blacklabelmarket.es', href: 'mailto:hola@blacklabelmarket.es' },
            ...(WHATSAPP_URL ? [{ icon: MessageCircle, label: 'WhatsApp', value: 'Respuesta inmediata', href: WHATSAPP_URL }] : []),
          ].map(({ icon: Icon, label, value, href }) => (
            <div key={label}>
              <div className="flex items-center gap-3 mb-2">
                <Icon className="w-4 h-4 text-gold" />
                <span className="text-xs uppercase tracking-widest text-bsm-text-muted">{label}</span>
              </div>
              {href ? (
                <a
                  href={href}
                  {...(href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  className="text-bsm-text-primary hover:text-gold transition-colors"
                >
                  {value}
                </a>
              ) : (
                <p className="text-bsm-text-primary whitespace-pre-line">{value}</p>
              )}
            </div>
          ))}

          <div className="pt-6 border-t border-bsm-border">
            <p className="text-xs text-bsm-text-muted uppercase tracking-widest mb-3">Operado por</p>
            <a
              href="https://blackseriesagency.es"
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="text-bsm-text-primary font-medium hover:text-gold transition-colors"
            >
              Black Series Agency
            </a>
            <p className="text-sm text-bsm-text-muted">Agencia de IA y Revenue Ops para automoción premium</p>
          </div>
        </div>

        {/* Form */}
        <div className="lg:col-span-2">
          {sent ? (
            <div className="bg-surface border border-bsm-border p-12 text-center">
              <div className="w-12 h-12 border border-gold/30 flex items-center justify-center mx-auto mb-4">
                <Mail className="w-6 h-6 text-gold" />
              </div>
              <h2 className="font-display text-2xl font-light mb-2">Mensaje recibido</h2>
              <p className="text-bsm-text-muted mb-4">Nos pondremos en contacto contigo en breve.</p>
              <p className="text-xs text-bsm-text-muted">
                Si prefieres contacto inmediato, escríbenos a{' '}
                <a href="mailto:hola@blacklabelmarket.es" className="text-gold">hola@blacklabelmarket.es</a>
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-surface border border-bsm-border p-8 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="label-base" htmlFor="contacto-name">Nombre</label>
                  <input id="contacto-name" value={form.name} onChange={(e) => update('name', e.target.value)} placeholder="Tu nombre" className="input-base" autoComplete="name" required />
                </div>
                <div>
                  <label className="label-base" htmlFor="contacto-email">Email</label>
                  <input id="contacto-email" type="email" value={form.email} onChange={(e) => update('email', e.target.value)} placeholder="tu@email.com" className="input-base" autoComplete="email" required />
                </div>
              </div>
              <div>
                <label className="label-base" htmlFor="contacto-subject">Asunto</label>
                <select id="contacto-subject" value={form.subject} onChange={(e) => update('subject', e.target.value)} className="select-base" required>
                  <option value="">Seleccionar...</option>
                  <option value="suscripcion">Gestión de mi suscripción</option>
                  <option value="soporte">Soporte técnico</option>
                  <option value="editorial">Revisión editorial de vehículo</option>
                  <option value="facturacion">Facturación</option>
                  <option value="otro">Otro</option>
                </select>
              </div>
              <div>
                <label className="label-base" htmlFor="contacto-message">Mensaje</label>
                <textarea
                  id="contacto-message"
                  value={form.message}
                  onChange={(e) => update('message', e.target.value)}
                  rows={6}
                  placeholder="Cuéntanos en qué podemos ayudarte..."
                  className="input-base resize-none"
                  required
                />
              </div>
              {error && (
                <p role="alert" className="text-sm text-red-400 bg-red-400/5 border border-red-400/20 px-4 py-3">
                  {error}
                </p>
              )}
              <button type="submit" disabled={loading} className="btn-gold">
                {loading ? 'Enviando...' : 'Enviar mensaje'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
