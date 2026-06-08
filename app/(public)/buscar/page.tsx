import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import VehicleCard from '@/components/marketplace/VehicleCard'
import SearchBar from '@/components/marketplace/SearchBar'
import CloseSearchButton from '@/components/marketplace/CloseSearchButton'
import Link from 'next/link'

interface PageProps {
  searchParams: Promise<{ q?: string; tipo?: string }>
}

async function SearchResults({ q, tipo }: { q: string; tipo?: string }) {
  const supabase = await createClient()

  let query = supabase
    .from('vehicles')
    .select('*, dealer:dealers(name, slug, location_city, logo_url, is_verified)', { count: 'exact' })
    .eq('status', 'active')
    .or(`brand_name.ilike.%${q}%,model_name.ilike.%${q}%`)

  if (tipo === 'coches')  query = query.eq('vehicle_type', 'car')
  if (tipo === 'motos')   query = query.eq('vehicle_type', 'motorcycle')

  query = query.order('is_featured', { ascending: false }).order('published_at', { ascending: false }).limit(24)

  const { data: vehicles, count } = await query

  if (!vehicles?.length) {
    return (
      <div className="text-center py-16">
        <p className="font-display text-xl mb-2">Sin resultados para &quot;{q}&quot;</p>
        <p className="text-sm text-bsm-text-muted mb-6">
          Prueba con otra marca, modelo o término de búsqueda.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          {['Ferrari', 'Lamborghini', 'Porsche', 'BMW M', 'Mercedes AMG'].map((s) => (
            <Link
              key={s}
              href={`/buscar?q=${encodeURIComponent(s)}`}
              className="text-xs px-3 py-1.5 border border-bsm-border text-bsm-text-muted hover:border-gold/40 hover:text-gold transition-colors"
            >
              {s}
            </Link>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div>
      <p className="text-sm text-bsm-text-muted mb-6">
        {count} resultado{count !== 1 ? 's' : ''} para &quot;<span className="text-bsm-text-primary">{q}</span>&quot;
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {vehicles.map((v: any) => <VehicleCard key={v.id} vehicle={v} />)}
      </div>
    </div>
  )
}

export default async function BuscarPage({ searchParams }: PageProps) {
  const { q, tipo } = await searchParams

  return (
    <div className="max-w-screen-2xl mx-auto px-6 lg:px-12 pt-28 pb-20">
      <div className="mb-10">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="h-px w-8 bg-gold" />
            <span className="text-xs text-gold tracking-widest uppercase">Búsqueda</span>
          </div>
          <CloseSearchButton />
        </div>
        <h1 className="section-title mb-8">Buscar vehículos</h1>

        <SearchBar size="hero" className="max-w-2xl mb-6" />

        {/* Type filter */}
        <div className="flex gap-3 mt-4">
          {[
            { value: '', label: 'Todo' },
            { value: 'coches', label: 'Coches' },
            { value: 'motos', label: 'Motos' },
          ].map((t) => (
            <Link
              key={t.value}
              href={`/buscar${q ? `?q=${encodeURIComponent(q)}` : ''}${t.value ? `${q ? '&' : '?'}tipo=${t.value}` : ''}`}
              className={`text-xs px-4 py-2 border transition-colors
                ${tipo === t.value || (!tipo && t.value === '')
                  ? 'border-gold text-gold bg-gold/5'
                  : 'border-bsm-border text-bsm-text-muted hover:border-bsm-border-light'}`}
            >
              {t.label}
            </Link>
          ))}
        </div>
      </div>

      {q ? (
        <Suspense fallback={<div className="text-bsm-text-muted text-sm">Buscando...</div>}>
          <SearchResults q={q} tipo={tipo} />
        </Suspense>
      ) : (
        <div className="text-center py-16 text-bsm-text-muted">
          <p>Introduce una marca, modelo o término para buscar.</p>
        </div>
      )}
    </div>
  )
}
