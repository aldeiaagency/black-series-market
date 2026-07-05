import { MetadataRoute } from 'next'
import { SITE_INDEXABLE } from '@/lib/seo'

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://blacklabelmarket.es'

// Gate G01 — el robots.txt lo controla el flag ÚNICO SITE_INDEXABLE (lib/seo.ts), el mismo
// que el noindex de la metadata en app/layout.tsx. Mientras sea false: disallow total.
// Para lanzar: NEXT_PUBLIC_SITE_INDEXABLE=true en Vercel (un solo cambio activa ambos).
export default function robots(): MetadataRoute.Robots {
  if (!SITE_INDEXABLE) {
    return {
      rules: [{ userAgent: '*', disallow: ['/'] }],
      sitemap: `${BASE_URL}/sitemap.xml`,
    }
  }

  // ── POST-LANZAMIENTO ──
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin',
          '/admin/',
          '/dashboard',
          '/dashboard/',
          '/api/',
          '/buscar',          // thin — noindex individual
          '/comparar',        // thin — noindex individual
          '/mis-favoritos',   // auth — noindex individual
          '/busqueda-privada',
          '/cuenta/',
          '/login',
          '/registro',
          '/registro-comprador',
          '/admin-login',
        ],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  }
}
