import Image from 'next/image'
import Link from 'next/link'

export type FaqItem = {
  question: string
  answer: string
}

export type TocItem = {
  href: string
  label: string
}

export function GuideHeroImage({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="relative mb-10 aspect-[16/9] overflow-hidden border border-bsm-border bg-surface">
      <Image
        src={src}
        alt={alt}
        fill
        priority
        sizes="(max-width: 768px) 100vw, 896px"
        className="object-cover"
      />
    </div>
  )
}

export function GuideToc({ items }: { items: TocItem[] }) {
  return (
    <nav aria-label="Índice de la guía" className="mb-10 border border-bsm-border bg-surface/40 p-5">
      <p className="text-[10px] text-gold uppercase tracking-widest mb-4">En esta guía</p>
      <ul className="grid gap-2 sm:grid-cols-2">
        {items.map((item) => (
          <li key={item.href}>
            <a href={item.href} className="text-sm text-bsm-text-muted hover:text-gold transition-colors">
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}

export function GuideFaq({ items }: { items: FaqItem[] }) {
  return (
    <section id="faq" className="pt-8 border-t border-bsm-border">
      <h2 className="font-display text-2xl font-light text-bsm-text-primary mb-5">Preguntas frecuentes</h2>
      <div className="space-y-5">
        {items.map((item) => (
          <div key={item.question}>
            <h3 className="text-sm font-semibold text-bsm-text-primary mb-2">{item.question}</h3>
            <p className="text-sm text-bsm-text-secondary leading-relaxed">{item.answer}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

export function GuideAuthorBox() {
  return (
    <aside className="mt-10 border border-bsm-border bg-surface/40 p-5">
      <p className="text-[10px] text-gold uppercase tracking-widest mb-3">Revisión editorial</p>
      <p className="text-sm text-bsm-text-muted leading-relaxed">
        Contenido preparado por el equipo editorial de Black Label Market, marketplace especializado en coches
        y motos premium en España. Consulta más contexto sobre nuestro enfoque en{' '}
        <Link href="/sobre-nosotros" className="text-gold hover:text-gold-light transition-colors">
          Sobre nosotros
        </Link>
        .
      </p>
    </aside>
  )
}
