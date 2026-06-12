import Link from 'next/link'
import { Check } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Modelo Grupo — Black Label Market',
  description:
    'Gestiona varias sedes desde una única cuenta. Plan Elite por sede principal + 50% por cada sede adicional. Vista consolidada de inventario y oportunidades.',
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

const EXAMPLES = [
  {
    title: '2 sedes',
    calc: '899 + 449,50',
    total: '1.348,50 €/mes',
    note: 'Por sede: Essential descontado al 50% del plan base Elite',
  },
  {
    title: '3 sedes',
    calc: '899 + 449,50 + 449,50',
    total: '1.798 €/mes',
    note: 'Precio por cada sede adicional: 50% de 899 €',
  },
  {
    title: '4+ sedes',
    calc: 'Presupuesto a medida',
    total: 'Consultar',
    note: 'Grupos de 4 o más sedes: precio y configuración a medida',
  },
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
          <span className="text-xs text-gold tracking-widest uppercase">Multi-sede</span>
        </div>
        <h1 className="font-display text-4xl md:text-5xl font-light text-bsm-text-primary mb-4">
          Modelo Grupo
        </h1>
        <p className="text-bsm-text-secondary max-w-xl leading-relaxed">
          Para empresas con varias ubicaciones o marcas. Un solo contrato, visión unificada,
          autonomía operativa por sede.
        </p>
      </div>

      {/* Pricing examples */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-14">
        {EXAMPLES.map((ex) => (
          <div key={ex.title} className={`bg-surface border p-6 ${ex.title === '2 sedes' ? 'border-gold/30' : 'border-bsm-border'}`}>
            <p className="text-xs text-gold tracking-widest uppercase mb-3">{ex.title}</p>
            <p className="text-sm text-bsm-text-muted font-mono mb-2">{ex.calc}</p>
            <p className="font-display text-2xl font-light text-bsm-text-primary mb-1">{ex.total}</p>
            <p className="text-xs text-bsm-text-muted">{ex.note}</p>
          </div>
        ))}
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
        <h2 className="font-display text-xl font-light mb-4">Estructura de precios</h2>
        <ul className="space-y-3 text-sm text-bsm-text-secondary">
          <li className="flex gap-2"><span className="text-gold">1.</span> Sede principal: plan Elite completo (899 €/mes).</li>
          <li className="flex gap-2"><span className="text-gold">2.</span> Cada sede adicional: 50% del plan Elite (449,50 €/mes).</li>
          <li className="flex gap-2"><span className="text-gold">3.</span> Grupos de 4 o más sedes: presupuesto personalizado, contáctanos.</li>
          <li className="flex gap-2"><span className="text-gold">4.</span> Cada sede tiene sus propios 100 slots de vehículos activos, 10 usuarios y 3 boosts/mes.</li>
        </ul>
      </div>

      {/* CTA */}
      <div className="border border-gold/30 bg-surface p-8">
        <p className="font-display text-xl font-light text-bsm-text-primary mb-2">
          Gestión centralizada para grupos con criterio
        </p>
        <p className="text-sm text-bsm-text-secondary mb-6 max-w-lg">
          El acceso al modelo Grupo se gestiona de forma consultiva.
          Cuéntanos tu estructura y te preparamos una propuesta.
        </p>
        <div className="flex flex-wrap gap-4">
          <Link href="/profesionales/solicitar-acceso?plan=grupo" className="btn-gold px-6">
            Consultar modelo Grupo
          </Link>
          <Link href="/profesionales/precios" className="btn-outline px-6">
            Ver todos los planes →
          </Link>
        </div>
      </div>
    </div>
  )
}
