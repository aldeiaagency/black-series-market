import { type EmailOtpType } from '@supabase/supabase-js'
import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Verifica los enlaces de email de Supabase (recovery, signup, email change) usando
// el token_hash. Este patrón NO depende del code-verifier en cookie, así que funciona
// aunque el usuario abra el email en otro dispositivo/navegador.
//
// La plantilla de email de Supabase debe apuntar aquí:
//   {{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery&next=/reset-password
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const next = searchParams.get('next') ?? '/'

  if (token_hash && type) {
    const supabase = await createClient()
    const { error } = await supabase.auth.verifyOtp({ type, token_hash })
    if (!error) {
      // Sesión establecida (en recovery es una sesión temporal para fijar contraseña).
      return NextResponse.redirect(new URL(next, request.url))
    }
  }

  // Enlace inválido o caducado → a la página de recuperación con aviso.
  return NextResponse.redirect(new URL('/recuperar?error=enlace_invalido', request.url))
}
