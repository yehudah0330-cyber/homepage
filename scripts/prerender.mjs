// 빌드 뒤에 실행: dist/ 안에 페이지별 완성된 HTML 을 만듭니다. (브라우저가 필요 없는 방식)
import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const dist = path.resolve('dist')
const serverDir = path.resolve('dist-server')
const entry = fs.readdirSync(serverDir).find((f) => /^entry-server\.(m?js)$/.test(f))
const { render, pages } = await import(pathToFileURL(path.join(serverDir, entry)).href)
const template = fs.readFileSync(path.join(dist, 'index.html'), 'utf8')
const esc = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')

for (const pg of pages()) {
  const body = render(pg.url)
  let html = template
    .replace('<div id="root"></div>', `<div id="root">${body}</div>`)
    .replace(/<title>.*?<\/title>/s, `<title>${esc(pg.title)}</title>`)
    .replace(/(<meta name="description" content=")[^"]*(")/, `$1${esc(pg.description)}$2`)
    .replace(/(<link rel="canonical" href=")[^"]*(")/, `$1https://bubuhani.com${pg.url === '/' ? '/' : pg.url}$2`)
    .replace(/(<meta property="og:title" content=")[^"]*(")/, `$1${esc(pg.title)}$2`)
    .replace(/(<meta property="og:description" content=")[^"]*(")/, `$1${esc(pg.description)}$2`)
    .replace(/(<meta property="og:url" content=")[^"]*(")/, `$1https://bubuhani.com${pg.url === '/' ? '/' : pg.url}$2`)
  const out = pg.url === '/' ? path.join(dist, 'index.html') : path.join(dist, pg.url, 'index.html')
  fs.mkdirSync(path.dirname(out), { recursive: true })
  fs.writeFileSync(out, html)
  console.log('prerender', pg.url, body.length)
}
fs.rmSync(serverDir, { recursive: true, force: true })
