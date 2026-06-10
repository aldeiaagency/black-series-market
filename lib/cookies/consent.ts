// Cookie consent configuration and types
// Update CONSENT_VERSION when cookie policy changes — banner will re-appear for all users

export const CONSENT_VERSION = '1.0'
export const CONSENT_KEY     = 'black_label_cookie_consent'

export interface CookieConsent {
  necessary:  true         // always true — cannot be disabled
  analytics:  boolean
  marketing:  boolean
  timestamp:  string
  version:    string
}

export function getStoredConsent(): CookieConsent | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(CONSENT_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as CookieConsent
    if (parsed.version !== CONSENT_VERSION) return null
    return parsed
  } catch {
    return null
  }
}

export function saveConsent(analytics: boolean, marketing: boolean): CookieConsent {
  const consent: CookieConsent = {
    necessary: true,
    analytics,
    marketing,
    timestamp: new Date().toISOString(),
    version:   CONSENT_VERSION,
  }
  localStorage.setItem(CONSENT_KEY, JSON.stringify(consent))
  // Notify GTM Consent Mode v2 in real time
  if (typeof window !== 'undefined' && typeof (window as any).gtag === 'function') {
    ;(window as any).gtag('consent', 'update', {
      analytics_storage:       analytics ? 'granted' : 'denied',
      ad_storage:              marketing ? 'granted' : 'denied',
      ad_personalization:      marketing ? 'granted' : 'denied',
      personalization_storage: marketing ? 'granted' : 'denied',
    })
  }
  return consent
}

export function hasConsent(category: 'analytics' | 'marketing'): boolean {
  const stored = getStoredConsent()
  if (!stored) return false
  return stored[category] === true
}
