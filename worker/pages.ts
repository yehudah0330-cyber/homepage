/**
 * 홈페이지 화면 요청 처리 (검색·AI 검색용)
 * - http 와 www 주소는 https://bubuhani.com 으로 옮깁니다.
 * - 없는 주소는 "없음(404)"으로 답합니다.
 * - 원장 칼럼은 서버에서 본문을 채워 보내고, 사이트맵에도 넣습니다.
 */
import { clinic } from '../src/config/clinic'

type Assets = { fetch: (r: Request) => Promise<Response> }
type Col = { id: string; title: string; body: string; date: string }
type Db = { prepare: (q: string) => { bind: (...v: unknown[]) => { first: <T>() => Promise<T | null> }; all: <T>() => Promise<{ results: T[] }> } }
type El = { setInnerContent: (c: string, o?: { html: boolean }) => void; setAttribute: (n: string, v: string) => void }
type Rewriter = { on: (selector: string, h: { element: (e: El) => void }) => Rewriter; transform: (r: Response) => Response }
declare const HTMLRewriter: new () => Rewriter

const ORIGIN = 'https://bubuhani.com'
// 앱에 있는 주소 목록. 화면을 새로 만들면 여기에도 추가해야 합니다 (src/main.tsx).
const ROUTES = new Set([
  '/', '/about', '/about/doctor', '/about/hours', '/about/location', '/column',
  '/app', '/reserve', '/directions', '/hours', '/care', '/doctor', '/my', '/settings', '/privacy',
  '/admin', '/admin/notices', '/admin/columns', '/admin/closed', '/admin/alerts',
  ...clinic.services.map((s) => `/treatment/${s.id}`)
])

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

export function redirect(url: URL): Response | null {
  const local = url.hostname === 'localhost' || url.hostname === '127.0.0.1'
  const www = url.hostname === 'www.bubuhani.com'
  if (local || (url.protocol === 'https:' && !www)) return null
  const to = new URL(url.toString())
  to.protocol = 'https:'
  if (www) to.hostname = 'bubuhani.com'
  return Response.redirect(to.toString(), 301)
}

function notFound(): Response {
  const html = `<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>없는 화면입니다 | ${clinic.name}</title>
<style>body{margin:0;min-height:100vh;display:grid;place-content:center;gap:1rem;text-align:center;padding:2rem;background:#0d1630;color:#f5f0e6;font:20px/1.7 'Malgun Gothic',sans-serif}a{color:#eab458;font-weight:700}</style></head>
<body><h1>찾으시는 화면이 없습니다</h1><p><a href="/">${clinic.name} 첫 화면으로</a></p><p>대표전화 <a href="tel:${clinic.phone.replace(/\D/g, '')}">${clinic.phone}</a></p></body></html>`
  return new Response(html, { status: 404, headers: { 'Content-Type': 'text/html; charset=utf-8', 'X-Content-Type-Options': 'nosniff', 'Strict-Transport-Security': 'max-age=31536000; includeSubDomains' } })
}

async function columns(db: Db): Promise<Col[]> {
  return (await db.prepare('SELECT id, title, body, date FROM columns ORDER BY created_at DESC LIMIT 200').all<Col>()).results
}

/** 미리 만든 첫 화면 틀에 이 화면의 제목·설명·본문을 넣어 보냅니다 */
async function fill(req: Request, assets: Assets, page: { path: string; title: string; description: string; html: string }): Promise<Response> {
  const shell = await assets.fetch(new Request(new URL('/', req.url).toString(), { headers: { Accept: 'text/html' } }))
  const attr = (name: string, value: string) => ({ element: (e: El) => e.setAttribute(name, value) })
  const url = ORIGIN + page.path
  const out = new HTMLRewriter()
    .on('title', { element: (e) => e.setInnerContent(page.title) })
    .on('meta[name="description"]', attr('content', page.description))
    .on('link[rel="canonical"]', attr('href', url))
    .on('meta[property="og:title"]', attr('content', page.title))
    .on('meta[property="og:description"]', attr('content', page.description))
    .on('meta[property="og:url"]', attr('content', url))
    // 첫 화면 전용 "자주 묻는 질문" 정보는 다른 화면에서 비웁니다
    .on('script[data-faq]', { element: (e) => e.setInnerContent('{}') })
    .on('div#root', { element: (e) => e.setInnerContent(page.html, { html: true }) })
    .transform(shell)
  const headers = new Headers(out.headers)
  headers.delete('ETag')
  return new Response(out.body, { status: 200, headers })
}

export async function pageRequest(req: Request, env: { ASSETS: Assets; DB: Db }, url: URL): Promise<Response> {
  const path = url.pathname.replace(/(.)\/$/, '$1')
  try {
    if (path === '/sitemap.xml') {
      const base = await (await env.ASSETS.fetch(req)).text()
      const extra = (await columns(env.DB)).map((c) => `  <url><loc>${ORIGIN}/column/${encodeURIComponent(c.id)}</loc><lastmod>${esc(c.date)}</lastmod></url>\n`).join('')
      return new Response(base.replace('</urlset>', `${extra}</urlset>`), { headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=600' } })
    }
    // 파일 요청인데 파일이 없어 첫 화면이 돌아오면 "없음"
    if (/\.[a-z0-9]+$/i.test(path)) {
      const res = await env.ASSETS.fetch(req)
      return !path.endsWith('.html') && res.headers.get('Content-Type')?.includes('text/html') ? notFound() : res
    }
    if (path === '/column') {
      const list = await columns(env.DB)
      if (list.length) {
        return await fill(req, env.ASSETS, {
          path,
          title: `원장 칼럼 | ${clinic.name} 수원 영통구 한의원`,
          description: `${clinic.name} 원장이 직접 쓰는 건강 이야기.`,
          html: `<main><h1>원장 칼럼</h1><ul>${list.map((c) => `<li><a href="/column/${encodeURIComponent(c.id)}">${esc(c.title)}</a> <time datetime="${esc(c.date)}">${esc(c.date)}</time></li>`).join('')}</ul></main>`
        })
      }
    }
    const m = path.match(/^\/column\/([^/]+)$/)
    if (m) {
      const c = await env.DB.prepare('SELECT id, title, body, date FROM columns WHERE id=?').bind(decodeURIComponent(m[1])).first<Col>()
      if (!c) return notFound()
      const paras = c.body.split(/\n\s*\n/).map((t) => t.trim()).filter(Boolean)
      const ld = JSON.stringify({ '@context': 'https://schema.org', '@type': 'BlogPosting', headline: c.title, datePublished: c.date, inLanguage: 'ko', mainEntityOfPage: `${ORIGIN}${path}`, author: { '@type': 'Organization', name: clinic.name, url: ORIGIN } }).replace(/</g, '\\u003c')
      return await fill(req, env.ASSETS, {
        path,
        title: `${c.title} | ${clinic.name} 원장 칼럼`,
        description: (paras[0] ?? c.title).slice(0, 150),
        html: `<main><article><h1>${esc(c.title)}</h1><time datetime="${esc(c.date)}">${esc(c.date)}</time>${paras.map((t) => `<p>${esc(t)}</p>`).join('')}<p><a href="/column">원장 칼럼 목록</a></p></article><script type="application/ld+json">${ld}</script></main>`
      })
    }
    return ROUTES.has(path) ? await env.ASSETS.fetch(req) : notFound()
  } catch {
    // 문제가 생겨도 홈페이지는 평소처럼 열립니다
    return env.ASSETS.fetch(req)
  }
}
