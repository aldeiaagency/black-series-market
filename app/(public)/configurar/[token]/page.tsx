import Link from 'next/link'
import { AlertTriangle } from 'lucide-react'
import { createAdminClient } from '@/lib/supabase/server'
import { loadSetupRoom } from '@/lib/onboarding/setup-room'
import SetupRoomClient from './SetupRoomClient'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ token: string }>
  searchParams: Promise<{ calendar_connected?: string; calendar_error?: string }>
}

function InvalidSetupLink() {
  return (
    <div className="min-h-[70vh] bg-obsidian px-5 py-20">
      <div className="mx-auto max-w-2xl border border-bsm-border bg-surface p-8 text-center">
        <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center border border-gold/30 bg-gold/5">
          <AlertTriangle className="h-5 w-5 text-gold" />
        </div>
        <p className="mb-3 text-xs uppercase tracking-[0.24em] text-gold">Enlace no disponible</p>
        <h1 className="font-display text-3xl font-light text-bsm-text-primary">Revisemos tu acceso</h1>
        <p className="mx-auto mt-4 max-w-lg text-sm leading-6 text-bsm-text-secondary">
          Este enlace de configuración ha caducado, ya se ha utilizado o no corresponde a una invitación activa.
          Escríbenos y prepararemos uno nuevo para tu showroom.
        </p>
        <Link href="/contacto" className="btn-gold mt-7 px-6 py-2.5 text-sm">
          Contactar con Black Label Market
        </Link>
      </div>
    </div>
  )
}

export default async function ConfigurarShowroomPage({ params, searchParams }: Props) {
  const { token } = await params
  const { calendar_connected, calendar_error } = await searchParams
  const admin = createAdminClient()
  const setup = await loadSetupRoom(admin, token)

  if (!setup) return <InvalidSetupLink />

  const planSlug = setup.dealer.subscription_plan
  const { data: feedSyncFeature } = planSlug
    ? await admin
        .from('plan_features')
        .select('plan_id, plans!inner(slug)')
        .eq('feature_key', 'feed_sync')
        .eq('included', true)
        .eq('availability_status', 'operative')
        .eq('plans.slug', planSlug)
        .maybeSingle()
    : { data: null }

  // Google Calendar (Fase A, docs/agente-cita-fase-A-google-calendar.md) — mismo dato que
  // Dashboard → Citas, leído aquí para poder conectarlo desde la sala tokenizada antes de que
  // el fundador tenga sesión (2026-09-04, hallazgo del simulacro E2E Karboceramic: el botón
  // solo existía en el dashboard, al que no se tiene acceso hasta enviar esta misma sala).
  const { data: googleConn } = await admin
    .from('showroom_calendar_connections')
    .select('status, external_account_email, error_message')
    .eq('dealer_id', setup.dealer.id)
    .eq('provider', 'google_calendar')
    .maybeSingle()

  const google = {
    configured: !!process.env.GOOGLE_OAUTH_CLIENT_ID,
    status: (googleConn?.status ?? null) as 'connected' | 'disconnected' | 'error' | 'pending' | null,
    email: googleConn?.external_account_email ?? null,
    errorMessage: googleConn?.error_message ?? null,
  }

  // Fotos de instalaciones ya subidas (dealer_gallery_images se escribe al momento de cada
  // subida, no en el envío final — ver app/api/onboarding/[token]/upload/route.ts). El cliente
  // arrancaba siempre con la galería vacía, así que si el fundador cerraba la pestaña y volvía,
  // parecía que sus fotos se habían perdido aunque siguieran guardadas (hallazgo 2026-09-04).
  const { data: galleryRows } = await admin
    .from('dealer_gallery_images')
    .select('id, storage_path')
    .eq('dealer_id', setup.dealer.id)
    .order('position', { ascending: true })
  const initialGallery = (galleryRows ?? []).map((row) => ({
    url: admin.storage.from('vehicle-images').getPublicUrl(row.storage_path).data.publicUrl,
    path: row.storage_path,
    type: 'gallery',
  }))

  return (
    <SetupRoomClient
      token={token}
      setup={setup}
      feedSyncAvailable={Boolean(feedSyncFeature)}
      google={google}
      calendarConnectedFlag={calendar_connected === '1'}
      calendarErrorFlag={calendar_error ?? null}
      initialGallery={initialGallery}
    />
  )
}
