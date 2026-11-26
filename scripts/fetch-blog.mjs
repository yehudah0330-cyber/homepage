// 네이버 블로그 RSS에서 "한의원 이야기" 분류의 최신 글 3개를 src/data/blog.json 에 저장합니다.
// 가져오지 못하거나 글이 하나도 없으면 기존 파일을 그대로 두고 실패로 끝냅니다.
import fs from 'node:fs'

const BLOG_ID = 'caccactus'
const CATEGORY = '한의원 이야기' // 이 분류만 홈페이지에 보입니다 (개인 글 제외)
const COUNT = 3
const OUT = new URL('../src/data/blog.json', import.meta.url)

const res = await fetch(`https://rss.blog.naver.com/${BLOG_ID}.xml`, { signal: AbortSignal.timeout(30000) })
if (!res.ok) throw new Error(`블로그 RSS를 가져오지 못했습니다 (HTTP ${res.status})`)
const xml = await res.text()

const field = (item, tag) => {
  const m = item.match(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`))
  return m ? m[1].replace(/^\s*<!\[CDATA\[([\s\S]*?)\]\]>\s*$/, '$1').trim() : ''
}

const posts = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)]
  .map(([, item]) => ({
    category: field(item, 'category'),
    title: field(item, 'title'),
    url: field(item, 'link').split('?')[0],
    time: new Date(field(item, 'pubDate')).getTime(),
  }))
  .filter((p) => p.category === CATEGORY && p.title && p.time && p.url.startsWith(`https://blog.naver.com/${BLOG_ID}/`))
  .sort((a, b) => b.time - a.time)
  .slice(0, COUNT)
  // 날짜는 한국 시간 기준
  .map((p) => ({ title: p.title, url: p.url, date: new Date(p.time + 9 * 3600e3).toISOString().slice(0, 10) }))

if (posts.length === 0) throw new Error(`"${CATEGORY}" 분류의 글이 없습니다. 기존 목록을 유지합니다.`)

fs.writeFileSync(OUT, JSON.stringify(posts, null, 2) + '\n')
console.log(posts.map((p) => `${p.date} ${p.title}`).join('\n'))
