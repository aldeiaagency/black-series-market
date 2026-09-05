'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CURRENT_PROFESSIONAL_TERMS_VERSION } from '@/lib/legal'

const PORTALES = ['Coches.net', 'Mobile.de', 'Autoscout24', 'Wallapop', 'Motorflash', 'Otros']

export default function SolicitarAccesoPage() {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    city: '',
    location_region: '',
    website: '',
    google_business_url: '',
    instagram_url: '',
    portales: [] as string[],
    portal_url: '',
    volume: '',
    message: '',
  })
  const [termsAccepted, setTermsAccepted] = useState(false)
  // Corrección 2026-09-04 (hallazgo Codex, simulación E2E alta online): antes este único checkbox
  // solo mencionaba la política de privacidad, pero el sistema trataba su aceptación como si
  // cubriera también las Condiciones para Profesionales (approveApplication copiaba
  // terms_accepted/terms_version al dealer como aceptación real). Ahora el checkbox cubre
  // explícitamente ambos documentos, y el registro en comunicaciones comerciales — que antes se
  // asumía sin pedirlo — pasa a ser un opt-in aparte, no marcado por defecto.
  const [marketingOptIn, setMarketingOptIn] = useState(false)

  function update(key: string, value: string) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  function togglePortal(p: string) {
    setForm((f) => ({
      ...f,
      portales: f.portales.includes(p) ? f.portales.filter((x) => x !== p) : [...f.portales, p],
    }))
  }

  function goToStep2(e: React.FormEvent) {
    e.preventDefault()
    setStep(2)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    // Corrección 2026-09-04 (hallazgo Codex, simulación E2E alta online): un showroom que solo
    // vende en portales (Coches.net, Autoscout24...) sin web/GBP/Instagram propios se quedaba sin
    // forma de enviar la solicitud — portal_url/portales no contaban como presencia pública
    // aunque el propio formulario los pide un paso antes. Segmento real del ICP (compraventas sin
    // web propia), no un caso de borde.
    if (!form.website && !form.google_business_url && !form.instagram_url && form.portales.length === 0) {
      setError('Necesitamos al menos una presencia pública (web, Google Business, Instagram o un portal donde publiques) para poder valorar el showroom.')
      return
    }
    if (!termsAccepted) {
      // Corrección 2026-09-05 (hallazgo Codex): el mensaje se quedó desactualizado tras ampliar
      // el checkbox a privacidad + condiciones profesionales — seguía mencionando solo la primera.
      setError('Debes aceptar la Política de Privacidad y las Condiciones para Profesionales para continuar.')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/showroom-applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name:    form.name,
          email:   form.email,
          phone:   form.phone,
          company: form.company,
          city:    form.city,
          location_region: form.location_region || undefined,
          website: form.website || undefined,
          google_business_url: form.google_business_url || undefined,
          instagram_url: form.instagram_url || undefined,
          portales: form.portales.length ? form.portales : undefined,
          portal_url: form.portal_url || undefined,
          volume:  form.volume || undefined,
          message: form.message || undefined,
          terms_accepted: true,
          terms_version: CURRENT_PROFESSIONAL_TERMS_VERSION,
          marketing_opt_in: marketingOptIn,
        }),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        setError(
          body?.error === 'missing_public_presence'
            ? 'Necesitamos al menos una presencia pública (web, Google Business, Instagram o un portal donde publiques) para poder valorar el showroom.'
            : 'No hemos podido enviar la solicitud. Escríbenos a hola@blacklabelmarket.es y lo resolvemos directamente.'
        )
        setLoading(false)
        return
      }

      router.push(`/solicitud-enviada?tipo=showroom`)
    } catch {
      setError('No hemos podido enviar la solicitud. Escríbenos a hola@blacklabelmarket.es y lo resolvemos directamente.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-obsidian px-6 py-12 pt-28">
      <div className="w-full max-w-lg mx-auto">

        {/* Breadcrumb */}
        <nav aria-label="breadcrumb" className="mb-8">
          <ol className="flex items-center gap-1.5 text-xs text-bsm-text-muted">
            <li><Link href="/" className="hover:text-gold transition-colors">Inicio</Link></li>
            <li className="text-[#3A3A3A]" aria-hidden="true">/</li>
            <li><Link href="/profesionales" className="hover:text-gold transition-colors">Para profesionales</Link></li>
            <li className="text-[#3A3A3A]" aria-hidden="true">/</li>
            <li className="text-bsm-text-secondary">Solicitar valoración</li>
          </ol>
        </nav>

        {/* Steps */}
        <div className="flex items-center gap-2 mb-8">
          {[1, 2].map((s) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium transition-colors
                ${step >= s ? 'bg-gold text-obsidian' : 'bg-surface border border-bsm-border text-bsm-text-muted'}`}>
                {s}
              </div>
              <span className={`text-xs ${step >= s ? 'text-bsm-text-primary' : 'text-bsm-text-muted'}`}>
                {s === 1 ? 'Contacto' : 'Tu showroom'}
              </span>
              {s < 2 && <div className={`flex-1 h-px ${step > s ? 'bg-gold' : 'bg-bsm-border'}`} />}
            </div>
          ))}
        </div>

        <div className="bg-surface border border-bsm-border p-8">

          {/* ── Step 1 ── */}
          {step === 1 && (
            <>
              <h1 className="font-display text-2xl font-light mb-1">Solicitar valoración</h1>
              <p className="text-sm text-bsm-text-muted mb-8">
                Cuéntanos quién eres. En el siguiente paso te pedimos algo más sobre tu showroom.
              </p>

              <form onSubmit={goToStep2} className="space-y-4">
                <div>
                  <label className="label-base" htmlFor="name">Nombre completo</label>
                  <input
                    id="name"
                    value={form.name}
                    onChange={(e) => update('name', e.target.value)}
                    placeholder="Tu nombre y apellidos"
                    className="input-base"
                    autoComplete="name"
                    required
                  />
                </div>
                <div>
                  <label className="label-base" htmlFor="email">Email</label>
                  <input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={(e) => update('email', e.target.value)}
                    placeholder="tu@empresa.com"
                    className="input-base"
                    autoComplete="email"
                    required
                  />
                </div>
                <div>
                  <label className="label-base" htmlFor="phone">Teléfono</label>
                  <input
                    id="phone"
                    type="tel"
                    value={form.phone}
                    onChange={(e) => update('phone', e.target.value)}
                    placeholder="+34 600 000 000"
                    className="input-base"
                    autoComplete="tel"
                    required
                  />
                </div>
                <div>
                  <label className="label-base" htmlFor="company">Showroom / empresa</label>
                  <input
                    id="company"
                    value={form.company}
                    onChange={(e) => update('company', e.target.value)}
                    placeholder="Nombre del concesionario o especialista"
                    className="input-base"
                    required
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="label-base" htmlFor="city">Ciudad</label>
                    <input
                      id="city"
                      value={form.city}
                      onChange={(e) => update('city', e.target.value)}
                      placeholder="Madrid, Barcelona…"
                      className="input-base"
                      required
                    />
                  </div>
                  <div>
                    <label className="label-base" htmlFor="location_region">Provincia (opcional)</label>
                    <input
                      id="location_region"
                      value={form.location_region}
                      onChange={(e) => update('location_region', e.target.value)}
                      placeholder="Comunidad o provincia"
                      className="input-base"
                    />
                  </div>
                </div>

                <button type="submit" className="btn-gold w-full justify-center mt-2">
                  Continuar
                </button>
              </form>
            </>
          )}

          {/* ── Step 2 ── */}
          {step === 2 && (
            <>
              <h1 className="font-display text-2xl font-light mb-1">Tu showroom</h1>
              <p className="text-sm text-bsm-text-muted mb-8">
                Con esto valoramos si tu showroom encaja con los criterios del market — reputación,
                especialización y forma de presentar el stock.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="label-base" htmlFor="website">Web propia</label>
                  <input
                    id="website"
                    type="url"
                    value={form.website}
                    onChange={(e) => update('website', e.target.value)}
                    placeholder="https://tuweb.com"
                    className="input-base"
                  />
                </div>
                <div>
                  <label className="label-base" htmlFor="google_business_url">Perfil de Google Business</label>
                  <input
                    id="google_business_url"
                    type="url"
                    value={form.google_business_url}
                    onChange={(e) => update('google_business_url', e.target.value)}
                    placeholder="https://g.page/tu-showroom"
                    className="input-base"
                  />
                </div>
                <div>
                  <label className="label-base" htmlFor="instagram_url">Instagram</label>
                  <input
                    id="instagram_url"
                    type="url"
                    value={form.instagram_url}
                    onChange={(e) => update('instagram_url', e.target.value)}
                    placeholder="https://instagram.com/tushowroom"
                    className="input-base"
                  />
                </div>
                <p className="text-[11px] text-bsm-text-muted -mt-2">
                  Con al menos una de las tres, o con un portal donde ya publiques (lo indicas justo debajo), nos basta para empezar a valorar el showroom.
                </p>

                <div>
                  <label className="label-base">¿Publicas ya en otros portales?</label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {PORTALES.map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => togglePortal(p)}
                        className={`px-3 py-1.5 text-xs border transition-colors
                          ${form.portales.includes(p)
                            ? 'border-gold text-gold bg-gold/10'
                            : 'border-bsm-border text-bsm-text-muted hover:border-gold/40'}`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                {form.portales.length > 0 && (
                  <div>
                    <label className="label-base" htmlFor="portal_url">Enlace a uno de tus anuncios (opcional)</label>
                    <input
                      id="portal_url"
                      type="url"
                      value={form.portal_url}
                      onChange={(e) => update('portal_url', e.target.value)}
                      placeholder="https://..."
                      className="input-base"
                    />
                  </div>
                )}

                <div>
                  <label className="label-base" htmlFor="volume">Volumen aproximado de stock</label>
                  <select
                    id="volume"
                    value={form.volume}
                    onChange={(e) => update('volume', e.target.value)}
                    className="input-base"
                  >
                    <option value="">Seleccionar</option>
                    <option value="Menos de 15 unidades activas">Menos de 15 unidades</option>
                    <option value="15-50 unidades activas">15-50 unidades</option>
                    <option value="51-100 unidades activas">51-100 unidades</option>
                    <option value="Más de 100 unidades activas">Más de 100 unidades</option>
                  </select>
                </div>

                <div>
                  <label className="label-base" htmlFor="message">Algo más que debamos saber (opcional)</label>
                  <textarea
                    id="message"
                    value={form.message}
                    onChange={(e) => update('message', e.target.value)}
                    rows={3}
                    className="input-base resize-none"
                    placeholder="Especialización, marcas con las que trabajas, contexto del negocio…"
                  />
                </div>

                {error && <p className="text-sm text-red-400">{error}</p>}

                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    required
                    className="mt-0.5 accent-gold w-4 h-4 shrink-0"
                  />
                  <span className="text-xs text-bsm-text-muted leading-relaxed">
                    He leído la{' '}
                    <Link href="/legal/privacidad" target="_blank" className="text-gold hover:underline">
                      política de privacidad
                    </Link>
                    {' '}y las{' '}
                    <Link href="/legal/condiciones-profesionales" target="_blank" className="text-gold hover:underline">
                      condiciones para profesionales
                    </Link>
                    , y autorizo el uso de estos datos para valorar la solicitud y contactar conmigo.
                  </span>
                </label>

                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={marketingOptIn}
                    onChange={(e) => setMarketingOptIn(e.target.checked)}
                    className="mt-0.5 accent-gold w-4 h-4 shrink-0"
                  />
                  <span className="text-xs text-bsm-text-muted leading-relaxed">
                    Además, quiero recibir novedades y contenido de Black Label Market por email (opcional — puedes darte de baja cuando quieras).
                  </span>
                </label>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="btn-outline px-5"
                  >
                    Atrás
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !termsAccepted}
                    className="btn-gold flex-1 justify-center"
                  >
                    {loading ? 'Enviando…' : 'Enviar para valoración'}
                  </button>
                </div>
              </form>
            </>
          )}

        </div>

        <p className="text-[11px] text-bsm-text-muted text-center mt-6 leading-relaxed">
          Enviar esta solicitud no crea una cuenta ni inicia el alta. Revisamos la reputación, la
          presencia profesional y el encaje del catálogo antes de dar el siguiente paso.
        </p>
      </div>
    </div>
  )
}
