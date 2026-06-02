import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PaginationProps {
  page: number
  totalCount: number
  limit: number
  params: Record<string, string>
  basePath: string
  label?: string
}

function buildUrl(basePath: string, params: Record<string, string>, page: number) {
  const p = new URLSearchParams(params)
  if (page <= 1) {
    p.delete('page')
  } else {
    p.set('page', String(page))
  }
  const qs = p.toString()
  return qs ? `${basePath}?${qs}` : basePath
}

function pageRange(current: number, total: number): (number | '...')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)

  const pages: (number | '...')[] = [1]

  if (current > 3) pages.push('...')

  const start = Math.max(2, current - 1)
  const end   = Math.min(total - 1, current + 1)
  for (let i = start; i <= end; i++) pages.push(i)

  if (current < total - 2) pages.push('...')

  pages.push(total)
  return pages
}

export default function Pagination({
  page,
  totalCount,
  limit,
  params,
  basePath,
  label = 'vehículos',
}: PaginationProps) {
  const totalPages = Math.ceil(totalCount / limit)
  if (totalPages <= 1) return null

  const hasPrev = page > 1
  const hasNext = page < totalPages
  const from    = (page - 1) * limit + 1
  const to      = Math.min(page * limit, totalCount)
  const pages   = pageRange(page, totalPages)

  return (
    <nav className="flex flex-col items-center gap-5 pt-4" aria-label="Paginación de resultados">

      {/* Count */}
      <p className="text-sm text-bsm-text-muted">
        Mostrando {from}–{to} de {totalCount} {label}
      </p>

      {/* Controls */}
      <div className="flex items-center gap-1.5">

        {/* Previous */}
        {hasPrev ? (
          <Link
            href={buildUrl(basePath, params, page - 1)}
            className="flex items-center gap-1 px-3 py-2 text-sm text-bsm-text-muted border border-bsm-border
              hover:border-gold/40 hover:text-gold transition-colors"
            aria-label="Página anterior"
          >
            <ChevronLeft className="w-4 h-4" />
            Anterior
          </Link>
        ) : (
          <span className="flex items-center gap-1 px-3 py-2 text-sm text-[#3A3A3A] border border-[#1E1E1E] select-none">
            <ChevronLeft className="w-4 h-4" />
            Anterior
          </span>
        )}

        {/* Page numbers */}
        <div className="flex items-center gap-1 mx-1">
          {pages.map((p, i) =>
            p === '...' ? (
              <span
                key={`ellipsis-${i}`}
                className="w-9 h-9 flex items-center justify-center text-[#555] text-sm select-none"
              >
                …
              </span>
            ) : (
              <Link
                key={p}
                href={buildUrl(basePath, params, p)}
                aria-current={p === page ? 'page' : undefined}
                aria-label={`Página ${p}`}
                className={`w-9 h-9 flex items-center justify-center text-sm border transition-colors ${
                  p === page
                    ? 'border-[#C6A64B]/50 bg-[#C6A64B]/10 text-[#C6A64B] font-medium pointer-events-none'
                    : 'border-bsm-border text-bsm-text-muted hover:border-[#C6A64B]/30 hover:text-bsm-text-primary'
                }`}
              >
                {p}
              </Link>
            )
          )}
        </div>

        {/* Next */}
        {hasNext ? (
          <Link
            href={buildUrl(basePath, params, page + 1)}
            className="flex items-center gap-1 px-3 py-2 text-sm text-bsm-text-muted border border-bsm-border
              hover:border-gold/40 hover:text-gold transition-colors"
            aria-label="Página siguiente"
          >
            Siguiente
            <ChevronRight className="w-4 h-4" />
          </Link>
        ) : (
          <span className="flex items-center gap-1 px-3 py-2 text-sm text-[#3A3A3A] border border-[#1E1E1E] select-none">
            Siguiente
            <ChevronRight className="w-4 h-4" />
          </span>
        )}
      </div>

    </nav>
  )
}
