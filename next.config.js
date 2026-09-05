/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/busqueda-privada',
        destination: '/vehiculos-a-la-carta',
        permanent: true,
      },
      {
        // La landing B2B vivía fuera del namespace /profesionales/*. Movida a la
        // raíz del namespace (2026-09-05), aprovechando que el sitio nunca se ha
        // indexado (noindex desde el día uno): mover ahora no cuesta autoridad.
        source: '/para-profesionales',
        destination: '/profesionales',
        permanent: true,
      },
      {
        source: '/precios',
        destination: '/profesionales/planes',
        permanent: true,
      },
      {
        source: '/profesionales/precios',
        destination: '/profesionales/planes',
        permanent: true,
      },
      {
        source: '/registro',
        destination: '/profesionales/solicitar-acceso',
        permanent: true,
      },
      {
        source: '/politica-de-cookies',
        destination: '/legal/cookies',
        permanent: true,
      },
    ]
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 2678400, // 31 días: los assets de vehículos son inmutables
    remotePatterns: [
      { protocol: 'https', hostname: '*.supabase.co' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'logo.clearbit.com' },
      { protocol: 'https', hostname: 'i.ytimg.com' },
      { protocol: 'https', hostname: 'img.youtube.com' },
    ],
  },
  async headers() {
    // CSP con 'unsafe-inline' en script-src: el layout raíz tiene 3 <script> inline
    // sin nonce (JSON-LD x2 + el bootstrap de Consent Mode v2 que fija el consentimiento
    // por defecto en "denied" — GDPR) y GTM inyecta sus propios scripts/tags inline en
    // runtime. Un CSP estricto por nonce exigiría generar el nonce en middleware.ts y
    // enhebrarlo en cada script del árbol — fuera de alcance de este punto (SEC-9).
    // Dominios reales verificados en código, no asumidos: GTM/GA4 (ConsentManagedGtm.tsx,
    // layout.tsx), Supabase (createClient, imágenes ya en remotePatterns), YouTube embed
    // (VehicleGallery.tsx:419, único frame-src externo real). Stripe NO necesita entrada
    // aquí — el checkout es un <form> same-origin a /api/stripe/create-checkout que
    // redirige server-side, no hay Stripe.js ni iframe embebido (verificado, sin
    // `loadStripe`/`Elements` en el repo).
    // React Fast Refresh (HMR) de Next.js evalúa código con eval() en dev — no existe en
    // el bundle de producción. Si no se distingue el entorno, o se rompe el hot-reload en
    // local, o se relaja innecesariamente la CSP real de producción con 'unsafe-eval'
    // (comprobado: falla en dev sin esto, comprobar después que un build de producción
    // real no lo necesita).
    // *.clarity.ms confirmado con prueba real en navegador (2 subdominios distintos:
    // www.clarity.ms para el loader que inyecta GTM, scripts.clarity.ms para la librería
    // real — Clarity vive en el contenedor de Google, ningún grep del código lo habría
    // encontrado; wildcard en vez de fijar cada subdominio uno a uno).
    const scriptSrc = process.env.NODE_ENV === 'production'
      ? "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com https://*.clarity.ms"
      : "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://*.clarity.ms"

    const csp = [
      "default-src 'self'",
      scriptSrc,
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self' data:",
      "connect-src 'self' https://*.supabase.co https://www.googletagmanager.com https://www.google-analytics.com https://*.google-analytics.com https://*.clarity.ms",
      "frame-src 'self' https://www.youtube.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'self'",
      'upgrade-insecure-requests',
    ].join('; ')

    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()' },
          { key: 'Content-Security-Policy', value: csp },
        ],
      },
    ]
  },
  experimental: {
    serverActions: {
      allowedOrigins: [
        'localhost:3000',
        'blacklabelmarket.es',
        'www.blacklabelmarket.es',
      ],
    },
  },
}

module.exports = nextConfig
