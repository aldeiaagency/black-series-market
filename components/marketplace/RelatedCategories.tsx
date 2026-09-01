import Link from 'next/link'
import type { CategoryLink, CategoryBrandStock } from '@/lib/related-categories'

/**
 * "Sigue explorando": categorías relacionadas (mapa editorial fijo) + marcas con
 * stock real en la categoría actual (dinámico). Server Component, sin JS. Cada
 * bloque se omite si no tiene contenido — nunca se muestra una lista vacía.
 */
export default function RelatedCategories({
  categories,
  brands,
}: {
  categories: CategoryLink[]
  brands: CategoryBrandStock[]
}) {
  if (categories.length === 0 && brands.length === 0) return null

  return (
    <section className="border-t border-[#141414] py-16">
      <div className="max-w-screen-2xl mx-auto px-6 lg:px-12 space-y-10">
        {categories.length > 0 && (
          <div>
            <span className="text-[10px] text-gold/60 tracking-[0.3em] uppercase block mb-4">
              Sigue explorando
            </span>
            <div className="flex flex-wrap gap-3">
              {categories.map((c) => (
                <Link
                  key={c.href}
                  href={c.href}
                  className="px-4 py-2 text-sm border border-bsm-border text-bsm-text-secondary hover:border-gold/40 hover:text-gold transition-colors"
                >
                  {c.label}
                </Link>
              ))}
            </div>
          </div>
        )}

        {brands.length > 0 && (
          <div>
            <span className="text-[10px] text-gold/60 tracking-[0.3em] uppercase block mb-4">
              Marcas con stock en esta categoría
            </span>
            <div className="flex flex-wrap gap-3">
              {brands.map((b) => (
                <Link
                  key={b.slug}
                  href={b.href}
                  className="px-4 py-2 text-sm border border-bsm-border text-bsm-text-secondary hover:border-gold/40 hover:text-gold transition-colors"
                >
                  {b.name} <span className="text-bsm-text-muted">({b.count})</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
