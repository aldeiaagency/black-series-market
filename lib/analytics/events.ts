export const CANONICAL_ANALYTICS_EVENTS = [
  'vehicle_view',
  'vehicle_contact_submit',
  'vehicle_whatsapp_click',
  'vehicle_phone_click',
  'favorite_added',
  'vehicle_request_submit',
  'search_alert_created',
  'filter_used',
  'professional_profile_view',
  'comparison_created',
  'assistant_started',
] as const

export const LEGACY_ANALYTICS_EVENTS = [
  'vehicle_saved',
  'vehicle_unsaved',
] as const

export const ACCEPTED_ANALYTICS_EVENTS = [
  ...CANONICAL_ANALYTICS_EVENTS,
  ...LEGACY_ANALYTICS_EVENTS,
] as const

export type AnalyticsEventType = (typeof ACCEPTED_ANALYTICS_EVENTS)[number]

export function isAnalyticsEventType(value: unknown): value is AnalyticsEventType {
  return typeof value === 'string'
    && (ACCEPTED_ANALYTICS_EVENTS as readonly string[]).includes(value)
}
