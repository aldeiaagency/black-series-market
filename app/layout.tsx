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
    default: 'Black Series Market — Vehículos Premium y de Lujo',
    template: '%s | Black Series Market',
  },
  description:
    'El marketplace de referencia para coches y motos premium, de lujo, superdeportivos e hipercoches en España y Europa. Encuentra y publica vehículos exclusivos.',
  keywords: ['coches lujo', 'superdeportivos', 'hipercoches', 'Ferrari', 'Lamborghini', 'Porsche', 'marketplace premium'],
  openGraph: {
    title: 'Black Series Market',
    description: 'El marketplace de referencia para vehículos premium y de lujo',
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
