interface LogoProps {
  className?: string
  width?: number
  variant?: 'header' | 'footer' | 'full'
}

export default function Logo({ className, width = 148, variant = 'header' }: LogoProps) {
  const isFooter = variant === 'footer'
  const isFull   = variant === 'full'
  const isHeader = variant === 'header'

  // ViewBox dimensions per variant
  const vbW = 280
  const vbH = isFull ? 180 : isHeader ? 74 : 44
  const h   = Math.round(width * (vbH / vbW))

  // Y positions per variant
  const monoY = isFull ? 88  : 38   // BL monogram baseline
  const mainY = isFull ? 116 : isHeader ? 56 : 26  // BLACK LABEL
  const ruleY = isFull ? 140 : isHeader ? 66 : 38  // rules
  const mktY  = isFull ? 148 : isHeader ? 73 : 44  // MARKET

  // Font sizes per variant
  const monoSize = isFull ? 78 : 38
  const mainSize = isFull ? 26 : isHeader ? 21 : 22
  const mainLS   = isFull ? 11 : isHeader ? 9  : 9
  const mktSize  = isFull ? 9  : isHeader ? 7.5 : 8
  const mktLS    = isFull ? 7  : 6

  // Rule x positions
  const ruleX1L = isFull ? 14  : 22
  const ruleX2L = isFull ? 72  : isHeader ? 68 : 62
  const ruleX1R = isFull ? 208 : isHeader ? 212 : 218
  const ruleX2R = isFull ? 266 : 258

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
          <stop offset="0%"   stopColor="#E8E8E8" />
          <stop offset="28%"  stopColor="#D0D0D0" />
          <stop offset="60%"  stopColor="#B8B8B8" />
          <stop offset="100%" stopColor="#989898" />
        </linearGradient>
        <linearGradient id="blm-muted" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#B4B4B4" />
          <stop offset="100%" stopColor="#787878" />
        </linearGradient>
        <linearGradient id="blm-mono" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%"   stopColor="#787878" />
          <stop offset="22%"  stopColor="#C8C8C8" />
          <stop offset="45%"  stopColor="#F0F0F0" />
          <stop offset="68%"  stopColor="#C0C0C0" />
          <stop offset="100%" stopColor="#787878" />
        </linearGradient>
      </defs>

      {/* BL Monogram — header and full variants */}
      {(isHeader || isFull) && (
        <text
          x="140"
          y={monoY}
          fontFamily="var(--font-cormorant), 'Cormorant Garamond', Georgia, serif"
          fontSize={monoSize}
          fontWeight="300"
          letterSpacing={isFull ? -5 : -4}
          textAnchor="middle"
          fill="url(#blm-mono)"
        >
          BL
        </text>
      )}

      {/* Thin separator under monogram in header */}
      {isHeader && (
        <line
          x1="105" y1="42" x2="175" y2="42"
          stroke="url(#blm-muted)" strokeWidth="0.4"
        />
      )}

      {/* BLACK LABEL */}
      <text
        x="140"
        y={mainY}
        fontFamily="var(--font-cormorant), 'Cormorant Garamond', Georgia, serif"
        fontSize={mainSize}
        fontWeight="300"
        letterSpacing={mainLS}
        textAnchor="middle"
        fill="url(#blm-chrome)"
      >
        BLACK LABEL
      </text>

      {/* Left rule */}
      <line x1={ruleX1L} y1={ruleY} x2={ruleX2L} y2={ruleY}
        stroke="url(#blm-muted)" strokeWidth="0.55" />

      {/* MARKET */}
      <text
        x="140"
        y={mktY}
        fontFamily="var(--font-inter), system-ui, sans-serif"
        fontSize={mktSize}
        fontWeight="400"
        letterSpacing={mktLS}
        textAnchor="middle"
        fill="url(#blm-muted)"
      >
        MARKET
      </text>

      {/* Right rule */}
      <line x1={ruleX1R} y1={ruleY} x2={ruleX2R} y2={ruleY}
        stroke="url(#blm-muted)" strokeWidth="0.55" />
    </svg>
  )
}
