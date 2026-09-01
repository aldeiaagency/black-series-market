import { CheckCircle, AlertCircle } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = { robots: { index: false, follow: false } }

export default async function SeleccionMensualConfirmadoPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const { status } = await searchParams
  const success = status === 'ok'

  return (
    <div className="max-w-screen-sm mx-auto px-6 pt-40 pb-24 text-center">
      {success ? (
        <>
          <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto mb-4" />
          <h1 className="font-display text-2xl font-light text-bsm-text-primary mb-2">Suscripción confirmada</h1>
          <p className="text-sm text-bsm-text-muted max-w-xs mx-auto">
            Ya formas parte de la selección mensual de Black Label Market. Te avisaremos cuando salga la
            próxima edición.
          </p>
          <p className="text-[11px] text-bsm-text-muted mt-4">
            Puedes cambiar tus temas o darte de baja desde el enlace de cualquier envío.
          </p>
        </>
      ) : (
        <>
          <AlertCircle className="w-10 h-10 text-bsm-text-muted mx-auto mb-4" />
          <h1 className="font-display text-2xl font-light text-bsm-text-primary mb-2">Este enlace ya no es válido</h1>
          <p className="text-sm text-bsm-text-muted max-w-xs mx-auto">
            Puede que ya estuvieras suscrito, o que el enlace haya caducado. Pide uno nuevo desde la página
            de selección mensual.
          </p>
        </>
      )}
    </div>
  )
}
