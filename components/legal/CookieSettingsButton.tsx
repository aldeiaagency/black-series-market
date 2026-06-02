'use client'

export default function CookieSettingsButton({ className }: { className?: string }) {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new CustomEvent('open-cookie-settings'))}
      className={className}
    >
      Configurar cookies
    </button>
  )
}
