interface LogoProps {
  className?: string
  width?: number
  variant?: 'header' | 'footer' | 'full'
}

export default function Logo({ className, width = 148, variant = 'header' }: LogoProps) {
  const isFooter = variant === 'footer'
  const isFull = variant === 'full'

  const baseH = isFull ? 180 : 44
  const vbW = 280
  const vbH = isFull ? 180 : 44
  const h = Math.round(width * (vbH / vbW))

  const mainY = isFull ? 116 : 26
  const ruleY = isFull ? 140 : 38
  const mktY = isFull ? 148 : 44

  return (
    <svg
      width={width}
      height={h}
      viewBox={`0 0 ${vbW} ${vbH}`}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Black Label Market"
      className={className}
    >
      <defs>
        <linearGradient id="blm-chrome" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#E0E0E0" />
          <stop offset="35%" stopColor="#CCCCCC" />
          <stop offset="65%" stopColor="#B8B8B8" />
          <stop offset="100%" stopColor="#A0A0A0" />
        </linearGradient>
        <linearGradient id="blm-muted" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#B4B4B4" />
          <stop offset="100%" stopColor="#848484" />
        </linearGradient>
        {isFull && (
          <linearGradient id="blm-mono" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#787878" />
            <stop offset="22%" stopColor="#CACACA" />
            <stop offset="45%" stopColor="#F0F0F0" />
            <stop offset="68%" stopColor="#C0C0C0" />
            <stop offset="100%" stopColor="#787878" />
          </linearGradient>
        )}
      </defs>

      {/* BL Monogram — full variant only */}
      {isFull && (
        <text
          x="140"
          y="88"
          fontFamily="var(--font-cormorant), 'Cormorant Garamond', Georgia, serif"
          fontSize="78"
          fontWeight="300"
          letterSpacing="-5"
          textAnchor="middle"
          fill="url(#blm-mono)"
        >
          BL
        </text>
      )}

      {/* BLACK LABEL */}
      <text
        x="140"
        y={mainY}
        fontFamily="var(--font-cormorant), 'Cormorant Garamond', Georgia, serif"
        fontSize={isFull ? 26 : 22}
        fontWeight="300"
        letterSpacing={isFull ? 11 : 9}
        textAnchor="middle"
        fill="url(#blm-chrome)"
      >
        BLACK LABEL
      </text>

      {/* Left rule */}
      <line x1={isFull ? 14 : 10} y1={ruleY} x2={isFull ? 72 : 62} y2={ruleY}
        stroke="url(#blm-muted)" strokeWidth="0.55" />

      {/* MARKET */}
      <text
        x="140"
        y={mktY}
        fontFamily="var(--font-inter), system-ui, sans-serif"
        fontSize={isFull ? 9 : 8}
        fontWeight="400"
        letterSpacing={isFull ? 7 : 6}
        textAnchor="middle"
        fill="url(#blm-muted)"
      >
        MARKET
      </text>

      {/* Right rule */}
      <line x1={isFull ? 208 : 218} y1={ruleY} x2={isFull ? 266 : 270} y2={ruleY}
        stroke="url(#blm-muted)" strokeWidth="0.55" />
    </svg>
  )
}
