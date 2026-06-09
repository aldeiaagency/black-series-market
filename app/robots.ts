import { MetadataRoute } from 'next'

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://blacklabelmarket.es'

// G01 GATE — pre-lanzamiento: disallow todo.
// Cuando estés listo para lanzar: cambia la regla de '*' por las dos reglas del bloque comentado de abajo
// y quita robots: { index: false } de app/layout.tsx.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        disallow: ['/'],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  }
}

/*
// ── POST-LANZAMIENTO (G01) ──────────────────────────────────────────────────
// Sustituir el bloque anterior por este cuando se quite el noindex global:

export default function robots(): MetadataRoute.Robots {
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
// ────────────────────────────────────────────────────────────────────────────
*/
