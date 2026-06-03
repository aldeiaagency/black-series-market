'use client'

import { useEffect, useState } from 'react'
import { SOCIAL_META, SOCIAL_NETWORKS } from './SocialIcons'

interface MarketSocialLinksProps {
  className?: string
  iconClassName?: string
  initialLinks?: Record<string, string>
}

export default function MarketSocialLinks({
  className = '',
  iconClassName = '',
  initialLinks,
}: MarketSocialLinksProps) {
  const [links, setLinks] = useState<Record<string, string>>(initialLinks || {})

  useEffect(() => {
    if (initialLinks) return
    fetch('/api/platform/social-links')
      .then((r) => r.json())
      .then((data) => setLinks(data || {}))
      .catch(() => {})
  }, [initialLinks])

  const activeLinks = SOCIAL_NETWORKS.filter((n) => links[n]?.trim())
  if (!activeLinks.length) return null

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {activeLinks.map((network) => {
        const { Icon, label } = SOCIAL_META[network]
        return (
          <a
            key={network}
            href={links[network]}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${label} de Black Label Market`}
            title={`${label} de Black Label Market`}
            className={`p-1.5 text-[#808080] hover:text-[#C9C9C9] transition-colors duration-150 ${iconClassName}`}
          >
            <Icon className="w-3.5 h-3.5" />
          </a>
        )
      })}
    </div>
  )
}
