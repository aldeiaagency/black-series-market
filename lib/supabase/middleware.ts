import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// One budget shared by every Supabase call in a middleware invocation. This
// leaves time to return a controlled response before Vercel's hard timeout.
const SUPABASE_REQUEST_BUDGET_MS = 2_500

function getSupabaseAuthCookieName() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!supabaseUrl) return null

  try {
    // Exact default storage key used by the installed supabase-js version.
    const projectRef = new URL(supabaseUrl).hostname.split('.')[0]
    return projectRef ? 'sb-' + projectRef + '-auth-token' : null
  } catch {
    return null
  }
}

const SUPABASE_AUTH_COOKIE_NAME = getSupabaseAuthCookieName()

function hasSupabaseAuthCookie(request: NextRequest) {
  if (!SUPABASE_AUTH_COOKIE_NAME) return false

  return request.cookies.getAll().some(({ name, value }) => {
    if (!value) return false
    if (name === SUPABASE_AUTH_COOKIE_NAME) return true

    // @supabase/ssr chunks large sessions as storage-key.0, .1, ...
    const chunkPrefix = SUPABASE_AUTH_COOKIE_NAME + '.'
    return name.startsWith(chunkPrefix)
      && /^\d+$/.test(name.slice(chunkPrefix.length))
  })
}

function getProtectedRouteLogin(pathname: string) {
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/cuenta')) {
    return '/login'
  }

  if (pathname.startsWith('/admin') && pathname !== '/admin-login') {
    return '/admin-login'
  }

  return null
}

function createBudgetedFetch(deadline: number): typeof fetch {
  return async (input, init) => {
    const remainingMs = deadline - Date.now()
    if (remainingMs <= 0) {
      throw new Error('Supabase middleware request budget exceeded')
    }

    const controller = new AbortController()
    const callerSignal = init?.signal
    const abortFromCaller = () => controller.abort()
    const timeout = setTimeout(() => controller.abort(), remainingMs)

    if (callerSignal?.aborted) controller.abort()
    else callerSignal?.addEventListener('abort', abortFromCaller, { once: true })

    try {
      return await fetch(input, { ...init, signal: controller.signal })
    } finally {
      clearTimeout(timeout)
      callerSignal?.removeEventListener('abort', abortFromCaller)
    }
  }
}

export async function updateSession(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const protectedRouteLogin = getProtectedRouteLogin(pathname)

  // With no session cookie there is nothing to validate or refresh. Keep all
  // anonymous public traffic independent from Supabase Auth.
  if (!hasSupabaseAuthCookie(request)) {
    if (protectedRouteLogin) {
      return NextResponse.redirect(new URL(protectedRouteLogin, request.url))
    }
    return NextResponse.next({ request })
  }

  try {
    return await updateAuthenticatedSession(request, pathname, protectedRouteLogin)
  } catch (error) {
    console.error('[middleware] Supabase middleware request failed', {
      pathname,
      error: error instanceof Error ? error.message : 'Unknown error',
    })

    // Public pages fail open. Protected pages never accept an unverified user.
    if (protectedRouteLogin) {
      return NextResponse.redirect(new URL(protectedRouteLogin, request.url))
    }
    return NextResponse.next({ request })
  }
}

async function updateAuthenticatedSession(
  request: NextRequest,
  pathname: string,
  protectedRouteLogin: string | null,
) {
  let supabaseResponse = NextResponse.next({ request })
  const deadline = Date.now() + SUPABASE_REQUEST_BUDGET_MS

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: { fetch: createBudgetedFetch(deadline) },
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

  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError) {
    console.error('[middleware] Supabase auth validation failed', {
      pathname,
      error: authError.message,
    })

    if (protectedRouteLogin) {
      return NextResponse.redirect(new URL(protectedRouteLogin, request.url))
    }
    return supabaseResponse
  }

  // Protected dealer dashboard — owner or team member
  if (pathname.startsWith('/dashboard')) {
    if (!user) return NextResponse.redirect(new URL('/login', request.url))

    // ¿Dueño directo?
    const { data: dealer, error: dealerError } = await supabase
      .from('dealers')
      .select('status')
      .eq('profile_id', user.id)
      .maybeSingle()
    if (dealerError) throw new Error(dealerError.message)

    if (dealer) {
      if (dealer.status === 'pending') {
        return NextResponse.redirect(new URL('/solicitud-enviada', request.url))
      }
    } else {
      // ¿Miembro del equipo de alguna organización? (RLS: lee su propia membresía)
      const { data: member, error: memberError } = await supabase
        .from('organization_members')
        .select('organization_id')
        .eq('user_id', user.id)
        .limit(1)
        .maybeSingle()
      if (memberError) throw new Error(memberError.message)

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
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    if (profileError) throw new Error(profileError.message)
    if (profile?.role !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  // Admin already logged in → skip /admin-login, go straight to panel
  if (pathname === '/admin-login' && user) {
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    if (profileError) throw new Error(profileError.message)
    if (profile?.role === 'admin') {
      return NextResponse.redirect(new URL('/admin', request.url))
    }
  }

  // Redirect already-logged-in users away from auth pages
  const isAuthPage = pathname === '/login' || pathname === '/registro' || pathname === '/registro-comprador'
  if (isAuthPage && user) {
    // Admin users at /login → send to admin panel
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    if (profileError) throw new Error(profileError.message)
    if (profile?.role === 'admin') {
      return NextResponse.redirect(new URL('/admin', request.url))
    }

    const { data: dealer, error: dealerError } = await supabase
      .from('dealers')
      .select('id, status')
      .eq('profile_id', user.id)
      .maybeSingle()
    if (dealerError) throw new Error(dealerError.message)

    if (dealer) {
      if (dealer.status === 'pending') {
        return NextResponse.redirect(new URL('/solicitud-enviada', request.url))
      }
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // Miembro del equipo (no es dueño) → al dashboard del showroom
    const { data: member, error: memberError } = await supabase
      .from('organization_members')
      .select('organization_id')
      .eq('user_id', user.id)
      .limit(1)
      .maybeSingle()
    if (memberError) throw new Error(memberError.message)
    if (member) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    if (pathname === '/registro' || pathname === '/registro-comprador') {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return supabaseResponse
}
