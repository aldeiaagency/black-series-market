// Loading boundary de App Router para /coches/[slug]. Más específico que
// app/(public)/coches/loading.tsx (que solo encaja con el grid del catálogo) y tiene
// precedencia sobre él para esta ruta. La ficha es un Server Component: esto es lo
// único que se ve durante la navegación cliente mientras se resuelve en el servidor.
export default function CocheDetailLoading() {
  return (
    <div className="max-w-screen-2xl mx-auto px-6 lg:px-12 pt-28 pb-24 lg:pb-20">
      <div className="h-4 w-64 bg-surface shimmer mb-8" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* ── Left column ── */}
        <div className="lg:col-span-8 space-y-10">
          <div>
            <div className="h-3 w-24 bg-surface shimmer mb-3" />
            <div className="h-10 w-3/4 bg-surface shimmer mb-2" />
            <div className="h-4 w-1/3 bg-surface shimmer" />
          </div>

          <div className="aspect-[16/10] bg-surface border border-bsm-border shimmer" />

          <div>
            <div className="h-3 w-40 bg-surface shimmer mb-4" />
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="bg-surface border border-bsm-border p-4 h-16 shimmer" />
              ))}
            </div>
          </div>

          <div>
            <div className="h-3 w-48 bg-surface shimmer mb-4" />
            <div className="space-y-2.5">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-3.5 bg-surface shimmer" style={{ width: `${92 - i * 12}%` }} />
              ))}
            </div>
          </div>
        </div>

        {/* ── Right column ── */}
        <div className="lg:col-span-4">
          <div className="bg-surface border border-bsm-border p-6 space-y-4">
            <div className="h-8 w-2/3 bg-surface-elevated shimmer" />
            <div className="h-11 bg-surface-elevated shimmer" />
            <div className="h-11 bg-surface-elevated shimmer" />
            <div className="h-px bg-bsm-border" />
            <div className="space-y-2.5">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-3.5 bg-surface-elevated shimmer" style={{ width: `${80 - i * 10}%` }} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
