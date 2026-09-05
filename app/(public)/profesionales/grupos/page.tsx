import Link from 'next/link'
import { Check } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Varias sedes — Black Label Market',
  description:
    'Gestiona varias sedes desde una única cuenta, con visión consolidada de inventario y oportunidades. El acceso se gestiona de forma consultiva: ponte en contacto con nosotros.',
  alternates: { canonical: '/profesionales/grupos' },
}

const FEATURES = [
  'Inventario consolidado en tiempo real de todas las sedes',
  'Oportunidades enrutadas por sede y asignables a equipos locales',
  'Panel de administración centralizado para la matriz',
  'Usuarios por sede con roles diferenciados (location_manager, sales…)',
  'Analítica comparada entre sedes',
  'Showroom Destacado para cada sede que lo active',
  'Boosts individuales por sede',
]

export default function GruposPage() {
  return (
    <div className="max-w-screen-lg mx-auto px-6 lg:px-12 pt-28 pb-24">
      {/* Breadcrumb */}
      <nav aria-label="breadcrumb" className="mb-10">
        <ol className="flex items-center gap-1.5 text-xs text-bsm-text-muted">
          <li><Link href="/" className="hover:text-gold transition-colors">Inicio</Link></li>
          <li className="text-[#3A3A3A]" aria-hidden="true">/</li>
          <li><Link href="/para-profesionales" className="hover:text-gold transition-colors">Para profesionales</Link></li>
          <li className="text-[#3A3A3A]" aria-hidden="true">/</li>
          <li className="text-bsm-text-secondary">Modelo Grupo</li>
        </ol>
      </nav>

      {/* Hero */}
      <div className="mb-14">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-px w-8 bg-gold" />
          <span className="text-xs text-gold tracking-widest uppercase">Varias sedes</span>
        </div>
        <h1 className="font-display text-4xl md:text-5xl font-light text-bsm-text-primary mb-4">
          ¿Operas varias sedes?
        </h1>
        <p className="text-bsm-text-secondary max-w-xl leading-relaxed">
          Para empresas con varias ubicaciones o marcas. Un solo contrato, visión unificada,
          autonomía operativa por sede. Si gestionas más de una sede, ponte en contacto con nosotros
          y te preparamos una propuesta a medida.
        </p>
      </div>

      {/* Features */}
      <div className="mb-14">
        <h2 className="font-display text-2xl font-light mb-6">Qué incluye el modelo Grupo</h2>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {FEATURES.map((f) => (
            <li key={f} className="flex items-start gap-3 text-sm text-bsm-text-secondary">
              <Check className="w-4 h-4 text-gold flex-shrink-0 mt-0.5" />
              {f}
            </li>
          ))}
        </ul>
      </div>

      {/* How it works */}
      <div className="border border-bsm-border bg-surface p-8 mb-14">
        <h2 className="font-display text-xl font-light mb-4">Cómo funciona</h2>
        <ul className="space-y-3 text-sm text-bsm-text-secondary">
          <li className="flex gap-2"><span className="text-gold">1.</span> Nos cuentas cuántas sedes operas y cómo se reparten tu inventario y tu equipo, y valoramos el encaje del grupo con los criterios del market.</li>
          <li className="flex gap-2"><span className="text-gold">2.</span> Si encaja, agendamos una llamada para definir estructura, plan y condiciones a medida.</li>
          <li className="flex gap-2"><span className="text-gold">3.</span> Abrimos la configuración de sedes, equipos e inventario.</li>
        </ul>
      </div>

      {/* CTA */}
      <div className="border border-gold/30 bg-surface p-8">
        <p className="font-display text-xl font-light text-bsm-text-primary mb-2">
          Gestión centralizada para grupos con criterio
        </p>
        <p className="text-sm text-bsm-text-secondary mb-6 max-w-lg">
          El acceso al modelo Grupo se gestiona de forma consultiva.
          Cuéntanos tu estructura y valoramos el encaje del grupo.
        </p>
        <div className="flex flex-wrap gap-4">
          <Link href="/profesionales/solicitar-acceso" className="btn-gold px-6">
            Solicitar valoración para Grupo
          </Link>
          <Link href="/profesionales/planes" className="btn-outline px-6">
            Ver todos los planes →
          </Link>
        </div>
      </div>
    </div>
  )
}
