import 'server-only'
import { createAdminClient } from '@/lib/supabase/server'

// Aprovisiona/desactiva el workflow de n8n dedicado al asistente de cualificación de un dealer.
// Distinto de lib/integrations/n8n.ts (que dispara webhooks de eventos de negocio): este módulo
// habla con la API DE GESTIÓN de n8n (clonar/activar/desactivar workflows completos), no con un
// webhook de negocio puntual.
//
// Contexto: hasta ahora todos los dealers Professional/Elite compartían el mismo workflow
// (WF7, id ASSISTANT_TEMPLATE_WORKFLOW_ID) — la columna showroom_assistant_config.webhook_url
// ya era por-dealer en el esquema, pero dos sitios (approveApplication y el webhook de Stripe)
// escribían siempre la misma URL hardcodeada. Ahora cada dealer Professional/Elite obtiene su
// propio clon (mismo prompt/lógica que WF7 al principio — la personalización real es trabajo
// manual posterior, igual que la agencia adapta workflows de clientes reales).
//
// Nunca debe bloquear el flujo que lo llama (aprobación de alta, checkout de Stripe, cambio de
// plan desde el admin): cualquier fallo cae al workflow compartido (n8n_workflow_id = null),
// exactamente el comportamiento que había antes de este cambio.

const N8N_API_BASE_URL = process.env.N8N_API_BASE_URL ?? 'https://aldeia-n8n.giuxk6.easypanel.host/api/v1'
const N8N_WEBHOOK_BASE_URL = process.env.N8N_ASSISTANT_WEBHOOK_BASE_URL ?? 'https://aldeia-n8n.giuxk6.easypanel.host/webhook'
const ASSISTANT_TEMPLATE_WORKFLOW_ID = '8DgPnmyTWKn71tuc' // WF7 — Agente IA Cualificador BLM
const SHARED_FALLBACK_WEBHOOK_URL = process.env.N8N_ASSISTANT_WEBHOOK_URL
  ?? `${N8N_WEBHOOK_BASE_URL}/blm/assistant`
const REQUEST_TIMEOUT_MS = 10_000

function n8nHeaders() {
  return {
    'X-N8N-API-KEY': process.env.N8N_API_KEY ?? '',
    'Content-Type': 'application/json',
  }
}

async function n8nFetch(path: string, init: RequestInit) {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), REQUEST_TIMEOUT_MS)
  try {
    return await fetch(`${N8N_API_BASE_URL}${path}`, { ...init, headers: n8nHeaders(), signal: ctrl.signal })
  } finally {
    clearTimeout(timer)
  }
}

async function cloneAssistantWorkflow(dealerId: string, dealerName: string): Promise<{ webhookUrl: string; workflowId: string }> {
  const getRes = await n8nFetch(`/workflows/${ASSISTANT_TEMPLATE_WORKFLOW_ID}`, { method: 'GET' })
  if (!getRes.ok) throw new Error(`No se pudo leer la plantilla del asistente (HTTP ${getRes.status})`)
  const template = await getRes.json()

  const nodes = JSON.parse(JSON.stringify(template.nodes))
  const webhookNode = nodes.find((n: { type: string }) => n.type === 'n8n-nodes-base.webhook')
  if (!webhookNode) throw new Error('La plantilla del asistente no tiene nodo webhook')
  const webhookPath = `blm/assistant/${dealerId}`
  webhookNode.parameters.path = webhookPath

  const shortId = dealerId.slice(0, 8)
  const body = {
    name: `WF7 · Agente IA · ${dealerName} · ${shortId}`,
    nodes,
    connections: template.connections,
    settings: { executionOrder: template.settings?.executionOrder ?? 'v1' },
  }

  const createRes = await n8nFetch('/workflows', { method: 'POST', body: JSON.stringify(body) })
  if (!createRes.ok) throw new Error(`No se pudo crear el workflow clonado (HTTP ${createRes.status})`)
  const created = await createRes.json()
  const workflowId = created.id as string

  const activateRes = await n8nFetch(`/workflows/${workflowId}/activate`, { method: 'POST' })
  if (!activateRes.ok) throw new Error(`No se pudo activar el workflow clonado (HTTP ${activateRes.status})`)

  return { webhookUrl: `${N8N_WEBHOOK_BASE_URL}/${webhookPath}`, workflowId }
}

/**
 * Aprovisiona (o reutiliza, si ya existe) el asistente dedicado de un dealer. Nunca lanza —
 * cualquier fallo deja al dealer en el workflow compartido, que es el comportamiento previo.
 */
export async function provisionDealerAssistant(
  admin: ReturnType<typeof createAdminClient>,
  { dealerId, dealerName }: { dealerId: string; dealerName: string },
): Promise<void> {
  try {
    const { data: existing } = await admin
      .from('showroom_assistant_config')
      .select('n8n_workflow_id')
      .eq('dealer_id', dealerId)
      .maybeSingle()

    if (existing?.n8n_workflow_id) {
      // Ya tiene su propio workflow — solo asegurar que está habilitado.
      await admin.from('showroom_assistant_config').update({ enabled: true }).eq('dealer_id', dealerId)
      return
    }

    const { webhookUrl, workflowId } = await cloneAssistantWorkflow(dealerId, dealerName)
    await admin
      .from('showroom_assistant_config')
      .upsert({ dealer_id: dealerId, webhook_url: webhookUrl, n8n_workflow_id: workflowId, enabled: true }, { onConflict: 'dealer_id' })
  } catch (err) {
    console.error('[provisionDealerAssistant] fallback al workflow compartido:', err)
    await admin
      .from('showroom_assistant_config')
      .upsert({ dealer_id: dealerId, webhook_url: SHARED_FALLBACK_WEBHOOK_URL, enabled: true }, { onConflict: 'dealer_id' })
      .then(undefined, () => {})
  }
}

/**
 * Desactiva (nunca borra) el asistente dedicado de un dealer al bajar de plan o cancelar.
 * El `enabled:false` es el interruptor real que ya comprueban las rutas del asistente —
 * se aplica siempre, pase lo que pase con la llamada a n8n.
 */
export async function deactivateDealerAssistant(
  admin: ReturnType<typeof createAdminClient>,
  dealerId: string,
): Promise<void> {
  try {
    const { data: cfg } = await admin
      .from('showroom_assistant_config')
      .select('n8n_workflow_id')
      .eq('dealer_id', dealerId)
      .maybeSingle()

    if (cfg?.n8n_workflow_id) {
      await n8nFetch(`/workflows/${cfg.n8n_workflow_id}/deactivate`, { method: 'POST' }).catch(() => {})
    }
  } catch (err) {
    console.error('[deactivateDealerAssistant] error al desactivar en n8n (no bloqueante):', err)
  } finally {
    await admin.from('showroom_assistant_config').update({ enabled: false }).eq('dealer_id', dealerId).then(undefined, () => {})
  }
}
