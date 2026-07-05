// Interruptor ÚNICO de indexabilidad del sitio (gate G01 pre-lanzamiento).
//
// Mientras sea false, TODO el sitio va `noindex, nofollow` (metadata en app/layout.tsx) y el
// robots.txt hace `disallow: /` (app/robots.ts). Es el estado actual: no hay stock real todavía.
//
// Para LANZAR (decisión humana explícita — ver CLAUDE.md §6): poner en Vercel la variable
// NEXT_PUBLIC_SITE_INDEXABLE=true y redeploy. Un solo cambio activa a la vez el robots y la
// metadata, sin riesgo de dejar uno de los dos incoherente. No hace falta tocar código.
export const SITE_INDEXABLE = process.env.NEXT_PUBLIC_SITE_INDEXABLE === 'true'

// Valor para `metadata.robots` del layout raíz, coherente con el gate.
// Las páginas thin/privadas (buscar, comparar, favoritos, categorías vacías) siguen poniendo su
// propio `robots: { index: false }`, que prevalece sobre este por página.
export const rootRobotsMeta = SITE_INDEXABLE
  ? { index: true, follow: true }
  : { index: false, follow: false }
