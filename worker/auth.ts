/**
 * 관리자 비밀번호 로그인
 * - 비밀번호는 Cloudflare 의 비밀값 ADMIN_PASSWORD 에만 둡니다 (코드·화면에 적지 않음). 8자 미만이면 잠긴 채로 둡니다.
 * - 로그인하면 서명한 쿠키를 줍니다. "모든 기기 로그아웃"을 누르면 이전 쿠키는 모두 무효가 됩니다.
 * - 같은 접속지에서 15분에 5번, 전체에서 1시간에 30번 틀리면 잠시 막습니다.
 */
type Stmt = { bind: (...v: unknown[]) => Stmt; first: <T = Record<string, unknown>>() => Promise<T | null>; run: () => Promise<unknown> }
type Db = { prepare: (q: string) => Stmt }
export type AuthEnv = { DB: Db; ADMIN_PASSWORD?: string }

const COOKIE = '__Host-adm'
const enc = new TextEncoder()
const hex = (b: ArrayBuffer) => [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, '0')).join('')

export const passwordReady = (env: AuthEnv) => (env.ADMIN_PASSWORD?.length ?? 0) >= 8

async function sign(secret: string, text: string) {
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  return hex(await crypto.subtle.sign('HMAC', key, enc.encode(text)))
}
// 길이와 내용을 시간 차이 없이 비교
function same(a: string, b: string) {
  let d = a.length ^ b.length
  for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i % (b.length || 1))
  return d === 0
}
const version = async (db: Db) => (await db.prepare("SELECT v FROM admin_state WHERE k='session'").first<{ v: string }>())?.v ?? '1'

export async function hasSession(req: Request, env: AuthEnv): Promise<boolean> {
  if (!passwordReady(env)) return false
  const raw = (req.headers.get('Cookie') ?? '').split(/;\s*/).find((c) => c.startsWith(COOKIE + '='))
  if (!raw) return false
  const [exp, ver, mac] = raw.slice(COOKIE.length + 1).split('.')
  if (!exp || !ver || !mac || Number(exp) < Date.now()) return false
  if (!same(mac, await sign(env.ADMIN_PASSWORD!, `${exp}.${ver}`))) return false
  return ver === (await version(env.DB))
}

const cookie = (value: string, maxAge?: number) => `${COOKIE}=${value}; Path=/; HttpOnly; Secure; SameSite=Strict${maxAge === undefined ? '' : `; Max-Age=${maxAge}`}`

export async function login(env: AuthEnv, ip: string, password: string, remember: boolean): Promise<{ status: number; error?: string; cookie?: string }> {
  if (!passwordReady(env)) return { status: 503, error: '관리자 비밀번호가 아직 설정되지 않았어요. (8자 이상)' }
  const now = Date.now()
  await env.DB.prepare('DELETE FROM login_fails WHERE at < ?').bind(now - 3600_000).run()
  const mine = await env.DB.prepare('SELECT COUNT(*) AS n FROM login_fails WHERE ip=? AND at>?').bind(ip, now - 900_000).first<{ n: number }>()
  const all = await env.DB.prepare('SELECT COUNT(*) AS n FROM login_fails').first<{ n: number }>()
  if ((mine?.n ?? 0) >= 5 || (all?.n ?? 0) >= 30) return { status: 429, error: '여러 번 틀려서 잠시 막혔어요. 15분 뒤에 다시 해 주세요.' }
  const secret = env.ADMIN_PASSWORD!
  if (!same(await sign(secret, 'pw:' + password), await sign(secret, 'pw:' + secret))) {
    await env.DB.prepare('INSERT INTO login_fails (ip, at) VALUES (?, ?)').bind(ip, now).run()
    return { status: 401, error: '비밀번호가 맞지 않아요.' }
  }
  const age = remember ? 30 * 86400 : 12 * 3600
  const exp = String(now + age * 1000)
  const ver = await version(env.DB)
  const value = `${exp}.${ver}.${await sign(secret, `${exp}.${ver}`)}`
  return { status: 200, cookie: cookie(value, remember ? age : undefined) }
}

export const logoutCookie = () => cookie('', 0)
export async function logoutAll(db: Db) {
  await db.prepare("INSERT INTO admin_state (k, v) VALUES ('session', ?) ON CONFLICT(k) DO UPDATE SET v=excluded.v").bind(String(Date.now())).run()
}
