/**
 * 신영통부부한의원 서버 (Cloudflare Worker + D1)
 * - /api/* 만 이 코드가 처리하고, 나머지는 홈페이지 파일(assets)을 그대로 내보냅니다.
 * - /api/admin/* 는 Cloudflare Access 가 붙여 주는 로그인 증명(JWT)을 검증한 뒤에만 열립니다.
 *   설정(ACCESS_TEAM_DOMAIN, ACCESS_AUD)이 비어 있으면 관리자 기능은 닫혀 있습니다.
 */
import { clinic } from '../src/config/clinic'
import { daySlots } from '../src/lib/schedule'

// ── 최소 타입 (외부 타입 패키지 없이 사용) ──
type Stmt = { bind: (...v: unknown[]) => Stmt; first: <T = Record<string, unknown>>() => Promise<T | null>; all: <T = Record<string, unknown>>() => Promise<{ results: T[] }>; run: () => Promise<unknown> }
type D1 = { prepare: (q: string) => Stmt; batch: (s: Stmt[]) => Promise<unknown> }
type Env = { DB: D1; ASSETS: { fetch: (r: Request) => Promise<Response> }; ACCESS_TEAM_DOMAIN?: string; ACCESS_AUD?: string }

const json = (data: unknown, status = 200) => new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' } })
const fail = (msg: string, status = 400) => json({ error: msg }, status)

// ── 시간 (한국 시간 기준) ──
const KST = 'Asia/Seoul'
function kstParts(d = new Date()) {
  const f = new Intl.DateTimeFormat('en-CA', { timeZone: KST, year: 'numeric', month: '2-digit', day: '2-digit' }).format(d)
  return f // YYYY-MM-DD
}
const addDaysISO = (iso: string, n: number) => {
  const [y, m, d] = iso.split('-').map(Number)
  const t = new Date(Date.UTC(y, m - 1, d + n))
  return t.toISOString().slice(0, 10)
}
const isISO = (s: unknown): s is string => typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s)
const isTime = (s: unknown): s is string => typeof s === 'string' && /^\d{2}:\d{2}$/.test(s)
const normPhone = (p: unknown) => String(p ?? '').replace(/\D/g, '')
const validPhone = (p: string) => /^01[016789]\d{7,8}$/.test(p)

// ── 저장소 준비 (처음 한 번 표를 만듭니다) ──
let ready: Promise<void> | null = null
function ensureSchema(db: D1) {
  ready ??= db
    .batch([
      db.prepare('CREATE TABLE IF NOT EXISTS reservations (id TEXT PRIMARY KEY, name TEXT NOT NULL, phone TEXT NOT NULL, date TEXT NOT NULL, time TEXT NOT NULL, status TEXT NOT NULL, created_at TEXT NOT NULL, care_label TEXT, care_end TEXT)'),
      db.prepare('CREATE INDEX IF NOT EXISTS idx_res_date ON reservations(date, time)'),
      db.prepare('CREATE INDEX IF NOT EXISTS idx_res_phone ON reservations(phone)'),
      db.prepare('CREATE TABLE IF NOT EXISTS closed_days (date TEXT PRIMARY KEY, reason TEXT NOT NULL)'),
      db.prepare('CREATE TABLE IF NOT EXISTS notices (id TEXT PRIMARY KEY, text TEXT NOT NULL, created_at TEXT NOT NULL)'),
      db.prepare('CREATE TABLE IF NOT EXISTS columns (id TEXT PRIMARY KEY, title TEXT NOT NULL, body TEXT NOT NULL, date TEXT NOT NULL, created_at TEXT NOT NULL)'),
      db.prepare('CREATE TABLE IF NOT EXISTS notify_off (phone TEXT PRIMARY KEY)'),
      db.prepare('CREATE TABLE IF NOT EXISTS outbox (id TEXT PRIMARY KEY, key TEXT NOT NULL, kind TEXT NOT NULL, to_phone TEXT NOT NULL, channel TEXT NOT NULL, text TEXT NOT NULL, at TEXT NOT NULL, status TEXT NOT NULL)'),
      db.prepare('CREATE TABLE IF NOT EXISTS hits (ip TEXT NOT NULL, at INTEGER NOT NULL)')
    ])
    .then(() => undefined)
  return ready
}

// ── 관리자 확인: Cloudflare Access JWT ──
type Jwk = { kid: string; n: string; e: string; kty: string; alg?: string }
let certCache: { at: number; keys: Jwk[] } | null = null
const b64 = (s: string) => Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(s.length / 4) * 4, '=')), (c) => c.charCodeAt(0))

async function isAdmin(req: Request, env: Env): Promise<boolean> {
  const team = env.ACCESS_TEAM_DOMAIN
  const aud = env.ACCESS_AUD
  if (!team || !aud) return false
  const token = req.headers.get('Cf-Access-Jwt-Assertion')
  if (!token) return false
  const [h, p, s] = token.split('.')
  if (!h || !p || !s) return false
  try {
    const head = JSON.parse(new TextDecoder().decode(b64(h))) as { kid: string; alg: string }
    const body = JSON.parse(new TextDecoder().decode(b64(p))) as { aud: string[] | string; exp: number; iss: string }
    if (head.alg !== 'RS256') return false
    if (body.iss !== `https://${team}`) return false
    const audOk = Array.isArray(body.aud) ? body.aud.includes(aud) : body.aud === aud
    if (!audOk || body.exp * 1000 < Date.now()) return false
    if (!certCache || Date.now() - certCache.at > 3600_000) {
      const r = await fetch(`https://${team}/cdn-cgi/access/certs`)
      certCache = { at: Date.now(), keys: ((await r.json()) as { keys: Jwk[] }).keys }
    }
    const jwk = certCache.keys.find((k) => k.kid === head.kid)
    if (!jwk) return false
    const key = await crypto.subtle.importKey('jwk', jwk as JsonWebKey, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['verify'])
    return await crypto.subtle.verify('RSASSA-PKCS1-v1_5', key, b64(s), new TextEncoder().encode(`${h}.${p}`))
  } catch {
    return false
  }
}

// ── 남용 방지: 같은 접속지에서 10분에 20번까지만 쓰기 ──
async function limited(db: D1, req: Request): Promise<boolean> {
  const ip = req.headers.get('CF-Connecting-IP') ?? 'unknown'
  const now = Date.now()
  await db.prepare('DELETE FROM hits WHERE at < ?').bind(now - 3600_000).run()
  const row = await db.prepare('SELECT COUNT(*) AS n FROM hits WHERE ip = ? AND at > ?').bind(ip, now - 600_000).first<{ n: number }>()
  if ((row?.n ?? 0) >= 20) return true
  await db.prepare('INSERT INTO hits (ip, at) VALUES (?, ?)').bind(ip, now).run()
  return false
}

// ── 변환 ──
type ResRow = { id: string; name: string; phone: string; date: string; time: string; status: string; created_at: string; care_label: string | null; care_end: string | null }
const toRes = (r: ResRow) => ({
  id: r.id, name: r.name, phone: r.phone, date: r.date, time: r.time, status: r.status, createdAt: r.created_at,
  ...(r.care_label && r.care_end ? { nextCare: { label: r.care_label, endDate: r.care_end } } : {})
})
const uid = () => crypto.randomUUID().replace(/-/g, '').slice(0, 16)
async function readJson<T>(req: Request): Promise<T | null> {
  try {
    return (await req.json()) as T
  } catch {
    return null
  }
}
const str = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '')

async function used(db: D1, date: string, time: string, ignoreId?: string) {
  const r = await db.prepare("SELECT COUNT(*) AS n FROM reservations WHERE status='confirmed' AND date=? AND time=? AND id<>?").bind(date, time, ignoreId ?? '').first<{ n: number }>()
  return r?.n ?? 0
}
async function slotError(db: D1, date: string, time: string, ignoreId?: string): Promise<string | null> {
  const today = kstParts()
  if (date < today || date > addDaysISO(today, clinic.bookingDays)) return '예약할 수 없는 날짜예요.'
  if ((await db.prepare('SELECT 1 AS x FROM closed_days WHERE date=?').bind(date).first()) ) return '그날은 쉬는 날이에요.'
  if (!daySlots(date).includes(time)) return '예약할 수 없는 시간이에요.'
  if ((await used(db, date, time, ignoreId)) >= clinic.capacityPerSlot) return '방금 다른 분이 예약하셨어요. 다른 시간을 골라 주세요.'
  return null
}

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const url = new URL(req.url)
    if (!url.pathname.startsWith('/api/')) return env.ASSETS.fetch(req)
    try {
      await ensureSchema(env.DB)
      return await route(req, env, url)
    } catch {
      return fail('서버에 문제가 생겼어요. 잠시 후 다시 시도해 주세요.', 500)
    }
  }
}

async function route(req: Request, env: Env, url: URL): Promise<Response> {
  const db = env.DB
  const m = req.method
  const parts = url.pathname.split('/').filter(Boolean).slice(1) // api 다음부터
  const [a, b, c] = parts

  // 쓰기 요청은 접속지당 횟수 제한 (관리자 제외)
  const admin = a === 'admin'
  if (admin && !(await isAdmin(req, env))) return fail('관리자 로그인이 필요해요.', 403)
  if (!admin && m !== 'GET' && (await limited(db, req))) return fail('요청이 너무 많아요. 잠시 후 다시 시도해 주세요.', 429)

  // ───── 공개 ─────
  if (a === 'closed-days' && m === 'GET') {
    const rows = (await db.prepare('SELECT date, reason FROM closed_days ORDER BY date').all<{ date: string; reason: string }>()).results
    return json(Object.fromEntries(rows.map((r) => [r.date, r.reason])))
  }
  if (a === 'availability' && m === 'GET') {
    const date = url.searchParams.get('date')
    if (!isISO(date)) return fail('날짜가 올바르지 않아요.')
    if (await db.prepare('SELECT 1 AS x FROM closed_days WHERE date=?').bind(date).first()) return json({})
    const rows = (await db.prepare("SELECT time, COUNT(*) AS n FROM reservations WHERE status='confirmed' AND date=? GROUP BY time").bind(date).all<{ time: string; n: number }>()).results
    const cnt = new Map(rows.map((r) => [r.time, r.n]))
    const out: Record<string, number> = {}
    for (const t of daySlots(date)) out[t] = Math.max(0, clinic.capacityPerSlot - (cnt.get(t) ?? 0))
    return json(out)
  }
  if (a === 'reservations' && !b && m === 'POST') {
    const body = await readJson<{ name?: string; phone?: string; date?: string; time?: string }>(req)
    const name = str(body?.name, 30)
    const phone = normPhone(body?.phone)
    if (!name) return fail('이름을 입력해 주세요.')
    if (!validPhone(phone)) return fail('전화번호를 확인해 주세요.')
    if (!isISO(body?.date) || !isTime(body?.time)) return fail('날짜와 시간을 확인해 주세요.')
    const pending = await db.prepare("SELECT COUNT(*) AS n FROM reservations WHERE phone=? AND status='confirmed' AND date>=?").bind(phone, kstParts()).first<{ n: number }>()
    if ((pending?.n ?? 0) >= 5) return fail('예정된 예약이 너무 많아요. 전화로 문의해 주세요.')
    const err = await slotError(db, body.date, body.time)
    if (err) return fail(err, 409)
    const row: ResRow = { id: uid(), name, phone, date: body.date, time: body.time, status: 'confirmed', created_at: new Date().toISOString(), care_label: null, care_end: null }
    await db.prepare('INSERT INTO reservations (id,name,phone,date,time,status,created_at) VALUES (?,?,?,?,?,?,?)').bind(row.id, name, phone, row.date, row.time, 'confirmed', row.created_at).run()
    return json(toRes(row))
  }
  if (a === 'reservations' && b === 'lookup' && m === 'GET') {
    const name = str(url.searchParams.get('name'), 30)
    const phone = normPhone(url.searchParams.get('phone'))
    if (!name || !validPhone(phone)) return json([])
    const rows = (await db.prepare('SELECT * FROM reservations WHERE phone=? AND name=? ORDER BY date, time').bind(phone, name).all<ResRow>()).results
    return json(rows.map(toRes))
  }
  if (a === 'reservations' && b && c === 'cancel' && m === 'POST') {
    const r = await db.prepare('SELECT * FROM reservations WHERE id=?').bind(b).first<ResRow>()
    if (!r) return fail('예약을 찾을 수 없어요.', 404)
    await db.prepare("UPDATE reservations SET status='cancelled' WHERE id=?").bind(b).run()
    return json(toRes({ ...r, status: 'cancelled' }))
  }
  if (a === 'reservations' && b && !c && m === 'PATCH') {
    const body = await readJson<{ date?: string; time?: string }>(req)
    if (!isISO(body?.date) || !isTime(body?.time)) return fail('날짜와 시간을 확인해 주세요.')
    const r = await db.prepare('SELECT * FROM reservations WHERE id=?').bind(b).first<ResRow>()
    if (!r) return fail('예약을 찾을 수 없어요.', 404)
    const err = await slotError(db, body.date, body.time, b)
    if (err) return fail(err, 409)
    await db.prepare("UPDATE reservations SET date=?, time=?, status='confirmed' WHERE id=?").bind(body.date, body.time, b).run()
    return json(toRes({ ...r, date: body.date, time: body.time, status: 'confirmed' }))
  }
  if (a === 'notices' && m === 'GET') {
    const rows = (await db.prepare('SELECT * FROM notices ORDER BY created_at DESC LIMIT 20').all<{ id: string; text: string; created_at: string }>()).results
    return json(rows.map((r) => ({ id: r.id, text: r.text, createdAt: r.created_at })))
  }
  if (a === 'columns' && m === 'GET') {
    const rows = (await db.prepare('SELECT * FROM columns ORDER BY created_at DESC LIMIT 200').all<{ id: string; title: string; body: string; date: string; created_at: string }>()).results
    return json(rows.map((r) => ({ id: r.id, title: r.title, body: r.body, date: r.date, createdAt: r.created_at })))
  }
  if (a === 'notify' && m === 'GET') {
    const phone = normPhone(url.searchParams.get('phone'))
    const off = await db.prepare('SELECT 1 AS x FROM notify_off WHERE phone=?').bind(phone).first()
    return json({ on: !off })
  }
  if (a === 'notify' && m === 'PUT') {
    const body = await readJson<{ phone?: string; on?: boolean }>(req)
    const phone = normPhone(body?.phone)
    if (!validPhone(phone)) return fail('전화번호를 확인해 주세요.')
    if (body?.on) await db.prepare('DELETE FROM notify_off WHERE phone=?').bind(phone).run()
    else await db.prepare('INSERT OR IGNORE INTO notify_off (phone) VALUES (?)').bind(phone).run()
    return json({ ok: true })
  }
  if (a === 'outbox' && m === 'POST') {
    const body = await readJson<{ key?: string; kind?: string; to?: string; channel?: string; text?: string; status?: string }>(req)
    const to = normPhone(body?.to)
    if (!validPhone(to) || !body?.text) return fail('보낼 내용을 확인해 주세요.')
    await db.prepare('INSERT INTO outbox (id,key,kind,to_phone,channel,text,at,status) VALUES (?,?,?,?,?,?,?,?)')
      .bind(uid(), str(body.key, 100), str(body.kind, 20), to, str(body.channel, 20) || 'alimtalk', str(body.text, 500), new Date().toISOString(), 'preview').run()
    return json({ ok: true })
  }

  // ───── 관리자 (Cloudflare Access 로그인 필요) ─────
  if (admin) {
    const [, x, y, z] = parts
    if (x === 'reservations' && !y && m === 'GET') {
      const rows = (await db.prepare('SELECT * FROM reservations ORDER BY date, time').all<ResRow>()).results
      return json(rows.map(toRes))
    }
    if (x === 'reservations' && y && z === 'next-care' && m === 'PUT') {
      const care = await readJson<{ label?: string; endDate?: string } | null>(req)
      if (care && isISO(care.endDate)) await db.prepare('UPDATE reservations SET care_label=?, care_end=? WHERE id=?').bind(str(care.label, 50), care.endDate, y).run()
      else await db.prepare('UPDATE reservations SET care_label=NULL, care_end=NULL WHERE id=?').bind(y).run()
      return json({ ok: true })
    }
    if (x === 'closed-days' && !y && m === 'POST') {
      const body = await readJson<{ date?: string; reason?: string }>(req)
      if (!isISO(body?.date)) return fail('날짜가 올바르지 않아요.')
      await db.prepare('INSERT OR REPLACE INTO closed_days (date, reason) VALUES (?, ?)').bind(body.date, str(body.reason, 50)).run()
      return json({ ok: true })
    }
    if (x === 'closed-days' && y && m === 'DELETE') {
      await db.prepare('DELETE FROM closed_days WHERE date=?').bind(y).run()
      return json({ ok: true })
    }
    if (x === 'notices' && !y && m === 'POST') {
      const body = await readJson<{ id?: string; text?: string }>(req)
      const text = str(body?.text, 300)
      if (!text) return fail('공지 내용을 입력해 주세요.')
      if (body?.id) await db.prepare('UPDATE notices SET text=? WHERE id=?').bind(text, body.id).run()
      else await db.prepare('INSERT INTO notices (id,text,created_at) VALUES (?,?,?)').bind(uid(), text, new Date().toISOString()).run()
      return json({ ok: true })
    }
    if (x === 'notices' && y && m === 'DELETE') {
      await db.prepare('DELETE FROM notices WHERE id=?').bind(y).run()
      return json({ ok: true })
    }
    if (x === 'columns' && !y && m === 'POST') {
      const body = await readJson<{ id?: string; title?: string; body?: string }>(req)
      const title = str(body?.title, 100)
      const text = str(body?.body, 10000)
      if (!title || !text) return fail('제목과 내용을 입력해 주세요.')
      if (body?.id) await db.prepare('UPDATE columns SET title=?, body=? WHERE id=?').bind(title, text, body.id).run()
      else await db.prepare('INSERT INTO columns (id,title,body,date,created_at) VALUES (?,?,?,?,?)').bind(uid(), title, text, kstParts(), new Date().toISOString()).run()
      return json({ ok: true })
    }
    if (x === 'columns' && y && m === 'DELETE') {
      await db.prepare('DELETE FROM columns WHERE id=?').bind(y).run()
      return json({ ok: true })
    }
    if (x === 'outbox' && m === 'GET') {
      const rows = (await db.prepare('SELECT * FROM outbox ORDER BY at DESC LIMIT 200').all<{ id: string; key: string; kind: string; to_phone: string; channel: string; text: string; at: string; status: string }>()).results
      return json(rows.map((r) => ({ id: r.id, key: r.key, kind: r.kind, to: r.to_phone, channel: r.channel, text: r.text, at: r.at, status: r.status })))
    }
  }
  return fail('찾을 수 없어요.', 404)
}
