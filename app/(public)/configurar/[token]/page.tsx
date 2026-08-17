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
  const flags = await searchParams
  const admin = createAdminClient()
  const setup = await loadSetupRoom(admin, token)

  if (!setup) return <InvalidSetupLink />

  return (
    <SetupRoomClient
      token={token}
      setup={setup}
      calendarConnected={flags.calendar_connected === '1'}
      calendarError={flags.calendar_error ?? null}
    />
  )
}
