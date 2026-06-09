import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contacto',
  description: 'Contacta con el equipo de Black Label Market. Dudas sobre publicación de vehículos, acceso de compradores, gestión de cuenta o cualquier consulta sobre el marketplace premium.',
  alternates: { canonical: '/contacto' },
}

export default function ContactoLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
