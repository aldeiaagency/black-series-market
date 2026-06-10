'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { X, ChevronDown, ChevronUp } from 'lucide-react'
import { getStoredConsent, saveConsent, CONSENT_VERSION } from '@/lib/cookies/consent'

type View = 'banner' | 'settings' | 'hidden'

// Toggle component ─────────────────────────────────────────────────────────────
function Toggle({
  checked,
  onChange,
  disabled = false,
  id,
}: {
  checked: boolean
  onChange?: (v: boolean) => void
  disabled?: boolean
  id: string
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-labelledby={`${id}-label`}
      disabled={disabled}
      onClick={() => !disabled && onChange?.(!checked)}
      className={`relative inline-flex h-5 w-9 flex-shrink-0 rounded-full border-2 transition-colors duration-200 focus:outline-none
        ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
        ${checked ? 'bg-[#C6A64B] border-[#C6A64B]' : 'bg-[#2A2A2A] border-[#3A3A3A]'}`}
    >
      <span
        className={`pointer-events-none inline-block h-3.5 w-3.5 rounded-full bg-white shadow transform transition-transform duration-200 mt-px
          ${checked ? 'translate-x-4' : 'translate-x-0'}`}
        style={{ margin: '1px' }}
      />
    </button>
  )
}

// Category row ─────────────────────────────────────────────────────────────────
function CategoryRow({
  id,
  title,
  description,
  checked,
  onChange,
  disabled = false,
  badge,
}: {
  id: string
  title: string
  description: string
  checked: boolean
  onChange?: (v: boolean) => void
  disabled?: boolean
  badge?: string
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-4 border-b border-[#1E1E1E] last:border-0">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span id={`${id}-label`} className="text-sm font-medium text-[#E8E4DA]">{title}</span>
          {badge && (
            <span className="text-[9px] tracking-widest uppercase text-[#C6A64B] border border-[#C6A64B]/40 px-1.5 py-0.5 leading-none">
              {badge}
            </span>
          )}
        </div>
        <p className="text-xs text-[#8A8A8A] leading-relaxed">{description}</p>
      </div>
      <div className="flex-shrink-0 pt-0.5">
        <Toggle id={id} checked={checked} onChange={onChange} disabled={disabled} />
      </div>
    </div>
  )
}

// Main component ───────────────────────────────────────────────────────────────
export default function CookieConsentBanner() {
  const [view, setView]           = useState<View | null>(null)
  const [analytics, setAnalytics] = useState(false)
  const [marketing, setMarketing] = useState(false)

  // Hydration-safe mount
  useEffect(() => {
    const stored = getStoredConsent()
    if (!stored) {
      setView('banner')
    } else {
      setAnalytics(stored.analytics)
      setMarketing(stored.marketing)
      setView('hidden')
    }

    // Allow footer/other elements to open settings panel
    const handler = () => {
      const stored = getStoredConsent()
      if (stored) {
        setAnalytics(stored.analytics)
        setMarketing(stored.marketing)
      }
      setView('settings')
    }
    window.addEventListener('open-cookie-settings', handler)
    return () => window.removeEventListener('open-cookie-settings', handler)
  }, [])

  function acceptAll() {
    saveConsent(true, true)
    setView('hidden')
  }

  function rejectAll() {
    saveConsent(false, false)
    setView('hidden')
  }

  function saveSettings() {
    saveConsent(analytics, marketing)
    setView('hidden')
  }

  // Not yet mounted — avoid flash
  if (view === null || view === 'hidden') return null

  return (
    <>
      {/* ── Settings modal ────────────────────────────────────────────────── */}
      {view === 'settings' && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-[#0A0A0A]/80 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="Configuración de cookies"
        >
          <div className="w-full max-w-lg bg-[#0D0D0D] border border-[#1E1E1E] shadow-[0_24px_80px_rgba(0,0,0,0.8)]">

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#1A1A1A]">
              <h2 className="text-sm font-medium text-[#E8E4DA] tracking-wide">Configuración de cookies</h2>
              <button
                onClick={() => setView(getStoredConsent() ? 'hidden' : 'banner')}
                className="text-[#808080] hover:text-[#C9C9C9] transition-colors"
                aria-label="Cerrar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-4 max-h-[60vh] overflow-y-auto">
              <p className="text-xs text-[#8A8A8A] leading-relaxed mb-5">
                Selecciona qué cookies permites. Las técnicas son siempre necesarias para el funcionamiento de la web.
              </p>

              <CategoryRow
                id="necessary"
                title="Técnicas necesarias"
                description="Necesarias para el funcionamiento básico de la web, seguridad, sesión y preferencias. No pueden desactivarse."
                checked={true}
                disabled={true}
                badge="Siempre activas"
              />
              <CategoryRow
                id="analytics"
                title="Analítica"
                description="Nos ayudan a entender el uso de la web y mejorar la experiencia. No incluyen datos personales identificables."
                checked={analytics}
                onChange={setAnalytics}
              />
              <CategoryRow
                id="marketing"
                title="Marketing"
                description="Permitirían medir campañas o mostrar contenido personalizado. Actualmente no están en uso."
                checked={marketing}
                onChange={setMarketing}
              />
            </div>

            {/* Footer */}
            <div className="px-6 py-5 border-t border-[#1A1A1A] flex flex-col sm:flex-row gap-3">
              <button
                onClick={rejectAll}
                className="flex-1 px-4 py-2.5 text-sm border border-[#2A2A2A] text-[#9A9A9A] hover:border-[#3A3A3A] hover:text-[#C9C9C9] transition-colors"
              >
                Rechazar todo
              </button>
              <button
                onClick={saveSettings}
                className="flex-1 px-4 py-2.5 text-sm border border-[#C6A64B]/40 text-[#C6A64B] hover:bg-[#C6A64B]/10 transition-colors"
              >
                Guardar configuración
              </button>
              <button
                onClick={acceptAll}
                className="flex-1 px-4 py-2.5 text-sm bg-[#C6A64B] text-[#0A0A0A] font-medium hover:bg-[#D4B560] transition-colors"
              >
                Aceptar todo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Banner (primera capa) ──────────────────────────────────────────── */}
      {view === 'banner' && (
        <div
          className="fixed bottom-0 left-0 right-0 z-50 bg-[#0E0E0E] border-t border-[#1E1E1E] shadow-[0_-8px_32px_rgba(0,0,0,0.6)]"
          role="region"
          aria-label="Aviso de cookies"
        >
          <div className="max-w-screen-2xl mx-auto px-6 lg:px-12 py-5">
            <div className="flex flex-col md:flex-row md:items-center gap-5">

              {/* Text */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#E8E4DA] mb-1.5">Cookies</p>
                <p className="text-xs text-[#8A8A8A] leading-relaxed">
                  Utilizamos cookies técnicas necesarias para que la web funcione. Con tu permiso, también podemos
                  usar cookies de análisis para entender cómo se utiliza Black Label Market y mejorar el servicio.{' '}
                  <Link
                    href="/legal/cookies"
                    className="text-[#C6A64B] hover:text-[#D4B560] transition-colors underline-offset-2 hover:underline"
                  >
                    Política de cookies
                  </Link>
                </p>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap items-center gap-2.5 flex-shrink-0">
                <button
                  onClick={rejectAll}
                  className="px-4 py-2 text-sm border border-[#2A2A2A] text-[#9A9A9A]
                    hover:border-[#3A3A3A] hover:text-[#C9C9C9] transition-colors whitespace-nowrap"
                >
                  Rechazar
                </button>
                <button
                  onClick={() => setView('settings')}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm border border-[#2A2A2A] text-[#9A9A9A]
                    hover:border-[#C6A64B]/40 hover:text-[#C6A64B] transition-colors whitespace-nowrap"
                >
                  Configurar
                  <ChevronUp className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={acceptAll}
                  className="px-5 py-2 text-sm bg-[#C6A64B] text-[#0A0A0A] font-medium
                    hover:bg-[#D4B560] transition-colors whitespace-nowrap"
                >
                  Aceptar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
