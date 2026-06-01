import type { Metadata } from 'next'
import { Inter, Cormorant_Garamond } from 'next/font/google'
import './globals.css'
import { ComparatorProvider } from '@/lib/comparator-context'

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
        <ComparatorProvider>
          {children}
        </ComparatorProvider>
      </body>
    </html>
  )
}
