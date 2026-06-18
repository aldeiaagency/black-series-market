import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import Logo from '@/components/brand/Logo'
import { Clock, Mail, MapPin, LogOut } from 'lucide-react'

export const metadata = { title: 'Solicitud en revisión — Black Label Market' }

interface PageProps {
  searchParams: Promise<{ tipo?: string; email?: string }>
}

export default async function SolicitudEnviadaPage({ searchParams }: PageProps) {
  const params = await searchParams
  const isPublicShowroomRequest = params.tipo === 'showroom'
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user && !isPublicShowroomRequest) redirect('/login')

  if (!user && isPublicShowroomRequest) {
    return (
      <div className="min-h-screen bg-obsidian flex flex-col items-center justify-center px-6 py-16">
        <div className="w-full max-w-md">
          <div className="flex justify-center mb-12">
            <Link href="/"><Logo width={160} /></Link>
          </div>

          <div className="bg-surface border border-bsm-border p-8 text-center">
            <div className="w-14 h-14 rounded-full bg-amber-400/10 border border-amber-400/25 flex items-center justify-center mx-auto mb-6">
              <Clock className="w-6 h-6 text-amber-400" />
            </div>

            <h1 className="font-display text-2xl font-light mb-2">Solicitud recibida</h1>
            <p className="text-sm text-bsm-text-muted leading-relaxed mb-6">
              Hemos recibido tu solicitud. Nuestro equipo revisará la reputación y encaje profesional
              antes de habilitar el acceso al market.
            </p>

            {/* Confirmation email */}
            <div className="flex items-start gap-3 p-4 bg-gold/5 border border-gold/15 text-left mb-3">
              <Mail className="w-4 h-4 text-gold flex-shrink-0 mt-0.5" />
              <div className="space-y-1.5">
                <p className="text-xs text-bsm-text-muted leading-relaxed">
                  Te enviaremos un email de confirmación{params.email ? <> a <span className="text-bsm-text-primary font-medium">{params.email}</span></> : null}.
                  Si no aparece en unos minutos, <span className="text-bsm-text-secondary">revisa la carpeta de spam</span>.
                </p>
                <p className="text-xs text-bsm-text-muted leading-relaxed">
                  Para no perderte el correo de aprobación, <span className="text-bsm-text-secondary">añade nuestra dirección a tus contactos</span>.
                </p>
              </div>
            </div>

            {/* What happens next */}
            <div className="flex items-start gap-3 p-4 bg-amber-400/5 border border-amber-400/15 text-left mb-8">
              <Clock className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-bsm-text-muted leading-relaxed">
                Si la solicitud es aprobada, recibirás un segundo email con las instrucciones de acceso al panel profesional.
                El proceso habitualmente tarda entre <span className="text-bsm-text-secondary">24 y 48 horas laborables</span>.
                Hasta entonces no se crea ninguna cuenta ni se habilita el panel.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <Link href="/" className="btn-gold w-full justify-center text-sm">
                Volver al market
              </Link>
              <Link href="/contacto" className="btn-outline w-full justify-center text-sm">
                ¿Tienes alguna pregunta?
              </Link>
            </div>
          </div>

          <p className="text-center text-xs text-bsm-text-muted mt-6">
            Black Label Market · Marketplace de vehículos premium
          </p>
        </div>
      </div>
    )
  }

  if (!user) redirect('/login')

  const { data: dealer } = await supabase
    .from('dealers')
    .select('name, email, status, location_city, location_region, created_at')
    .eq('profile_id', user.id)
    .single()

  if (!dealer) redirect('/registro')
  if (dealer.status !== 'pending') redirect('/dashboard')

  const registeredAt = new Date(dealer.created_at).toLocaleDateString('es-ES', {
    day: 'numeric', month: 'long', year: 'numeric',
  })

  return (
    <div className="min-h-screen bg-obsidian flex flex-col items-center justify-center px-6 py-16">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="flex justify-center mb-12">
          <Link href="/"><Logo width={160} /></Link>
        </div>

        {/* Card */}
        <div className="bg-surface border border-bsm-border p-8 text-center">

          {/* Status icon */}
          <div className="w-14 h-14 rounded-full bg-amber-400/10 border border-amber-400/25 flex items-center justify-center mx-auto mb-6">
            <Clock className="w-6 h-6 text-amber-400" />
          </div>

          <h1 className="font-display text-2xl font-light mb-2">Solicitud en revisión</h1>
          <p className="text-sm text-bsm-text-muted leading-relaxed mb-8">
            Tu solicitud de acceso a Black Label Market está siendo evaluada por nuestro equipo.
            Revisamos la reputación y trayectoria de cada concesionario antes de habilitar el acceso a la plataforma.
          </p>

          {/* Dealer summary */}
          <div className="bg-obsidian border border-bsm-border p-4 text-left space-y-2.5 mb-8">
            <div className="flex items-center gap-2.5 text-sm">
              <span className="text-bsm-text-muted w-24 flex-shrink-0 text-xs uppercase tracking-wide">Nombre</span>
              <span className="text-bsm-text-primary font-medium">{dealer.name}</span>
            </div>
            <div className="flex items-center gap-2.5 text-sm">
              <span className="text-bsm-text-muted w-24 flex-shrink-0 text-xs uppercase tracking-wide">Email</span>
              <span className="text-bsm-text-secondary">{user.email}</span>
            </div>
            {dealer.location_city && (
              <div className="flex items-center gap-2.5 text-sm">
                <span className="text-bsm-text-muted w-24 flex-shrink-0 text-xs uppercase tracking-wide">Ubicación</span>
                <span className="text-bsm-text-secondary">{[dealer.location_city, dealer.location_region].filter(Boolean).join(', ')}</span>
              </div>
            )}
            <div className="flex items-center gap-2.5 text-sm">
              <span className="text-bsm-text-muted w-24 flex-shrink-0 text-xs uppercase tracking-wide">Enviada</span>
              <span className="text-bsm-text-secondary">{registeredAt}</span>
            </div>
          </div>

          {/* What happens next */}
          <div className="flex items-start gap-3 p-4 bg-amber-400/5 border border-amber-400/15 text-left mb-8">
            <Mail className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-bsm-text-muted leading-relaxed">
              Recibirás un email en <span className="text-bsm-text-primary">{user.email}</span> cuando tu perfil sea aprobado.
              El proceso habitualmente tarda entre 24 y 48 horas laborables.
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <Link href="/contacto" className="btn-outline w-full justify-center text-sm">
              ¿Tienes alguna pregunta?
            </Link>
            <form action="/api/auth/signout" method="POST">
              <button type="submit" className="w-full flex items-center justify-center gap-2 text-sm text-bsm-text-muted hover:text-bsm-text-primary transition-colors py-2">
                <LogOut className="w-3.5 h-3.5" />
                Cerrar sesión
              </button>
            </form>
          </div>
        </div>

        <p className="text-center text-xs text-bsm-text-muted mt-6">
          Black Label Market · Marketplace de vehículos premium
        </p>
      </div>
    </div>
  )
}
