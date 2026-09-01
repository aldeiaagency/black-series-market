'use client'

import { CONSENT_VERSION, hasConsent } from '@/lib/cookies/consent'
import type { AnalyticsEventType } from '@/lib/analytics/events'

const ATTRIBUTION_KEY = 'blm_acquisition_context'
const SESSION_KEY = 'blm_analytics_session_id'

export interface AcquisitionContext {
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  utm_term?: string
  utm_content?: string
  referrer?: string
  landing_path?: string
  entry_point?: 'inventory' | 'vehicle_detail' | 'showroom_profile' | 'private_search' | 'other'
  cep?: string
}

interface TrackEventInput {
  event_type: AnalyticsEventType
  vehicle_id?: string | null
  dealer_id?: string | null
  metadata?: Record<string, unknown>
  keepalive?: boolean
}

function clean(value: string | null, max = 500): string | undefined {
  const trimmed = value?.trim()
  return trimmed ? trimmed.slice(0, max) : undefined
}

function entryPoint(pathname: string): AcquisitionContext['entry_point'] {
  if (/^\/(coches|motos)\/[^/]+/.test(pathname)) return 'vehicle_detail'
  if (/^\/(coches|motos)\/?$/.test(pathname)) return 'inventory'
  if (/^\/dealers\/[^/]+/.test(pathname)) return 'showroom_profile'
  if (pathname.startsWith('/vehiculos-a-la-carta')) return 'private_search'
  return 'other'
}

function contextFromPage(): AcquisitionContext {
  const params = new URLSearchParams(window.location.search)
  return {
    utm_source: clean(params.get('utm_source'), 200),
    utm_medium: clean(params.get('utm_medium'), 200),
    utm_campaign: clean(params.get('utm_campaign'), 200),
    utm_term: clean(params.get('utm_term'), 200),
    utm_content: clean(params.get('utm_content'), 200),
    referrer: clean(document.referrer, 1000),
    landing_path: clean(`${window.location.pathname}${window.location.search}`, 1000),
    entry_point: entryPoint(window.location.pathname),
    // CEP is accepted only when a campaign declares it explicitly.
    cep: clean(params.get('cep'), 200),
  }
}

export function captureAcquisitionContext(): AcquisitionContext | null {
  if (typeof window === 'undefined' || !hasConsent('analytics')) return null
  try {
    const stored = sessionStorage.getItem(ATTRIBUTION_KEY)
    if (stored) return JSON.parse(stored) as AcquisitionContext
    const context = contextFromPage()
    sessionStorage.setItem(ATTRIBUTION_KEY, JSON.stringify(context))
    return context
  } catch {
    return contextFromPage()
  }
}

export function getAcquisitionContext(): AcquisitionContext | null {
  if (typeof window === 'undefined' || !hasConsent('analytics')) return null
  try {
    const stored = sessionStorage.getItem(ATTRIBUTION_KEY)
    return stored ? JSON.parse(stored) as AcquisitionContext : captureAcquisitionContext()
  } catch {
    return captureAcquisitionContext()
  }
}

export function getAnalyticsSessionId(): string | null {
  if (typeof window === 'undefined' || !hasConsent('analytics')) return null
  try {
    const stored = sessionStorage.getItem(SESSION_KEY)
    if (stored) return stored
    const id = crypto.randomUUID()
    sessionStorage.setItem(SESSION_KEY, id)
    return id
  } catch {
    return null
  }
}

export function trackEvent(input: TrackEventInput): void {
  if (typeof window === 'undefined' || !hasConsent('analytics')) return

  fetch('/api/track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      event_type: input.event_type,
      vehicle_id: input.vehicle_id ?? null,
      dealer_id: input.dealer_id ?? null,
      session_id: getAnalyticsSessionId(),
      metadata: input.metadata ?? {},
      acquisition_context: getAcquisitionContext(),
      consent: { analytics: true, version: CONSENT_VERSION },
    }),
    keepalive: input.keepalive,
  }).catch(() => {})
}
