// Run with node --test scripts/test-security-fixes.cjs. No external services or credentials.
const assert = require('node:assert/strict')
const { test } = require('node:test')
const fs = require('node:fs')
const path = require('node:path')
const ts = require('typescript')
const { NextRequest } = require('next/server')

function load(file, mocks = {}) {
  const source = fs.readFileSync(path.join(__dirname, '..', file), 'utf8')
  const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } })
  const module = { exports: {} }
  const localRequire = (name) => {
    if (Object.hasOwn(mocks, name)) return mocks[name]
    if (name === 'server-only') return {}
    if (name.startsWith('@/')) return load(`${name.slice(2)}.ts`, mocks)
    return require(name)
  }
  new Function('require', 'module', 'exports', outputText)(localRequire, module, module.exports)
  return module.exports
}

const { sanitizeVehiclePayload } = load('lib/vehicle-write.ts')
const { vehicleCreateSchema } = load('lib/vehicle-create-validation.ts')
const validVehicle = { slug: 'porsche-911', brand_name: 'Porsche', model_name: '911', year: 2024, mileage_km: 1000 }
const auth = { createClient: async () => ({ auth: { getUser: async () => ({ data: { user: { id: 'user' } } }) } }) }
const dealerAccess = { getDealerAccess: async () => ({ dealerId: 'dealer', role: 'owner' }) }

test('CSV downloads reject other dealers, traversal, encoded paths and other upload kinds', async () => {
  const csv = load('lib/vehicle-intake/onboarding-csv.ts', { './csv-parse': {}, './normalize': {}, './intake': {} })
  const prefix = 'onboarding/dealer/stock_csv/'
  const invalid = [
    'onboarding/other/stock_csv/123-abc.csv', 'onboarding/dealer2/stock_csv/123-abc.csv',
    `${prefix}../other.csv`, `${prefix}%2e%2e%2fother.csv`, `${prefix}123-abc.csv/../../other`,
    'onboarding/dealer/document/123-abc.csv', `${prefix}123-abc.csv?path=other`,
    `${prefix}123-abc.csv\\..\\other`,
  ]
  const downloaded = []
  const admin = { storage: { from: () => ({ download: async (name) => { downloaded.push(name); return { error: { message: 'test' } } } }) } }
  const ownPath = `${prefix}123-abc.csv`
  await csv.processOnboardingCsv(admin, 'dealer', [...invalid, ownPath].map((name) => ({ path: name })))
  assert.deepEqual(downloaded, [ownPath])
})

test('PATCH leaves the status column absent for every existing status when omitted', async () => {
  assert.equal(Object.hasOwn(sanitizeVehiclePayload({ price: 99 }), 'status'), false)
  for (const status of ['draft', 'pending_review', 'active', 'paused', 'sold']) {
    let updated
    const current = { status, ...validVehicle, images: [{ url: 'https://example.test/car.jpg', order: 0 }] }
    const query = {
      select() { return this }, eq() { return this },
      maybeSingle: async () => ({ data: { id: 'car', dealer_id: 'dealer' } }),
      single: async () => ({ data: current }),
      update(value) { updated = value; return this },
    }
    const route = load('app/api/vehicles/[id]/route.ts', {
      '@/lib/supabase/server': { ...auth, createAdminClient: () => ({ from: () => query }) },
      '@/lib/dealer-access': dealerAccess,
      '@/lib/vehicle-intake/review': { reviewVehicleIntake: async () => ({ issues: [] }) },
      '@/lib/vehicle-intake/intake': { buildAiColumns: () => ({}), resolveStatus: () => 'active' },
    })
    const response = await route.PATCH({ json: async () => ({ price: 99 }) }, { params: Promise.resolve({ id: 'car' }) })
    assert.equal(response.status, 200)
    assert.equal(Object.hasOwn(updated, 'status'), false, status)
    assert.equal((await response.json()).status, status)
  }
  assert.equal(sanitizeVehiclePayload({ status: 'draft' }).status, 'draft')
  assert.equal(sanitizeVehiclePayload({ status: 'active' }).status, 'active')
})

test('POST rejects missing fields and wrong types before any AI call or INSERT', async () => {
  let reviews = 0
  let inserted
  const route = load('app/api/vehicles/route.ts', {
    '@/lib/supabase/server': { ...auth, createAdminClient: () => ({ from: () => ({ insert: (value) => {
      inserted = value
      return { select: () => ({ single: async () => ({ data: { id: 'car' } }) }) }
    } }) }) },
    '@/lib/dealer-access': dealerAccess,
    '@/lib/public-columns': { VEHICLE_PUBLIC_COLUMNS: '' },
    '@/lib/vehicle-intake/review': { reviewVehicleIntake: async () => { reviews++; return {} } },
    '@/lib/vehicle-intake/dedupe': { normalizeVin: () => null },
    '@/lib/vehicle-intake/intake': { buildAiColumns: () => ({}), resolveStatus: (requested) => requested },
  })
  const bad = [null, [], 'invalid', {}, { ...validVehicle, year: '2024' }, { ...validVehicle, mileage_km: 1.5 }]
  for (const key of Object.keys(validVehicle)) {
    const missing = { ...validVehicle }; delete missing[key]; bad.push(missing)
    bad.push({ ...validVehicle, [key]: null })
  }
  for (const [key, value] of Object.entries({ vehicle_type: null, price_on_request: null, national_delivery: null, price: '12', power_hp: {}, fuel_type: 'invalid', description: [], images: 'invalid', equipment: [1], itv_valid_until: '2026-02-30', published_at: 'invalid' })) {
    bad.push({ ...validVehicle, [key]: value })
  }
  for (const payload of bad) {
    const response = await route.POST({ json: async () => payload })
    assert.equal(response.status, 400, JSON.stringify(payload))
  }
  assert.equal(reviews, 0)
  assert.equal(inserted, undefined)
  for (const status of [undefined, 'draft']) {
    const payload = { ...validVehicle, ...(status ? { status } : {}) }
    assert.equal((await route.POST({ json: async () => payload })).status, 200)
    assert.equal(inserted.status, status ?? 'active')
    assert.equal(inserted.vehicle_type, 'car')
  }
  assert.equal(reviews, 2)
  assert.equal(vehicleCreateSchema.safeParse({ ...validVehicle, status: 'draft', images: [], price: null }).success, true)
})

test('Calendar blocks viewer and binds both dashboard and onboarding OAuth to a browser cookie', async () => {
  const env = { GOOGLE_OAUTH_CLIENT_ID: 'test', GOOGLE_OAUTH_STATE_SECRET: 'local-test-secret', NEXT_PUBLIC_APP_URL: 'https://market.test' }
  const previous = Object.fromEntries(Object.keys(env).map((key) => [key, process.env[key]]))
  Object.assign(process.env, env)
  try {
    const calendar = load('lib/google-calendar.ts')
    let role = 'viewer'
    const connect = load('app/api/calendar/google/connect/route.ts', {
      '@/lib/supabase/server': { ...auth, createAdminClient: () => ({ from: () => ({ select: () => ({ eq: () => ({ single: async () => ({ data: { subscription_plan: 'elite' } }) }) }) }) }) },
      '@/lib/dealer-access': { getDealerAccess: async () => ({ dealerId: 'dealer', role }) },
      '@/lib/google-calendar': calendar,
      '@/lib/onboarding/setup-room': { planAllowsGoogleCalendar: () => true, validateSetupToken: async () => ({ ok: true, dealerId: 'dealer' }) },
    })
    assert.equal((await connect.GET(new NextRequest('https://market.test/api/calendar/google/connect'))).status, 403)
    role = 'owner'
    let exchanges = 0
    const callback = load('app/api/calendar/google/callback/route.ts', {
      '@/lib/supabase/server': {},
      '@/lib/google-calendar': { ...calendar, exchangeCodeForTokens: async () => { exchanges++; return null } },
    })
    for (const suffix of ['', '?setup_token=setup']) {
      const response = await connect.GET(new NextRequest(`https://market.test/api/calendar/google/connect${suffix}`))
      const state = new URL(response.headers.get('location')).searchParams.get('state')
      const cookie = response.cookies.get(calendar.GOOGLE_OAUTH_NONCE_COOKIE)
      assert.equal(calendar.verifyOAuthState(state).nonce, cookie.value)
      assert.match(response.headers.get('set-cookie'), /HttpOnly/i)
      assert.match(response.headers.get('set-cookie'), /Max-Age=600/i)
      assert.match(response.headers.get('set-cookie'), /SameSite=lax/i)
      const url = `https://market.test/api/calendar/google/callback?code=test&state=${encodeURIComponent(state)}`
      for (const nonce of [undefined, 'a'.repeat(64), cookie.value]) {
        const before = exchanges
        const result = await callback.GET(new NextRequest(url, { headers: nonce ? { cookie: `${cookie.name}=${nonce}` } : {} }))
        const valid = nonce === cookie.value
        assert.equal(exchanges - before, valid ? 1 : 0)
        assert.equal(new URL(result.headers.get('location')).searchParams.get('calendar_error'), valid ? 'token_exchange_failed' : 'invalid_state')
        assert.match(result.headers.get('set-cookie'), /Max-Age=0/i)
      }
      assert.equal(calendar.verifyOAuthState(`${state.slice(0, -2)}xx`), null)
      assert.equal(calendar.verifyOAuthState(state, -1), null)
    }
  } finally {
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) delete process.env[key]
      else process.env[key] = value
    }
  }
})
