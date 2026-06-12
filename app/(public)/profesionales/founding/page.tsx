import Link from 'next/link'
import { Check } from 'lucide-react'
import type { Metadata } from 'next'
import { PLANS, FOUNDING_MAX_SELLERS, formatEUR } from '@/lib/plans-config'

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://blacklabelmarket.es'

export const metadata: Metadata = {
  title: 'Programa Founding — Black Label Market',
  description:
    `Los primeros ${FOUNDING_MAX_SELLERS} profesionales seleccionados acceden a precio Founding —mitad de precio— bloqueado de por vida. Descubre las condiciones del programa.`,
  alternates: { canonical: '/profesionales/founding' },
}

const CONDITIONS = [
  'Precio Founding bloqueado mientras se mantenga la suscripción activa y en buen estado.',
  'Condición personal e intransferible: no se traspasa si cambia el titular de la cuenta.',
  'El precio se mantiene aunque el plan suba de características en futuras versiones.',
  'La condición Founding se revoca si la suscripción se cancela o caduca más de 30 días.',
  'Black Label Market se reserva el derecho de aprobar o denegar solicitudes sin justificación.',
]

const INCLUDES = PLANS.map((p) => ({
  plan: `${p.name} Founding`,
  price: `${formatEUR(p.foundingPrice)}/mes`,
  normal: `${p.monthlyPrice} €/mes`,
}))

export default function FoundingPage() {
  return (
    <div className="max-w-screen-lg mx-auto px-6 lg:px-12 pt-28 pb-24">
      {/* Breadcrumb */}
      <nav aria-label="breadcrumb" className="mb-10">
        <ol className="flex items-center gap-1.5 text-xs text-bsm-text-muted">
          <li><Link href="/" className="hover:text-gold transition-colors">Inicio</Link></li>
          <li className="text-[#3A3A3A]" aria-hidden="true">/</li>
          <li><Link href="/para-profesionales" className="hover:text-gold transition-colors">Para profesionales</Link></li>
          <li className="text-[#3A3A3A]" aria-hidden="true">/</li>
          <li className="text-bsm-text-secondary">Founding</li>
        </ol>
      </nav>

      {/* Hero */}
      <div className="mb-14">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-px w-8 bg-gold" />
          <span className="text-xs text-gold tracking-widest uppercase">Programa Founding</span>
        </div>
        <h1 className="font-display text-4xl md:text-5xl font-light text-bsm-text-primary mb-4">
          Para los que llegan primero
        </h1>
        <p className="text-bsm-text-secondary max-w-xl leading-relaxed">
          Black Label Market selecciona a los primeros {FOUNDING_MAX_SELLERS} profesionales fundadores.
          Acceden a mitad de precio, bloqueado de por vida. No es una oferta de lanzamiento: es un
          reconocimiento a quienes apuestan por el proyecto desde el principio.
        </p>
      </div>

      {/* Precios Founding */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-14">
        {INCLUDES.map((item) => (
          <div key={item.plan} className="bg-surface border border-gold/20 p-6">
            <p className="text-xs text-gold tracking-widest uppercase mb-3">Founding · −50%</p>
            <h2 className="font-medium text-bsm-text-primary mb-1">{item.plan}</h2>
            <div className="flex items-baseline gap-2 mb-1">
              <span className="font-display text-3xl font-light text-bsm-text-primary">{item.price}</span>
            </div>
            <p className="text-xs text-bsm-text-muted line-through">Precio normal: {item.normal}</p>
          </div>
        ))}
      </div>

      {/* Condiciones */}
      <div className="mb-14">
        <h2 className="font-display text-2xl font-light mb-6">Condiciones del programa</h2>
        <ul className="space-y-3">
          {CONDITIONS.map((c) => (
            <li key={c} className="flex items-start gap-3 text-sm text-bsm-text-secondary">
              <Check className="w-4 h-4 text-gold flex-shrink-0 mt-0.5" />
              {c}
            </li>
          ))}
        </ul>
      </div>

      {/* CTA */}
      <div className="border border-gold/30 bg-surface p-8">
        <p className="font-display text-xl font-light text-bsm-text-primary mb-2">
          ¿Quieres ser parte del Founding?
        </p>
        <p className="text-sm text-bsm-text-secondary mb-6 max-w-lg">
          Solicita tu acceso indicando que te interesa la condición Founding.
          El equipo de Black Label Market revisará tu perfil y te contactará.
          Las plazas son limitadas y se asignan por orden de aprobación.
        </p>
        <div className="flex flex-wrap gap-4">
          <Link href="/profesionales/solicitar-acceso?tipo=founding" className="btn-gold px-6">
            Solicitar acceso Founding
          </Link>
          <Link href="/profesionales/precios" className="btn-outline px-6">
            Ver todos los planes →
          </Link>
        </div>
      </div>
    </div>
  )
}
