import { NextRequest, NextResponse } from 'next/server'
import { randomInt } from 'crypto'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { findAuthUserByEmail } from '@/lib/supabase/admin-helpers'
import { getDealerAccess } from '@/lib/dealer-access'
import { getPermissions, ASSIGNABLE_ROLES, type OrgRole } from '@/lib/permissions'
import { getEntitlements } from '@/lib/entitlements'

const TEMP_PASSWORD_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789'
const TEMP_PASSWORD_LETTERS = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'
const TEMP_PASSWORD_DIGITS = '23456789'

function randomChar(alphabet: string): string {
  return alphabet[randomInt(alphabet.length)]
}

// Genera una contrasena temporal aleatoria que cumple la politica Media (>=8, letra + numero).
function generateTempPassword(): string {
  const length = 12
  const chars = Array.from({ length }, () => randomChar(TEMP_PASSWORD_ALPHABET))
  const letterIndex = randomInt(length)
  let digitIndex = randomInt(length)
  while (digitIndex === letterIndex) digitIndex = randomInt(length)
  chars[letterIndex] = randomChar(TEMP_PASSWORD_LETTERS)
  chars[digitIndex] = randomChar(TEMP_PASSWORD_DIGITS)
  return chars.join('')
}
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Sesión no válida.' }, { status: 401 })

  // ── Autorización: solo quien puede gestionar equipo ────────────────────────
  const access = await getDealerAccess(user.id)
  if (!access || !access.orgId) {
    return NextResponse.json({ error: 'No tienes una organización asociada.' }, { status: 403 })
  }
  if (!getPermissions(access.role).canManageTeam) {
    return NextResponse.json({ error: 'No tienes permisos para gestionar el equipo.' }, { status: 403 })
  }

  // ── Datos de entrada ───────────────────────────────────────────────────────
  let body: { email?: string; full_name?: string; role?: string }
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Datos inválidos.' }, { status: 400 }) }

  const email     = (body.email ?? '').trim().toLowerCase()
  const fullName  = (body.full_name ?? '').trim()
  const role      = body.role as OrgRole

  if (!EMAIL_RE.test(email)) return NextResponse.json({ error: 'Email no válido.' }, { status: 400 })
  if (!fullName)             return NextResponse.json({ error: 'El nombre es obligatorio.' }, { status: 400 })
  if (!(ASSIGNABLE_ROLES as readonly OrgRole[]).includes(role)) return NextResponse.json({ error: 'Rol no válido.' }, { status: 400 })

  const admin = createAdminClient()

  // maxUsers depende de plan + add-ons (lib/entitlements.ts) — se calcula en la app
  // y se pasa a la RPC, que hace la comprobación y el INSERT en una sola sección
  // crítica (pg_advisory_xact_lock por organización) para que dos altas concurrentes
  // no puedan superar el límite a la vez. Ver migración 094.
  const ent = await getEntitlements(access.orgId)
  const maxUsers = ent?.limits.maxUsers ?? 1

  // ── Reutilizar un usuario de auth existente con este email ─────────────────
  // (p. ej. fue miembro de este u otro showroom antes y se le quitó el acceso sin
  // borrar su cuenta — ver DELETE en [id]/route.ts). Evita el 409 de "email ya
  // existe" y no genera una contraseña nueva: entra con la que ya tiene.
  const existingUser = await findAuthUserByEmail(admin, email)

  if (existingUser) {
    const { data: existingMembership } = await admin
      .from('organization_members')
      .select('id')
      .eq('organization_id', access.orgId)
      .eq('user_id', existingUser.id)
      .maybeSingle()

    if (existingMembership) {
      return NextResponse.json({ error: 'Ese usuario ya es miembro de tu equipo.' }, { status: 409 })
    }

    const { data: newMemberId, error: memberErr } = await admin.rpc('add_team_member_if_under_limit', {
      p_organization_id: access.orgId,
      p_user_id: existingUser.id,
      p_role: role,
      p_max_users: maxUsers,
    })

    if (memberErr) {
      // 23505 = unique_violation (organization_id, user_id): el pre-check de arriba
      // no está dentro del lock de la RPC, así que dos altas concurrentes del MISMO
      // usuario existente pueden pasarlo ambas — la segunda choca aquí, no antes.
      if (memberErr.code === '23505') {
        return NextResponse.json({ error: 'Ese usuario ya es miembro de tu equipo.' }, { status: 409 })
      }
      return NextResponse.json({ error: 'No se pudo vincular el usuario al equipo.' }, { status: 500 })
    }
    if (!newMemberId) {
      return NextResponse.json(
        { error: `Has alcanzado el límite de usuarios de tu plan (${maxUsers}).` },
        { status: 409 },
      )
    }

    return NextResponse.json({ ok: true, email, existingAccount: true })
  }

  // ── Crear el usuario de auth (alta directa, sin email) ─────────────────────
  const password = generateTempPassword()
  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // alta directa: queda confirmado sin enviar correo
    user_metadata: { full_name: fullName, must_change_password: true },
  })

  if (createErr || !created.user) {
    const dup = createErr?.message?.toLowerCase().includes('already')
    return NextResponse.json(
      { error: dup ? 'Ya existe un usuario con ese email.' : 'No se pudo crear el usuario.' },
      { status: dup ? 409 : 500 },
    )
  }

  // ── Vincular a la organización con su rol ──────────────────────────────────
  const { data: newMemberId, error: memberErr } = await admin.rpc('add_team_member_if_under_limit', {
    p_organization_id: access.orgId,
    p_user_id: created.user.id,
    p_role: role,
    p_max_users: maxUsers,
  })

  if (memberErr) {
    // Rollback: si no se pudo vincular, eliminamos el usuario recién creado. Si el
    // propio borrado falla, el usuario queda huérfano (sin membresía) — se registra
    // para poder limpiarlo a mano, ya que aquí no hay cola de reintentos.
    const { error: cleanupErr } = await admin.auth.admin.deleteUser(created.user.id)
    if (cleanupErr) console.error(`[team/members] rollback deleteUser falló para ${created.user.id}:`, cleanupErr)
    return NextResponse.json({ error: 'No se pudo vincular el usuario al equipo.' }, { status: 500 })
  }
  if (!newMemberId) {
    // Límite alcanzado entre la comprobación inicial y este punto (carrera). No se
    // pudo enlazar: el usuario recién creado queda huérfano si lo dejamos, así que
    // se elimina igual que en el resto de fallos de este bloque.
    const { error: cleanupErr } = await admin.auth.admin.deleteUser(created.user.id)
    if (cleanupErr) console.error(`[team/members] rollback deleteUser falló para ${created.user.id}:`, cleanupErr)
    return NextResponse.json(
      { error: `Has alcanzado el límite de usuarios de tu plan (${maxUsers}).` },
      { status: 409 },
    )
  }

  // Devolvemos la contraseña temporal UNA vez para que el propietario la entregue.
  return NextResponse.json({ ok: true, email, password })
}
