import { CheckCircle, AlertCircle } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = { robots: { index: false, follow: false } }

export default async function SeguimientoGraciasPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string }>
}) {
  const { ok } = await searchParams
  const success = ok === '1'

  return (
    <div className="max-w-screen-sm mx-auto px-6 pt-40 pb-24 text-center">
      {success ? (
        <>
          <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto mb-4" />
          <h1 className="font-display text-2xl font-light text-bsm-text-primary mb-2">Gracias por responder</h1>
          <p className="text-sm text-bsm-text-muted">Hemos registrado tu respuesta.</p>
        </>
      ) : (
        <>
          <AlertCircle className="w-10 h-10 text-bsm-text-muted mx-auto mb-4" />
          <h1 className="font-display text-2xl font-light text-bsm-text-primary mb-2">Enlace no válido</h1>
          <p className="text-sm text-bsm-text-muted">Puede que ya hubieras respondido antes, o que el enlace haya caducado.</p>
        </>
      )}
    </div>
  )
}
