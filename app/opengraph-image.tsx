import { ImageResponse } from 'next/og'

export const alt = 'Black Label Market — Coches y motos premium en España'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          background: '#080808',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '72px 96px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative circle top-right */}
        <div
          style={{
            position: 'absolute',
            top: -120,
            right: -80,
            width: 480,
            height: 480,
            borderRadius: '50%',
            border: '1px solid #1C1C1C',
            display: 'flex',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: -60,
            right: -20,
            width: 360,
            height: 360,
            borderRadius: '50%',
            border: '1px solid #C6A64B18',
            display: 'flex',
          }}
        />

        {/* Top: gold line + label */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 36, height: 1, background: '#C6A64B', display: 'flex' }} />
          <span
            style={{
              color: '#C6A64B',
              fontSize: 11,
              letterSpacing: '0.3em',
              fontFamily: 'sans-serif',
              textTransform: 'uppercase',
            }}
          >
            marketplace premium
          </span>
        </div>

        {/* Center: main headline */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          <div
            style={{
              fontSize: 80,
              fontWeight: 300,
              color: '#F4F1EA',
              fontFamily: 'serif',
              letterSpacing: '-0.01em',
              lineHeight: 1,
              display: 'flex',
            }}
          >
            Black Label
          </div>
          <div
            style={{
              fontSize: 80,
              fontWeight: 700,
              color: '#F4F1EA',
              fontFamily: 'sans-serif',
              letterSpacing: '0.05em',
              lineHeight: 1,
              textTransform: 'uppercase',
              display: 'flex',
            }}
          >
            Market
          </div>
          <div
            style={{
              width: 48,
              height: 1,
              background: '#2A2A2A',
              margin: '28px 0',
              display: 'flex',
            }}
          />
          <div
            style={{
              fontSize: 22,
              color: '#8A8A8A',
              fontFamily: 'sans-serif',
              fontWeight: 400,
              letterSpacing: '0.02em',
              display: 'flex',
            }}
          >
            Coches y motos premium en España
          </div>
        </div>

        {/* Bottom: URL */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span
            style={{
              fontSize: 14,
              color: '#C6A64B',
              fontFamily: 'sans-serif',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
            }}
          >
            blacklabelmarket.es
          </span>
          <span
            style={{
              fontSize: 12,
              color: '#3A3A3A',
              fontFamily: 'sans-serif',
              letterSpacing: '0.1em',
            }}
          >
            Concesionarios y especialistas verificados
          </span>
        </div>
      </div>
    ),
    { ...size }
  )
}
