import type { Metadata } from 'next'
import { JsonLd } from '@/components/seo/JsonLd'

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://blacklabelmarket.es'

export const metadata: Metadata = {
  title: 'Contacto | Black Label Market',
  description: 'Contacta con el equipo de Black Label Market. Dudas sobre publicación de vehículos, acceso de compradores, gestión de cuenta o cualquier consulta sobre el marketplace premium.',
  alternates: { canonical: '/contacto' },
  openGraph: {
    title: 'Contacto | Black Label Market',
    description: 'Contacta con el equipo de Black Label Market. Preguntas sobre planes, publicación de vehículos o cualquier consulta sobre el marketplace premium.',
    url: 'https://blacklabelmarket.es/contacto',
    siteName: 'Black Label Market',
    type: 'website',
  },
}

const webPageJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ContactPage',
  '@id': `${SITE_URL}/contacto`,
  name: 'Contacto — Black Label Market',
  description: 'Contacta con el equipo de Black Label Market para preguntas sobre planes, publicación de vehículos o cualquier consulta sobre el marketplace premium.',
  url: `${SITE_URL}/contacto`,
  inLanguage: 'es-ES',
  isPartOf: { '@type': 'WebSite', '@id': `${SITE_URL}/#website` },
}

export default function ContactoLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd data={webPageJsonLd} />
      {children}
    </>
  )
}
