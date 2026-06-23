import 'server-only'
import { createHmac } from 'crypto'
import { createAdminClient } from '@/lib/supabase/server'

/**
 * Business events that can drive n8n workflows / external automations.
 * Keep this list in sync with the events documented for the automation team.
 */
export type IntegrationEventType =
  | 'lead.created'
  | 'custom_request.created'
  | 'search_alert.created'
  | 'vehicle.submitted_for_review'
  | 'vehicle.approved'
  | 'vehicle.rejected'
  | 'showroom_application.created'

interface NotifyOptions {
  entityType?: string | null
  entityId?: string | null
  dealerId?: string | null
  vehicleId?: string | null
  /** Minimal, non-sensitive summary of the entity. Avoid dumping full records. */
  payload?: Record<string, unknown>
}

// Webhook URL is read from the server environment only — never exposed to the client.
const WEBHOOK_URL =
  (process.env.N8N_WEBHOOK_URL || process.env.N8N_WEBHOOK_EVENTS || '').replace(/^﻿/, '')
const WEBHOOK_SECRET = (process.env.N8N_WEBHOOK_SECRET || '').replace(/^﻿/, '')
const POST_TIMEOUT_MS = 2500
const SHOWROOM_APPLICATION_EVENT = 'showroom_application.created'

/**
 * Records a business event and (best-effort, non-blocking) forwards it to n8n.
 *
 * Guarantees:
 *  - The event is always written to the `integration_events` outbox so it is never
 *    lost, even if no webhook is configured or the POST fails. n8n can consume the
 *    outbox later if real-time delivery isn't available.
 *  - It NEVER throws: callers can `await notifyN8n(...)` right after persisting the
 *    entity without risking the user-facing operation.
 *  - No secrets are logged and the webhook URL is never returned to the client.
 */
export async function notifyN8n(
  eventType: IntegrationEventType,
  options: NotifyOptions = {},
): Promise<void> {
  const { entityType = null, entityId = null, dealerId = null, vehicleId = null, payload = {} } = options

  const body = {
    event_type: eventType,
    entity_type: entityType,
    entity_id: entityId,
    dealer_id: dealerId,
    vehicle_id: vehicleId,
    source: 'black-label-market',
    created_at: new Date().toISOString(),
    data: payload,
  }

  // 1) Durable outbox write — always attempted.
  let outboxId: string | null = null
  try {
    const admin = createAdminClient()
    const { data } = await admin
      .from('integration_events')
      .insert({
        event_type: eventType,
        entity_type: entityType,
        entity_id: entityId,
        payload: body,
        status: 'pending',
      })
      .select('id')
      .single()
    outboxId = data?.id ?? null
  } catch {
    // Outbox unavailable (e.g. migration not yet applied). Never block the caller.
  }

  // 2) Best-effort real-time delivery to n8n.
  if (!WEBHOOK_URL) return

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), POST_TIMEOUT_MS)
    let res: Response
    try {
      res = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(WEBHOOK_SECRET ? { 'X-Webhook-Secret': WEBHOOK_SECRET } : {}),
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      })
    } finally {
      clearTimeout(timeout)
    }

    if (outboxId) {
      const admin = createAdminClient()
      if (res.ok) {
        await admin.from('integration_events')
          .update({ status: 'sent', sent_at: new Date().toISOString(), attempts: 1 })
          .eq('id', outboxId)
      } else {
        await admin.from('integration_events')
          .update({ status: 'failed', attempts: 1, last_error: `HTTP ${res.status}` })
          .eq('id', outboxId)
      }
    }
  } catch (err) {
    if (outboxId) {
      try {
        const admin = createAdminClient()
        await admin.from('integration_events')
          .update({ status: 'failed', attempts: 1, last_error: String(err).slice(0, 500) })
          .eq('id', outboxId)
      } catch {
        // swallow — delivery failure must never surface to the user
      }
    }
  }
}

export async function notifyShowroomApplicationCreated(
  payload: Record<string, unknown>,
): Promise<void> {
  let outboxId: string | null = null
  const entityId = typeof payload.dealer_application_id === 'string'
    ? payload.dealer_application_id
    : typeof payload.application_id === 'string'
      ? payload.application_id
      : null

  try {
    const admin = createAdminClient()
    const { data } = await admin
      .from('integration_events')
      .insert({
        event_type: SHOWROOM_APPLICATION_EVENT,
        entity_type: 'showroom_application',
        entity_id: entityId,
        payload,
        status: 'pending',
      })
      .select('id')
      .single()
    outboxId = data?.id ?? null
  } catch {
    // Outbox failures must not block the public showroom application flow.
  }

  const webhookUrl = (process.env.N8N_WEBHOOK_DEALER_SIGNUP || '').replace(/^﻿/, '')
  if (!webhookUrl) return

  const webhookSecret = (process.env.N8N_WEBHOOK_DEALER_SIGNUP_SECRET || '').replace(/^﻿/, '')
  if (!webhookSecret) {
    console.warn('N8N_WEBHOOK_DEALER_SIGNUP is configured but N8N_WEBHOOK_DEALER_SIGNUP_SECRET is missing. Skipping webhook.')
    return
  }

  const webhookBody = JSON.stringify(payload)
  const webhookTimestamp = new Date().toISOString()
  const webhookSignature = createHmac('sha256', webhookSecret)
    .update(webhookBody)
    .digest('hex')

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), POST_TIMEOUT_MS)
    let res: Response
    try {
      res = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-blacklabel-event': SHOWROOM_APPLICATION_EVENT,
          'x-blacklabel-timestamp': webhookTimestamp,
          'x-blacklabel-signature': `sha256=${webhookSignature}`,
        },
        body: webhookBody,
        signal: controller.signal,
      })
    } finally {
      clearTimeout(timeout)
    }

    if (outboxId) {
      const admin = createAdminClient()
      if (res.ok) {
        await admin
          .from('integration_events')
          .update({ status: 'sent', sent_at: new Date().toISOString(), attempts: 1 })
          .eq('id', outboxId)
      } else {
        await admin
          .from('integration_events')
          .update({ status: 'failed', attempts: 1, last_error: `HTTP ${res.status}` })
          .eq('id', outboxId)
      }
    }
  } catch (err) {
    if (outboxId) {
      try {
        const admin = createAdminClient()
        await admin
          .from('integration_events')
          .update({ status: 'failed', attempts: 1, last_error: String(err).slice(0, 500) })
          .eq('id', outboxId)
      } catch {
        // Delivery/outbox update failures must never surface to the user.
      }
    }
  }
}
