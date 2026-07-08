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

  function update(key: string, value: string) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    // In production: call an API route that sends via Resend/Mailgun
    await new Promise((r) => setTimeout(r, 1000))
    setLoading(false)
    setSent(true)
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
          ¿Tienes dudas sobre el marketplace o quieres hablar sobre una suscripción?
          Responderemos en menos de 24 horas laborables.
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
              rel="noopener noreferrer"
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
              <h2 className="font-display text-2xl font-light mb-2">Solicitud recibida</h2>
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
                  <label className="label-base">Nombre</label>
                  <input value={form.name} onChange={(e) => update('name', e.target.value)} placeholder="Tu nombre" className="input-base" required />
                </div>
                <div>
                  <label className="label-base">Email</label>
                  <input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} placeholder="tu@email.com" className="input-base" required />
                </div>
              </div>
              <div>
                <label className="label-base">Asunto</label>
                <select value={form.subject} onChange={(e) => update('subject', e.target.value)} className="select-base" required>
                  <option value="">Seleccionar...</option>
                  <option value="suscripcion">Información sobre suscripción</option>
                  <option value="soporte">Soporte técnico</option>
                  <option value="editorial">Revisión editorial de vehículo</option>
                  <option value="facturacion">Facturación</option>
                  <option value="otro">Otro</option>
                </select>
              </div>
              <div>
                <label className="label-base">Mensaje</label>
                <textarea
                  value={form.message}
                  onChange={(e) => update('message', e.target.value)}
                  rows={6}
                  placeholder="Cuéntanos en qué podemos ayudarte..."
                  className="input-base resize-none"
                  required
                />
              </div>
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
