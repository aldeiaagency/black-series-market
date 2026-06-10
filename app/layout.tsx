import type { Metadata } from 'next'
import { Inter, Cormorant_Garamond } from 'next/font/google'
import Script from 'next/script'
import './globals.css'
import { ComparatorProvider } from '@/lib/comparator-context'
import CookieConsentBanner from '@/components/legal/CookieConsentBanner'
import { createAdminClient } from '@/lib/supabase/server'

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
  openGraph: {
    title: 'Black Label Market | Coches y motos premium en España',
    description: 'Coches y motos premium, deportivos, clásicos y unidades especiales. Concesionarios y especialistas verificados.',
    type: 'website',
    locale: 'es_ES',
    siteName: 'Black Label Market',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Black Label Market | Coches y motos premium en España',
    description: 'Coches y motos premium, deportivos, clásicos y unidades especiales. Concesionarios y especialistas verificados.',
  },
  robots: { index: false, follow: false },
}

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://blacklabelmarket.es'

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': `${SITE_URL}/#organization`,
  name: 'Black Label Market',
  legalName: 'KAZAWEB, S.L.U.',
  url: SITE_URL,
  logo: {
    '@type': 'ImageObject',
    url: `${SITE_URL}/brand/black-label-market-logo.webp`,
    width: 693,
    height: 324,
  },
  description:
    'Marketplace de coches y motos premium, deportivos, clásicos y unidades especiales en España, con concesionarios y especialistas verificados.',
  brand: { '@type': 'Brand', name: 'Black Label Market' },
  creator: { '@type': 'Organization', name: 'Black Series', url: 'https://blackseriesagency.es' },
  areaServed: 'ES',
  email: 'hola@blacklabelmarket.es',
  sameAs: [
    'https://www.instagram.com/blacklabel_premiumcars/',
    'https://www.tiktok.com/@blacklabelmarket.es',
    'https://www.youtube.com/@BlackLabelPremium',
    'https://www.linkedin.com/company/black-label-market-premiumcars/',
    'https://www.facebook.com/blacklabel.es',
  ],
}

const webSiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${SITE_URL}/#website`,
  name: 'Black Label Market',
  url: SITE_URL,
  description: 'Marketplace de coches y motos premium en España.',
  inLanguage: 'es-ES',
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${SITE_URL}/buscar?q={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  },
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  let gaId: string | null = null
  let gtmId: string | null = null
  try {
    const admin = await createAdminClient()
    const { data } = await admin
      .from('platform_config')
      .select('value')
      .eq('key', 'seo')
      .single()
    gaId = data?.value?.ga_id || null
    gtmId = data?.value?.gtm_id || null
  } catch {}

  return (
    <html lang="es" className={`${inter.variable} ${cormorant.variable}`}>
      <body className="bg-obsidian text-bsm-text-primary antialiased">
        {gtmId && (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
              height="0"
              width="0"
              style={{ display: 'none', visibility: 'hidden' }}
            />
          </noscript>
        )}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteJsonLd) }}
        />
        <ComparatorProvider>
          {children}
        </ComparatorProvider>
        <CookieConsentBanner />
        {gaId && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
              strategy="afterInteractive"
            />
            <Script id="ga4-init" strategy="afterInteractive">{`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${gaId}');
            `}</Script>
          </>
        )}
        {gtmId && (
          <Script id="gtm-init" strategy="afterInteractive">{`
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','${gtmId}');
          `}</Script>
        )}
      </body>
    </html>
  )
}
