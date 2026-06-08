import type { Metadata } from 'next'
import { Inter, Cormorant_Garamond } from 'next/font/google'
import './globals.css'
import { ComparatorProvider } from '@/lib/comparator-context'
import CookieConsentBanner from '@/components/legal/CookieConsentBanner'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://blacklabelmarket.es'),
  title: {
    default: 'Black Label Market | Coches y motos premium en España',
    template: '%s | Black Label Market',
  },
  description:
    'Coches y motos premium, deportivos, clásicos y unidades especiales en venta en España. Concesionarios, compraventas y especialistas verificados.',
  keywords: [
    'coches premium', 'motos premium', 'superdeportivos', 'coches clásicos', 'motos clásicas',
    'Ferrari', 'Lamborghini', 'Porsche', 'Ducati', 'BMW',
    'vehículos especiales', 'concesionarios verificados', 'compraventa premium', 'España',
  ],
  openGraph: {
    title: 'Black Label Market | Coches y motos premium en España',
    description: 'Coches y motos premium, deportivos, clásicos y unidades especiales. Concesionarios y especialistas verificados.',
    type: 'website',
    locale: 'es_ES',
  },
  robots: { index: false, follow: false },
}

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://blacklabelmarket.es'

// Organization schema for AI engines and rich results. "Black Label Market" is the
// marketplace; KAZAWEB, S.L.U. is the legal entity; Black Series is the creating agency.
const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Black Label Market',
  legalName: 'KAZAWEB, S.L.U.',
  url: SITE_URL,
  description:
    'Marketplace de coches y motos premium, deportivos, clásicos y unidades especiales en España, con concesionarios y especialistas verificados.',
  brand: { '@type': 'Brand', name: 'Black Label Market' },
  creator: { '@type': 'Organization', name: 'Black Series' },
  areaServed: 'ES',
  email: 'hola@blacklabelmarket.es',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className={`${inter.variable} ${cormorant.variable}`}>
      <body className="bg-obsidian text-bsm-text-primary antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <ComparatorProvider>
          {children}
        </ComparatorProvider>
        <CookieConsentBanner />
      </body>
    </html>
  )
}
