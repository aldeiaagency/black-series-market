// Loading boundary de App Router para /coches y sus landings de categoría (que no
// tienen loading.tsx propio). CochesPage es un Server Component: esto es lo único
// que se ve durante la navegación cliente mientras se resuelve en el servidor.
// Cabecera idéntica a la real (texto estático, no depende de datos) para que no
// haya salto visual al reemplazarse; solo se skeletoniza lo que sí depende de datos.
export default function CochesLoading() {
  return (
    <div className="max-w-screen-2xl mx-auto px-6 lg:px-12 pt-28 pb-20">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-px w-8 bg-gold" />
          <span className="text-xs text-gold tracking-widest uppercase">Marketplace</span>
        </div>
        <h1 className="section-title mb-3">Coches premium</h1>
        <p className="text-sm text-bsm-text-muted mb-5 max-w-2xl">
          Coches deportivos, GT, clásicos, superdeportivos y unidades especiales en venta en España. Solo concesionarios y especialistas verificados, con stock real y ficha completa.
        </p>
        <div className="h-11 bg-surface border border-bsm-border shimmer" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="bg-surface border border-bsm-border">
            <div className="aspect-[16/10] shimmer" />
            <div className="p-4 space-y-3">
              <div className="h-3 w-20 bg-surface-elevated shimmer" />
              <div className="h-5 w-40 bg-surface-elevated shimmer" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
