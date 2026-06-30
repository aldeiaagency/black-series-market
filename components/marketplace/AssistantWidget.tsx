'use client'

import { useState, useEffect, useRef } from 'react'
import { MessageSquare, Send, Loader2, Info, Calendar } from 'lucide-react'
import QualifiedLeadForm from './QualifiedLeadForm'
import AppointmentBooking from './AppointmentBooking'

interface Msg { role: 'assistant' | 'user'; text: string }
type Mode = 'init' | 'consent' | 'chat' | 'classic' | 'done' | 'booking'

interface Props {
  vehicleId:      string
  dealerId:       string
  vehicleTitle:   string
  dealerWhatsapp?: string | null
  /** Vista previa: muestra la UI del agente con un guion local, sin backend de IA. */
  preview?:       boolean
}

// Guion de cualificación usado solo en modo preview (sin IA conectada).
const PREVIEW_SCRIPT = [
  'Gracias por tu interés. Para orientarte mejor: ¿lo buscas para uso personal o como inversión, y prefieres pago al contado o financiación?',
  'Perfecto. Una última cosa: ¿en qué plazo te gustaría cerrarlo? Así el showroom prioriza tu consulta.',
]

export default function AssistantWidget({ vehicleId, dealerId, vehicleTitle, dealerWhatsapp, preview = false }: Props) {
  const [mode,       setMode]       = useState<Mode>('init')
  const [sessionId,  setSessionId]  = useState<string | null>(null)
  const [waNumber,   setWaNumber]   = useState<string | null>(null)
  const [messages,   setMessages]   = useState<Msg[]>([])
  const [input,      setInput]      = useState('')
  const [loading,    setLoading]    = useState(false)
  const [consent,    setConsent]    = useState(false)
  const [bookingEnabled, setBookingEnabled] = useState(false)
  const [previewTurn, setPreviewTurn] = useState(0)
  const endRef = useRef<HTMLDivElement>(null)

  // Open session on mount
  useEffect(() => {
    // Modo preview: no llamamos al backend. Mostramos la UI del agente con guion local.
    if (preview) {
      setSessionId('preview')
      setWaNumber(dealerWhatsapp ?? null)
      setMessages([{
        role: 'assistant',
        text: `¡Hola! Soy el asistente de este showroom. Puedo resolver tus dudas sobre el ${vehicleTitle} y preparar tu consulta para el vendedor. ¿Qué te gustaría saber?`,
      }])
      setMode('consent')
      return
    }

    let cancelled = false
    ;(async () => {
      try {
        const res  = await fetch('/api/assistant/session', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ vehicle_id: vehicleId }),
        })
        if (cancelled) return
        const data = await res.json()
        if (data.mode === 'assistant') {
          setSessionId(data.session_id)
          setWaNumber(data.dealer_whatsapp ?? dealerWhatsapp ?? null)
          setBookingEnabled(!!data.booking_enabled)
          if (data.opening_message) setMessages([{ role: 'assistant', text: data.opening_message }])
          setMode('consent')
        } else {
          setMode('classic')
        }
      } catch {
        if (!cancelled) setMode('classic')
      }
    })()
    return () => { cancelled = true }
  }, [vehicleId, dealerWhatsapp, preview, vehicleTitle])

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  async function send(text?: string) {
    const msg = (text ?? input).trim()
    if (!msg || !sessionId || loading) return
    setInput('')
    setMessages(prev => [...prev, { role: 'user', text: msg }])

    // Modo preview: respondemos con el guion local; al agotarlo, pasamos al formulario
    // para capturar el lead de verdad (el agente real lo hará en la conversación).
    if (preview) {
      setLoading(true)
      setTimeout(() => {
        if (previewTurn < PREVIEW_SCRIPT.length) {
          setMessages(prev => [...prev, { role: 'assistant', text: PREVIEW_SCRIPT[previewTurn] }])
          setPreviewTurn(t => t + 1)
          setLoading(false)
        } else {
          setMessages(prev => [...prev, {
            role: 'assistant',
            text: 'Genial, ya tengo lo necesario. Déjame tus datos de contacto y el vendedor te responde enseguida.',
          }])
          setLoading(false)
          setTimeout(() => setMode('classic'), 900)
        }
      }, 650)
      return
    }

    setLoading(true)
    try {
      const res  = await fetch('/api/assistant/message', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ session_id: sessionId, dealer_id: dealerId, message: msg }),
      })
      const data = await res.json()

      if (data.fallback || data.type === 'degradation') { setMode('classic'); return }

      if (data.type === 'whatsapp_handoff') {
        const wa = waNumber || dealerWhatsapp
        if (wa) {
          const txt = encodeURIComponent(`Hola, os escribo por el ${vehicleTitle}, ref ${vehicleId}`)
          window.open(`https://wa.me/${wa.replace(/\D/g, '')}?text=${txt}`, '_blank')
        }
        setMode('done')
        return
      }

      if (data.type === 'completed' || data.type === 'form_fallback') {
        if (data.message) setMessages(prev => [...prev, { role: 'assistant', text: data.message }])
        setTimeout(() => setMode('done'), 800)
        return
      }

      if (data.message) setMessages(prev => [...prev, { role: 'assistant', text: data.message }])
    } catch {
      setMode('classic')
    } finally {
      setLoading(false)
    }
  }

  // ── Loading ───────────────────────────────────────────────────────────────
  if (mode === 'init') return (
    <div className="flex items-center justify-center py-8">
      <Loader2 className="w-4 h-4 animate-spin text-bsm-text-muted" />
    </div>
  )

  // ── Fallback al formulario clásico ────────────────────────────────────────
  if (mode === 'classic') return (
    <QualifiedLeadForm vehicleId={vehicleId} dealerId={dealerId} vehicleTitle={vehicleTitle} />
  )

  // ── Completado ────────────────────────────────────────────────────────────
  if (mode === 'done') return (
    <div className="flex flex-col items-center text-center py-6">
      <div className="w-10 h-10 bg-emerald-400/10 border border-emerald-400/30 flex items-center justify-center mb-3">
        <MessageSquare className="w-5 h-5 text-emerald-400" />
      </div>
      <p className="font-medium text-bsm-text-primary mb-1">¡Gracias!</p>
      <p className="text-xs text-bsm-text-muted max-w-[240px]">
        El vendedor recibirá tu consulta con toda la información y se pondrá en contacto contigo.
      </p>
    </div>
  )

  // ── Consentimiento RGPD ───────────────────────────────────────────────────
  if (mode === 'consent') return (
    <div className="space-y-4">
      <div className="flex items-start gap-3 p-4 bg-[#0A0A0A] border border-[#1A1A1A]">
        <MessageSquare className="w-4 h-4 text-gold flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm text-bsm-text-primary font-medium mb-1">Asistente de consulta</p>
          <p className="text-xs text-bsm-text-muted leading-relaxed">
            Puedo ayudarte con cualquier pregunta sobre el {vehicleTitle}. Al final de la consulta
            te pediremos tus datos de contacto para que el vendedor pueda responderte.
          </p>
        </div>
      </div>

      <label className="flex items-start gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={consent}
          onChange={e => setConsent(e.target.checked)}
          className="mt-0.5 accent-[#C6A64B]"
        />
        <span className="text-xs text-bsm-text-muted leading-relaxed">
          Acepto que mis datos sean compartidos con el vendedor para gestionar mi consulta.{' '}
          <a href="/legal/privacidad" className="text-gold hover:underline">Política de privacidad</a>.
        </span>
      </label>

      <button
        onClick={() => consent && setMode('chat')}
        disabled={!consent}
        className="btn-gold w-full justify-center disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Iniciar consulta
      </button>

      <button
        type="button"
        onClick={() => setMode('classic')}
        className="w-full text-center text-xs text-bsm-text-muted hover:text-bsm-text-primary transition-colors py-1"
      >
        Prefiero escribir mi mensaje →
      </button>
    </div>
  )

  // ── Reserva de cita (Elite/Grupo) ─────────────────────────────────────────
  if (mode === 'booking') return (
    <AppointmentBooking
      dealerId={dealerId}
      vehicleId={vehicleId}
      vehicleTitle={vehicleTitle}
      sessionId={sessionId}
      onBack={() => setMode('chat')}
    />
  )

  // ── Chat ──────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-3">
      {bookingEnabled && (
        <button
          type="button"
          onClick={() => setMode('booking')}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs text-gold border border-gold/30 bg-gold/5 hover:bg-gold/10 transition-colors"
        >
          <Calendar className="w-3.5 h-3.5" /> Reservar visita
        </button>
      )}

      {/* Messages */}
      <div
        className="space-y-2.5 max-h-60 overflow-y-auto pr-1"
        role="log"
        aria-label="Conversación con el asistente"
        aria-live="polite"
      >
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] px-3 py-2 text-sm leading-relaxed ${
              m.role === 'user'
                ? 'bg-gold/10 border border-gold/20 text-bsm-text-primary'
                : 'bg-[#0D0D0D] border border-[#1A1A1A] text-bsm-text-secondary'
            }`}>
              {m.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-[#0D0D0D] border border-[#1A1A1A] px-3 py-2.5">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-bsm-text-muted" />
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
          placeholder="Escribe tu mensaje…"
          className="input-base flex-1 text-sm"
          disabled={loading}
          aria-label="Mensaje al asistente"
        />
        <button
          onClick={() => send()}
          disabled={!input.trim() || loading}
          aria-label="Enviar mensaje"
          className="flex-shrink-0 w-10 h-10 bg-gold/10 border border-gold/30 flex items-center justify-center hover:bg-gold/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Send className="w-4 h-4 text-gold" />
        </button>
      </div>

      {/* Privacy note + escape hatch */}
      <div className="flex items-start gap-1.5">
        <Info className="w-3 h-3 text-bsm-text-muted flex-shrink-0 mt-0.5" />
        <p className="text-[10px] text-bsm-text-muted leading-relaxed">
          Solo los datos que compartas voluntariamente llegarán al vendedor.
        </p>
      </div>
      <button
        type="button"
        onClick={() => setMode('classic')}
        className="w-full text-center text-xs text-bsm-text-muted hover:text-bsm-text-primary transition-colors py-1"
      >
        Prefiero escribir mi mensaje →
      </button>
    </div>
  )
}
