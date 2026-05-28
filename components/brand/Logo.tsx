import Image from 'next/image'

interface LogoProps {
  className?: string
  width?: number
  variant?: 'header' | 'footer' | 'full'
}

export default function Logo({ className, width = 148, variant = 'header' }: LogoProps) {
  const height = Math.round(width * (66 / 233))
  return (
    <Image
      src="/brand/black-label-market-logo.webp"
      alt="Black Label Market"
      width={width}
      height={height}
      className={className}
      priority={variant === 'header'}
    />
  )
}
