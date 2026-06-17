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

  // Protected dealer dashboard — owner or team member
  if (pathname.startsWith('/dashboard')) {
    if (!user) return NextResponse.redirect(new URL('/login', request.url))

    // ¿Dueño directo?
    const { data: dealer } = await supabase
      .from('dealers')
      .select('status')
      .eq('profile_id', user.id)
      .maybeSingle()

    if (dealer) {
      if (dealer.status === 'pending') {
        return NextResponse.redirect(new URL('/solicitud-enviada', request.url))
      }
    } else {
      // ¿Miembro del equipo de alguna organización? (RLS: lee su propia membresía)
      const { data: member } = await supabase
        .from('organization_members')
        .select('organization_id')
        .eq('user_id', user.id)
        .limit(1)
        .maybeSingle()

      if (!member) return NextResponse.redirect(new URL('/registro', request.url))
      // Miembro válido → el layout resuelve showroom y permisos.
    }
  }

  // Protected buyer/account routes
  if (pathname.startsWith('/cuenta') && !user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Protected admin routes (/admin-login is the entry point — must remain public)
  if (pathname.startsWith('/admin') && pathname !== '/admin-login') {
    if (!user) return NextResponse.redirect(new URL('/admin-login', request.url))
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    if (profile?.role !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  // Admin already logged in → skip /admin-login, go straight to panel
  if (pathname === '/admin-login' && user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    if (profile?.role === 'admin') {
      return NextResponse.redirect(new URL('/admin', request.url))
    }
  }

  // Redirect already-logged-in users away from auth pages
  const isAuthPage = pathname === '/login' || pathname === '/registro' || pathname === '/registro-comprador'
  if (isAuthPage && user) {
    // Admin users at /login → send to admin panel
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    if (profile?.role === 'admin') {
      return NextResponse.redirect(new URL('/admin', request.url))
    }

    const { data: dealer } = await supabase
      .from('dealers')
      .select('id, status')
      .eq('profile_id', user.id)
      .maybeSingle()

    if (dealer) {
      if (dealer.status === 'pending') {
        return NextResponse.redirect(new URL('/solicitud-enviada', request.url))
      }
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // Miembro del equipo (no es dueño) → al dashboard del showroom
    const { data: member } = await supabase
      .from('organization_members')
      .select('organization_id')
      .eq('user_id', user.id)
      .limit(1)
      .maybeSingle()
    if (member) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    if (pathname === '/registro' || pathname === '/registro-comprador') {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return supabaseResponse
}
