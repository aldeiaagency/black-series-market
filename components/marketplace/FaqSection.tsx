import { ChevronDown } from 'lucide-react'

export interface FaqItem {
  q: string
  a: string
}

/**
 * Sección de preguntas frecuentes reutilizable.
 *
 * - Emite `FAQPage` JSON-LD (SEO/GEO: respuestas citables por Google y por LLMs).
 * - Usa `<details>/<summary>` nativos: accesible por teclado y lector de pantalla, sin JS,
 *   y el texto de las respuestas queda SIEMPRE en el DOM (los rastreadores lo leen aunque
 *   esté colapsado visualmente).
 *
 * Server Component (no lleva 'use client').
 */
export default function FaqSection({
  items,
  heading = 'Preguntas frecuentes',
  eyebrow = 'Dudas habituales',
}: {
  items: FaqItem[]
  heading?: string
  eyebrow?: string
}) {
  if (!items?.length) return null

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map(({ q, a }) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  }

  return (
    <section className="border-t border-[#141414] py-20" aria-labelledby="faq-heading">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <div className="max-w-screen-2xl mx-auto px-6 lg:px-12">
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px w-8 bg-[#C6A64B]/40" />
            <span className="text-[10px] text-[#C6A64B]/60 tracking-[0.3em] uppercase">
              {eyebrow}
            </span>
          </div>
          <h2 id="faq-heading" className="font-display text-3xl md:text-4xl font-light text-[#F4F1EA] tracking-tight">
            {heading}
          </h2>
        </div>

        <div className="max-w-3xl divide-y divide-[#181818] border-t border-b border-[#181818]">
          {items.map(({ q, a }, i) => (
            <details key={i} className="group">
              <summary className="flex items-center justify-between gap-4 cursor-pointer list-none py-5 text-[15px] text-[#D4D4D4] font-medium transition-colors hover:text-[#F4F1EA] focus-visible:outline-none focus-visible:text-gold [&::-webkit-details-marker]:hidden">
                <span>{q}</span>
                <ChevronDown
                  aria-hidden="true"
                  className="w-4 h-4 flex-shrink-0 text-[#C6A64B]/60 transition-transform duration-200 group-open:rotate-180"
                />
              </summary>
              <p className="pb-6 -mt-1 text-[14px] text-[#9A9A9A] leading-relaxed max-w-2xl">
                {a}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
