import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Mis favoritos',
  robots: { index: false, follow: false },
}

export default function MisFavoritosLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
