import { Globe } from 'lucide-react'
import { SOCIAL_META, SOCIAL_NETWORKS } from './SocialIcons'

interface SocialLinksProps {
  website?: string | null
  instagram?: string | null
  facebook_url?: string | null
  youtube_url?: string | null
  tiktok_url?: string | null
  linkedin_url?: string | null
  className?: string
  iconClassName?: string
}

function safeHref(url: string): string | null {
  try {
    const u = new URL(url)
    if (!['http:', 'https:'].includes(u.protocol)) return null
    return u.toString()
  } catch {
    return null
  }
}

function instagramHref(value: string): string | null {
  if (!value) return null
  if (value.startsWith('http')) return safeHref(value)
  const handle = value.replace('@', '').trim()
  return handle ? `https://www.instagram.com/${handle}/` : null
}

export default function SocialLinks({
  website,
  instagram,
  facebook_url,
  youtube_url,
  tiktok_url,
  linkedin_url,
  className = '',
  iconClassName = '',
}: SocialLinksProps) {
  const socialMap: Record<string, string | null | undefined> = {
    instagram: instagram,
    facebook:  facebook_url,
    youtube:   youtube_url,
    tiktok:    tiktok_url,
    linkedin:  linkedin_url,
  }

  const hasAny = website || SOCIAL_NETWORKS.some((k) => socialMap[k])
  if (!hasAny) return null

  const baseClass = `p-2 text-[#808080] hover:text-[#C9C9C9] transition-colors duration-150 ${iconClassName}`

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {website && safeHref(website) && (
        <a
          href={safeHref(website)!}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Web oficial"
          title="Web oficial"
          className={baseClass}
        >
          <Globe className="w-4 h-4" />
        </a>
      )}
      {SOCIAL_NETWORKS.map((network) => {
        const raw = socialMap[network]
        if (!raw) return null
        const href = network === 'instagram' ? instagramHref(raw) : safeHref(raw)
        if (!href) return null
        const { Icon, label } = SOCIAL_META[network]
        return (
          <a
            key={network}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={label}
            title={label}
            className={baseClass}
          >
            <Icon className="w-4 h-4" />
          </a>
        )
      })}
    </div>
  )
}
