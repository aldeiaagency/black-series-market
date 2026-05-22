import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-obsidian flex items-center justify-center px-6">
      <div className="text-center">
        <div className="font-display text-8xl font-light text-gold/20 mb-4">404</div>
        <h1 className="font-display text-3xl font-light text-bsm-text-primary mb-3">
          Página no encontrada
        </h1>
        <p className="text-bsm-text-muted mb-8 max-w-sm mx-auto">
          El vehículo o página que buscas no existe o ha sido eliminado.
        </p>
        <Link href="/" className="btn-gold">
          <ArrowLeft className="w-4 h-4" />
          Volver al marketplace
        </Link>
      </div>
    </div>
  )
}
