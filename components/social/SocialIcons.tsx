import { FaInstagram, FaFacebookF, FaYoutube, FaTiktok, FaLinkedinIn } from 'react-icons/fa'
import type { IconType } from 'react-icons'

export type SocialNetwork = 'instagram' | 'facebook' | 'youtube' | 'tiktok' | 'linkedin'

export const SOCIAL_META: Record<SocialNetwork, { Icon: IconType; label: string }> = {
  instagram: { Icon: FaInstagram, label: 'Instagram' },
  facebook:  { Icon: FaFacebookF, label: 'Facebook'  },
  youtube:   { Icon: FaYoutube,   label: 'YouTube'   },
  tiktok:    { Icon: FaTiktok,    label: 'TikTok'    },
  linkedin:  { Icon: FaLinkedinIn, label: 'LinkedIn' },
}

export const SOCIAL_NETWORKS: SocialNetwork[] = ['instagram', 'facebook', 'youtube', 'tiktok', 'linkedin']
