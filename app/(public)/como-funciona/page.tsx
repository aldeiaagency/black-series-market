import Link from 'next/link'
import { Search, Heart, Bell, GitCompareArrows, MessageSquare, ShieldCheck, Package, BarChart2, X, ArrowRight } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Cómo funciona — Black Label Market',
  description: 'Cómo funciona Black Label Market para compradores y profesionales del motor premium.',
}

const BUYER_STEPS = [
  {
    icon: Search,
    title: 'Explora coches y motos seleccionados',
    desc: 'Filtra por marca, modelo, precio, kilómetros, tipo y otros criterios. Todos los vehículos publicados han superado los criterios mínimos de calidad editorial.',
  },
  {
    icon: Heart,
    title: 'Guarda unidades de interés',
    desc: 'Usa el botón "Guardar" en cualquier ficha o card para guardar vehículos. Los favoritos quedan en tu dispositivo para que puedas revisarlos cuando quieras.',
  },
  {
    icon: GitCompareArrows,
    title: 'Compara hasta 3 vehículos',
    desc: 'Selecciona vehículos con el botón "Comparar" y accede a una vista comparativa de especificaciones, condiciones y ficha técnica.',
  },
  {
    icon: Bell,
    title: 'Solicita búsqueda privada',
    desc: 'Si no encuentras la unidad que buscas, registra tu demanda. Si aparece una oportunidad compatible, te contactamos.',
  },
  {
    icon: MessageSquare,
    title: 'Contacta con profesionales seleccionados',
    desc: 'El formulario de contacto cualificado permite que tu solicitud llegue al vendedor con más contexto: plazo, financiación, parte de pago y preferencia de contacto.',
  },
]

const DEALER_STEPS = [
  {
    icon: ShieldCheck,
    title: 'Solicita acceso',
    desc: 'Black Label selecciona profesionales que trabajan con criterio: presentación cuidada, información real y disponibilidad verificada. El acceso es por solicitud.',
  },
  {
    icon: Package,
    title: 'Publica tu inventario',
    desc: 'Sube fichas de calidad con imágenes reales, ficha técnica completa, equipamiento y condiciones de venta. El panel de gestión te permite controlar todo el proceso.',
  },
  {
    icon: MessageSquare,
    title: 'Recibe solicitudes más cualificadas',
    desc: 'Cada solicitud llega con el contexto del comprador: plazo de compra, interés en financiación, entrega de vehículo y mensaje. Menos ruido, más intención real.',
  },
  {
    icon: BarChart2,
    title: 'Accede a analítica básica',
    desc: 'Consulta vistas por unidad, número de leads recibidos y estado de cada solicitud. Base para tomar decisiones sobre tu inventario publicado.',
  },
]

const NOT_BL = [
  'Un portal abierto sin criterio de publicación',
  'Una garantía de venta ni de contacto cualificado',
  'Un sustituto de la revisión independiente del vehículo',
  'Una plataforma sin mínimos de calidad para el stock publicado',
  'Un intermediario con responsabilidad en la operación de compraventa',
]

export default function ComoFuncionaPage() {
  return (
    <div className="max-w-screen-xl mx-auto px-6 lg:px-12 pt-28 pb-20">

      {/* Hero */}
      <div className="mb-16 max-w-2xl">
        <div className="flex items-center gap-3 mb-5">
          <div className="h-px w-8 bg-gold" />
          <span className="text-xs text-gold tracking-widest uppercase">Marketplace curado</span>
        </div>
        <h1 className="font-display text-4xl md:text-5xl font-light text-bsm-text-primary mb-4 leading-tight">
          Cómo funciona Black Label Market
        </h1>
        <p className="text-bsm-text-secondary leading-relaxed">
          Black Label Market es un marketplace curado de coches y motos premium, deportivos,
          clásicos y unidades especiales. No somos un portal de anuncios genérico. Seleccionamos
          qué se publica y quién lo publica.
        </p>
      </div>

      {/* Para compradores */}
      <section className="mb-20">
        <div className="mb-8">
          <h2 className="font-display text-3xl font-light mb-2">Para compradores</h2>
          <p className="text-bsm-text-muted text-sm">Encuentra la unidad correcta, con menos ruido y más criterio.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {BUYER_STEPS.map((step) => (
            <div key={step.title} className="bg-surface border border-bsm-border p-6 hover:border-[#C6A64B]/20 transition-colors">
              <div className="w-9 h-9 flex items-center justify-center border border-[#C6A64B]/20 bg-[#C6A64B]/5 mb-4">
                <step.icon className="w-4 h-4 text-[#C6A64B]" />
              </div>
              <h3 className="font-medium text-bsm-text-primary mb-2 text-sm leading-snug">{step.title}</h3>
              <p className="text-xs text-bsm-text-muted leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
        <div className="mt-8 flex flex-wrap gap-4">
          <Link href="/coches" className="btn-gold px-6">Explorar coches</Link>
          <Link href="/motos" className="btn-outline px-6">Explorar motos</Link>
          <Link href="/busqueda-privada" className="btn-ghost px-6 text-sm">Solicitar búsqueda privada</Link>
        </div>
      </section>

      {/* Para dealers */}
      <section className="mb-20">
        <div className="mb-8">
          <h2 className="font-display text-3xl font-light mb-2">Para profesionales</h2>
          <p className="text-bsm-text-muted text-sm">Un canal pensado para oportunidades reales, no para generar curiosidad vacía.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {DEALER_STEPS.map((step) => (
            <div key={step.title} className="bg-surface border border-bsm-border p-6 hover:border-[#C6A64B]/20 transition-colors">
              <div className="w-9 h-9 flex items-center justify-center border border-[#C6A64B]/20 bg-[#C6A64B]/5 mb-4">
                <step.icon className="w-4 h-4 text-[#C6A64B]" />
              </div>
              <h3 className="font-medium text-bsm-text-primary mb-2 text-sm">{step.title}</h3>
              <p className="text-xs text-bsm-text-muted leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
        <div className="mt-8">
          <Link href="/registro" className="btn-gold px-6">Solicitar acceso profesional</Link>
        </div>
      </section>

      {/* Qué NO es Black Label */}
      <section className="mb-20">
        <div className="border border-[#1A1A1A] bg-[#0A0A0A] p-8">
          <h2 className="font-display text-2xl font-light mb-6 text-bsm-text-primary">
            Qué no es Black Label Market
          </h2>
          <ul className="space-y-3">
            {NOT_BL.map((item) => (
              <li key={item} className="flex items-start gap-3">
                <X className="w-4 h-4 text-[#737373] flex-shrink-0 mt-0.5" />
                <span className="text-sm text-[#8A8A8A]">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* CTAs finales */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border border-bsm-border p-8">
          <h3 className="font-display text-2xl font-light mb-3">Soy comprador</h3>
          <p className="text-sm text-bsm-text-muted mb-6 leading-relaxed">
            Explora el catálogo, guarda favoritos y solicita la unidad que buscas si no la encuentras.
          </p>
          <Link href="/coches" className="flex items-center gap-2 text-sm text-gold hover:text-gold-light transition-colors">
            Explorar vehículos <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="border border-[#C6A64B]/20 bg-[#C6A64B]/3 p-8">
          <h3 className="font-display text-2xl font-light mb-3 text-bsm-text-primary">Soy profesional</h3>
          <p className="text-sm text-bsm-text-muted mb-6 leading-relaxed">
            Solicita acceso para publicar tu inventario y llegar a compradores con criterio real.
          </p>
          <Link href="/registro" className="flex items-center gap-2 text-sm text-gold hover:text-gold-light transition-colors">
            Solicitar acceso profesional <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  )
}
