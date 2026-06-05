'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'

const OPTIONS = [
  { value: 'featured',     label: 'Destacados' },
  { value: 'newest',       label: 'Más recientes' },
  { value: 'oldest',       label: 'Más antiguos' },
  { value: 'price_asc',    label: 'Precio: menor a mayor' },
  { value: 'price_desc',   label: 'Precio: mayor a menor' },
  { value: 'mileage_asc',  label: 'Menor kilometraje' },
  { value: 'mileage_desc', label: 'Mayor kilometraje' },
  { value: 'year_desc',    label: 'Año: más nuevo primero' },
  { value: 'year_asc',     label: 'Año: más antiguo primero' },
]

export default function SortSelector() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const current = searchParams.get('sort') || 'featured'

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const params = new URLSearchParams(searchParams.toString())
    params.set('sort', e.target.value)
    params.delete('page')
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }

  return (
    <div className="hidden lg:flex items-center gap-3">
      <span className="text-xs text-[#737373] whitespace-nowrap">Ordenar por</span>
      <select className="select-base w-52" value={current} onChange={handleChange} aria-label="Ordenar por">
        {OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  )
}
