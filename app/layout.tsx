import type { Metadata } from 'next'
import { Inter, Cormorant_Garamond } from 'next/font/google'
import './globals.css'

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
  title: {
    default: 'Black Label Market | Coches y motos premium, deportivos y especiales',
    template: '%s | Black Label Market',
  },
  description:
    'Marketplace curado de coches y motos premium, deportivos, clásicos y unidades especiales. Publicados por concesionarios y especialistas seleccionados.',
  keywords: ['coches premium', 'motos deportivas', 'superdeportivos', 'clásicos', 'Ferrari', 'Lamborghini', 'Porsche', 'marketplace curado', 'vehículos especiales'],
  openGraph: {
    title: 'Black Label Market',
    description: 'Marketplace curado de coches y motos premium, deportivos, clásicos y unidades especiales.',
    type: 'website',
    locale: 'es_ES',
  },
  robots: { index: true, follow: true },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className={`${inter.variable} ${cormorant.variable}`}>
      <body className="bg-obsidian text-bsm-text-primary antialiased">
        {children}
      </body>
    </html>
  )
}
