// Tokens de marca del sistema visual de Instagram — aprobados en
// agency/diseno_calendario_contenidos_2026-08-30.md §12 punto 1. Fijos: este sistema
// no responde al tema del visor (es un asset final exportado, no una UI).
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const fontsDir = path.join(__dirname, 'fonts')
const fontUrl = (name) => `file://${path.join(fontsDir, name).replace(/\\/g, '/')}`

export const COLORS = {
  ink: '#0A0A0A',
  gold: '#C6A64B',
  goldSoft: '#8C7A50',
  paper: '#EDE7D9',
  muted: '#9C9689',
  line: '#2A2A26',
}

export const FONT_FACES = `
  @font-face { font-family:'Display'; src:url('${fontUrl('playfair-900.woff2')}') format('woff2'); font-weight:900; font-style:normal; }
  @font-face { font-family:'Display'; src:url('${fontUrl('playfair-700.woff2')}') format('woff2'); font-weight:700; font-style:normal; }
  @font-face { font-family:'Display'; src:url('${fontUrl('playfair-500italic.woff2')}') format('woff2'); font-weight:500; font-style:italic; }
  @font-face { font-family:'Display'; src:url('${fontUrl('playfair-700italic.woff2')}') format('woff2'); font-weight:700; font-style:italic; }
  @font-face { font-family:'Util'; src:url('${fontUrl('archivo-400.woff2')}') format('woff2'); font-weight:400; font-style:normal; }
  @font-face { font-family:'Util'; src:url('${fontUrl('archivo-500.woff2')}') format('woff2'); font-weight:500; font-style:normal; }
  @font-face { font-family:'Util'; src:url('${fontUrl('archivo-600.woff2')}') format('woff2'); font-weight:600; font-style:normal; }
`

// Dimensiones reales de exportación — nunca escaladas, el renderer dispara el
// viewport exacto para cada formato.
export const DIMENSIONS = {
  feed: { width: 1080, height: 1350 },
  story: { width: 1080, height: 1920 },
}

// Tratamiento estándar de foto — saturación −8%, contraste +6%, viñeta sutil.
// Prohibido en el diseño aprobado: HDR, filtros de moda, B/N genérico.
export const PHOTO_FILTER = 'saturate(0.92) contrast(1.06) brightness(0.99)'
