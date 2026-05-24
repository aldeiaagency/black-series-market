import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname

  // Protected dealer routes
  if (pathname.startsWith('/dashboard') && !user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Protected buyer/account routes
  if (pathname.startsWith('/cuenta') && !user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Protected admin routes
  if (pathname.startsWith('/admin')) {
    if (!user) return NextResponse.redirect(new URL('/login', request.url))
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    if (profile?.role !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  // Redirect already-logged-in users away from auth pages
  const isAuthPage = pathname === '/login' || pathname === '/registro' || pathname === '/registro-comprador'
  if (isAuthPage && user) {
    const { data: dealer } = await supabase
      .from('dealers')
      .select('id')
      .eq('profile_id', user.id)
      .single()

    if (dealer) {
      // Dealer trying to access auth pages → send to dashboard
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    // Buyer logged in: allow /login (to sign out); redirect /registro and /registro-comprador away
    if (pathname === '/registro' || pathname === '/registro-comprador') {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return supabaseResponse
}
