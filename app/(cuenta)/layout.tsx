import Header from '@/components/layout/Header'

export default function CuentaLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main>{children}</main>
    </>
  )
}
