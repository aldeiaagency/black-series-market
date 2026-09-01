import type { Metadata } from 'next'
import { Inter, Cormorant_Garamond } from 'next/font/google'
import './globals.css'
import { ComparatorProvider } from '@/lib/comparator-context'
import CookieConsentBanner from '@/components/legal/CookieConsentBanner'
import ConsentManagedGtm from '@/components/legal/ConsentManagedGtm'
import AcquisitionCapture from '@/components/analytics/AcquisitionCapture'
import { createAdminClient } from '@/lib/supabase/server'
import { rootRobotsMeta } from '@/lib/seo'

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
  // Gate G01: controlado por el flag único SITE_INDEXABLE (lib/seo.ts). Hoy = noindex.
  robots: rootRobotsMeta,
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
    'https://www.facebook.com/blacklabel.es',
    'https://www.youtube.com/@BlackLabelPremium',
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
  let gtmId: string | null = null
  try {
    const admin = await createAdminClient()
    const { data } = await admin
      .from('platform_config')
      .select('value')
      .eq('key', 'seo')
      .single()
    gtmId = data?.value?.gtm_id || null
  } catch {}

  return (
    <html lang="es" className={`${inter.variable} ${cormorant.variable}`}>
      <body className="bg-obsidian text-bsm-text-primary antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteJsonLd) }}
        />
        {/* Consent Mode v2 — defaults denied; restores prior consent from localStorage */}
        <script dangerouslySetInnerHTML={{ __html: `
window.dataLayer=window.dataLayer||[];
function gtag(){dataLayer.push(arguments);}
gtag('consent','default',{
  analytics_storage:'denied',
  ad_storage:'denied',
  ad_personalization:'denied',
  personalization_storage:'denied',
  functionality_storage:'granted',
  security_storage:'granted',
  wait_for_update:500
});
gtag('set','ads_data_redaction',true);
gtag('set','url_passthrough',true);
try{
  var _blm=localStorage.getItem('black_label_cookie_consent');
  if(_blm){var _c=JSON.parse(_blm);if(_c.version==='1.0'){gtag('consent','update',{
    analytics_storage:_c.analytics?'granted':'denied',
    ad_storage:_c.marketing?'granted':'denied',
    ad_personalization:_c.marketing?'granted':'denied',
    personalization_storage:_c.marketing?'granted':'denied'
  });}}
}catch(e){}
        `.trim() }} />
        <ComparatorProvider>
          {children}
        </ComparatorProvider>
        <CookieConsentBanner />
        <AcquisitionCapture />
        <ConsentManagedGtm gtmId={gtmId} />
      </body>
    </html>
  )
}
